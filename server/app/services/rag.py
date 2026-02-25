from collections.abc import AsyncGenerator

from .embeddings import embed_text
from .llm import stream_completion
from .reranker import rerank_chunks
from .vector_store import get_supabase_client, match_documents_rpc

SYSTEM_PROMPT = (
    "You are a helpful AI assistant. Answer the user's question using ONLY the provided "
    "context sources. If the answer is not in the sources, say so clearly. "
    "Cite sources by their number, e.g. [Source 1]."
)


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
    query_embedding = embed_text(question)

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

    # Step 4 — build prompt
    if chunks:
        context_parts = [
            f"[Source {i + 1}] (relevance: {c['reranker_score']:.2f})\n{c['content']}"
            for i, c in enumerate(chunks)
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
