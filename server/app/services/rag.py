from collections.abc import AsyncGenerator

from .embeddings import embed_text
from .llm import stream_completion
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
    2. Retrieve matching chunks via RPC (RLS enforced)
    3. Build prompt with sources
    4. Stream Groq response back to the caller
    """
    # Step 1 — embed query
    query_embedding = embed_text(question)

    # Step 2 — vector search (user's data only thanks to RLS)
    client = get_supabase_client(user_jwt)
    chunks = await match_documents_rpc(client, query_embedding, match_count, match_threshold)

    # Step 3 — build prompt
    if chunks:
        context_parts = [
            f"[Source {i + 1}] (similarity: {c['similarity']:.2f})\n{c['content']}"
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

    # Step 4 — stream LLM response
    async for token in stream_completion(groq_key, messages):
        yield token
