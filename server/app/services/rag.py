from collections.abc import AsyncGenerator

from .embeddings import embed_query
from .llm import stream_completion
from .reranker import deduplicate_chunks, rerank_chunks
from .vector_store import get_supabase_client, match_documents_rpc

def _citation_label(metadata: dict) -> str:
    """Build a human-readable citation label from chunk metadata."""
    source = metadata.get("source", "Unknown")
    page = metadata.get("page")
    if page is not None:
        return f"{source}, p.{page}"
    return source


SYSTEM_PROMPT = """\
You are a precise document assistant. Answer questions based strictly on the provided source excerpts.

Guidelines:
- Use ONLY information present in the sources. Never invent or infer facts not explicitly stated.
- Cite inline immediately after each claim using the file name and page, e.g. "The deadline is 31 December [report.pdf, p.4]."
- For web sources, cite the URL instead: "According to the policy [https://example.com]."
- If multiple sources support a claim, cite all of them: [report.pdf, p.4][contract.pdf, p.12].
- If the answer is partially covered, answer what the sources support and clearly state what is missing.
- If the answer is not in the sources at all, respond: "I couldn't find this in your documents." Do not guess.
- When sources conflict, prefer those with a higher relevance score.
- Be concise and direct. Skip preamble like "Based on the context..." — just answer.
- Use markdown (bold, bullet points) only when it genuinely improves clarity.\
"""


async def rag_stream(
    user_jwt: str,
    groq_key: str,
    question: str,
    match_count: int = 5,
    match_threshold: float = 0.5,
) -> AsyncGenerator[str, None]:
    """
    Full RAG pipeline:
    1. Embed the question
    2. Retrieve 2x candidate chunks via vector search (wide net)
    3. Rerank candidates with a cross-encoder, keep top match_count
    4. Build prompt with sources
    5. Stream Groq response back to the caller
    """
    # Step 1 — embed query with the bi-encoder
    query_embedding = embed_query(question)

    # Step 2 — vector search: retrieve 2× candidates so the reranker has more
    # material to work with. Lowering the threshold slightly compensates for the
    # wider retrieval; the reranker will filter noise in the next step.
    client = get_supabase_client(user_jwt)
    candidates = await match_documents_rpc(
        client,
        query_embedding,
        match_count=match_count * 2,
        match_threshold=max(match_threshold - 0.1, 0.0),
    )

    # Step 3 — rerank: cross-encoder scores every (question, chunk) pair and
    # returns the top match_count chunks sorted by relevance score descending.
    chunks = rerank_chunks(question, candidates, top_n=match_count)

    # Step 3b — deduplicate: drop near-identical chunks so the LLM receives
    # diverse context rather than slight variations of the same passage.
    chunks = deduplicate_chunks(chunks)

    # Step 4 — build prompt
    if chunks:
        context_parts = [
            f"[{_citation_label(c['metadata'])}] (relevance: {c['reranker_score']:.2f})\n{c['content']}"
            for c in chunks
        ]
        context_block = "\n\n---\n\n".join(context_parts)
        user_message = f"Context:\n{context_block}\n\nQuestion: {question}"
    else:
        user_message = (
            f"No relevant documents were found in your knowledge base.\n\nQuestion: {question}"
        )

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_message},
    ]

    # Step 5 — stream LLM response
    async for token in stream_completion(groq_key, messages):
        yield token
