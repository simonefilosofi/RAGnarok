from supabase import Client, create_client

from ..core.config import settings
from .document_processor import TextChunk
from .embeddings import embed_batch


def get_supabase_client(user_jwt: str) -> Client:
    """
    Create a Supabase client authenticated as the end user.
    Setting the auth header activates RLS policies.
    """
    client: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)
    client.postgrest.auth(user_jwt)
    return client


async def insert_chunks(
    client: Client,
    document_id: str,
    user_id: str,
    chunks: list[TextChunk],
) -> None:
    """Embed all chunks and bulk-insert them into document_chunks."""
    if not chunks:
        return

    texts = [c.content for c in chunks]
    embeddings = embed_batch(texts)

    rows = [
        {
            "document_id": document_id,
            "user_id": user_id,
            "content": chunk.content,
            "metadata": chunk.metadata,
            "embedding": embedding,
        }
        for chunk, embedding in zip(chunks, embeddings)
    ]

    client.table("document_chunks").insert(rows).execute()


async def match_documents_rpc(
    client: Client,
    query_embedding: list[float],
    match_count: int = 5,
    match_threshold: float = 0.5,
) -> list[dict]:
    """Call the match_documents Postgres function via RPC."""
    result = client.rpc(
        "match_documents",
        {
            "query_embedding": query_embedding,
            "match_count": match_count,
            "match_threshold": match_threshold,
        },
    ).execute()
    return result.data or []
