import json

from fastapi import APIRouter, Depends, Header
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from ...core.security import get_user_id, validate_llm_key
from ...services.rag import rag_stream

router = APIRouter(prefix="/chat", tags=["chat"])


class HistoryMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    question: str
    session_id: str | None = None
    history: list[HistoryMessage] = []


async def _event_stream(user_jwt: str, groq_key: str, question: str, history: list[dict]):
    """Convert async generator tokens into SSE format."""
    try:
        async for token in rag_stream(user_jwt, groq_key, question, history):
            data = json.dumps({"token": token})
            yield f"data: {data}\n\n"
        yield "data: [DONE]\n\n"
    except Exception as exc:
        error_data = json.dumps({"error": str(exc)})
        yield f"data: {error_data}\n\n"


@router.post("/stream")
async def chat_stream(
    body: ChatRequest,
    auth: tuple = Depends(get_user_id),
    groq_key: str = Depends(validate_llm_key),
) -> StreamingResponse:
    user_jwt, _ = auth
    history = [m.model_dump() for m in body.history]

    return StreamingResponse(
        _event_stream(user_jwt, groq_key, body.question, history),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )
