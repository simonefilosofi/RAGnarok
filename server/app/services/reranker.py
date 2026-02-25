from functools import lru_cache

from sentence_transformers import CrossEncoder

# ms-marco-MiniLM-L-6-v2 is a 6-layer cross-encoder trained on MS MARCO passage
# ranking. It scores (query, passage) pairs and outputs a single relevance logit.
# Higher score = more relevant. Scores are NOT bounded to [0, 1].
RERANKER_MODEL = "cross-encoder/ms-marco-MiniLM-L-6-v2"


@lru_cache(maxsize=1)
def _get_reranker() -> CrossEncoder:
    """Load the cross-encoder once and keep it in memory."""
    return CrossEncoder(RERANKER_MODEL)


def rerank_chunks(question: str, chunks: list[dict], top_n: int = 5) -> list[dict]:
    """
    Re-score retrieved chunks with a cross-encoder and return the top_n most
    relevant ones sorted by score descending.

    The cross-encoder reads (question, chunk_content) as a single sequence so it
    can model fine-grained relevance that the bi-encoder misses.

    Args:
        question:  The original user query.
        chunks:    Chunk dicts returned by match_documents_rpc, each must have
                   a "content" key.
        top_n:     How many chunks to keep after reranking.

    Returns:
        Subset of chunks (≤ top_n) sorted by reranker_score descending.
        Each dict gains a "reranker_score" key (raw logit, higher = better).
    """
    if not chunks:
        return chunks

    reranker = _get_reranker()

    # Build (query, passage) pairs — one per candidate chunk
    pairs = [(question, chunk["content"]) for chunk in chunks]

    # predict() runs the cross-encoder forward pass on all pairs in one batch
    scores: list[float] = reranker.predict(pairs).tolist()

    # Attach score to each chunk dict (mutating a copy is fine; dicts from RPC
    # are not reused elsewhere)
    for chunk, score in zip(chunks, scores):
        chunk["reranker_score"] = float(score)

    # Sort descending by cross-encoder score and return top_n
    ranked = sorted(chunks, key=lambda c: c["reranker_score"], reverse=True)
    return ranked[:top_n]


def deduplicate_chunks(chunks: list[dict], threshold: float = 0.72) -> list[dict]:
    """
    Remove near-duplicate chunks using Jaccard similarity on word sets.

    Chunks must be sorted best-first (reranker score descending). Each chunk is
    kept only if its word overlap with every already-kept chunk is below the
    threshold, ensuring the LLM receives diverse context rather than slight
    variations of the same passage.

    Args:
        chunks:     Chunk dicts sorted by relevance descending.
        threshold:  Jaccard similarity above which a chunk is considered a
                    duplicate and dropped (0.72 = 72% word overlap).

    Returns:
        Deduplicated list preserving the original order.
    """
    kept: list[dict] = []
    kept_word_sets: list[set[str]] = []

    for chunk in chunks:
        words = set(chunk["content"].lower().split())
        union_sizes = [len(words | s) for s in kept_word_sets]
        is_duplicate = any(
            len(words & s) / u >= threshold
            for s, u in zip(kept_word_sets, union_sizes)
            if u > 0
        )
        if not is_duplicate:
            kept.append(chunk)
            kept_word_sets.append(words)

    return kept
