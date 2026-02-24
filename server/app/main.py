from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api.routes.chat import router as chat_router
from .api.routes.documents import router as documents_router
from .api.routes.health import router as health_router
from .core.config import settings

app = FastAPI(
    title="RAGnarok API",
    description="Production-ready RAG backend with Supabase + Groq",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(documents_router)
app.include_router(chat_router)
