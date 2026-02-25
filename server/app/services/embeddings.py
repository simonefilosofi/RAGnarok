from functools import lru_cache

import numpy as np
from sentence_transformers import SentenceTransformer

MODEL_NAME = "BAAI/bge-small-en-v1.5"

# BGE models use an instruction prefix for queries only (not for documents).
# This shifts the query embedding toward the retrieval task rather than
# generic semantic similarity, which improves recall.
BGE_QUERY_PREFIX = "Represent this sentence for searching relevant passages: "


@lru_cache(maxsize=1)
def _get_model() -> SentenceTransformer:
    return SentenceTransformer(MODEL_NAME)


def embed_query(text: str) -> list[float]:
    """Embed a user query with the BGE retrieval prefix."""
    model = _get_model()
    prefixed = BGE_QUERY_PREFIX + text
    embedding: np.ndarray = model.encode(prefixed, normalize_embeddings=True)
    return embedding.tolist()


def embed_text(text: str) -> list[float]:
    """Embed a document passage (no prefix) and return a normalised float list."""
    model = _get_model()
    embedding: np.ndarray = model.encode(text, normalize_embeddings=True)
    return embedding.tolist()


def embed_batch(texts: list[str]) -> list[list[float]]:
    """Embed multiple document passages in one forward pass (no prefix)."""
    model = _get_model()
    embeddings: np.ndarray = model.encode(texts, normalize_embeddings=True, batch_size=32)
    return embeddings.tolist()
