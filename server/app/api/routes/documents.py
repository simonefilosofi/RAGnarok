import asyncio

from fastapi import APIRouter, BackgroundTasks, Depends, Form, HTTPException, UploadFile, status
from pydantic import BaseModel

from ...core.security import get_user_id
from ...services.document_processor import process_pdf, process_url
from ...services.vector_store import get_supabase_client, insert_chunks

router = APIRouter(prefix="/documents", tags=["documents"])


class URLIngestRequest(BaseModel):
    url: str
    title: str | None = None


async def _process_and_store(
    document_id: str,
    user_id: str,
    user_jwt: str,
    chunks_coro,
) -> None:
    """Background task: process document, embed chunks, update status."""
    client = get_supabase_client(user_jwt)
    try:
        chunks = await chunks_coro
        await insert_chunks(client, document_id, user_id, chunks)
        client.table("documents").update({"status": "ready"}).eq("id", document_id).execute()
    except Exception:
        client.table("documents").update({"status": "error"}).eq("id", document_id).execute()
        raise


@router.post("/upload", status_code=status.HTTP_202_ACCEPTED)
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile,
    title: str | None = Form(default=None),
    auth: tuple = Depends(get_user_id),
) -> dict:
    user_jwt, user_id = auth

    if file.content_type not in ("application/pdf", "application/octet-stream"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    file_bytes = await file.read()
    client = get_supabase_client(user_jwt)

    doc_title = title.strip() if title and title.strip() else (file.filename or "Untitled")

    # Insert document row immediately with status=processing
    result = (
        client.table("documents")
        .insert(
            {
                "user_id": user_id,
                "title": doc_title,
                "source_type": "pdf",
                "status": "processing",
            }
        )
        .execute()
    )
    document_id: str = result.data[0]["id"]

    background_tasks.add_task(
        _process_and_store,
        document_id,
        user_id,
        user_jwt,
        process_pdf(file_bytes, doc_title),
    )

    return {"document_id": document_id, "status": "processing"}


@router.post("/ingest-url", status_code=status.HTTP_202_ACCEPTED)
async def ingest_url(
    body: URLIngestRequest,
    background_tasks: BackgroundTasks,
    auth: tuple = Depends(get_user_id),
) -> dict:
    user_jwt, user_id = auth
    client = get_supabase_client(user_jwt)

    result = (
        client.table("documents")
        .insert(
            {
                "user_id": user_id,
                "title": body.title or body.url,
                "source_type": "url",
                "source_url": body.url,
                "status": "processing",
            }
        )
        .execute()
    )
    document_id: str = result.data[0]["id"]

    background_tasks.add_task(
        _process_and_store,
        document_id,
        user_id,
        user_jwt,
        process_url(body.url),
    )

    return {"document_id": document_id, "status": "processing"}


@router.get("")
async def list_documents(auth: tuple = Depends(get_user_id)) -> list[dict]:
    user_jwt, _ = auth
    client = get_supabase_client(user_jwt)
    result = (
        client.table("documents")
        .select("id, title, source_type, source_url, status, created_at")
        .order("created_at", desc=True)
        .execute()
    )
    return result.data or []


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    document_id: str,
    auth: tuple = Depends(get_user_id),
) -> None:
    user_jwt, _ = auth
    client = get_supabase_client(user_jwt)
    # RLS ensures only the owner can delete
    client.table("documents").delete().eq("id", document_id).execute()
