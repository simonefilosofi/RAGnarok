import io
from dataclasses import dataclass

import httpx
from bs4 import BeautifulSoup
from langchain_text_splitters import RecursiveCharacterTextSplitter
from pypdf import PdfReader

CHUNK_SIZE = 1000
CHUNK_OVERLAP = 200

_splitter = RecursiveCharacterTextSplitter(
    chunk_size=CHUNK_SIZE,
    chunk_overlap=CHUNK_OVERLAP,
    separators=["\n\n", "\n", " ", ""],
)


@dataclass
class TextChunk:
    content: str
    metadata: dict


def _split_text(text: str, base_metadata: dict) -> list[TextChunk]:
    raw_chunks = _splitter.split_text(text)
    return [
        TextChunk(content=chunk, metadata={**base_metadata, "chunk_index": i})
        for i, chunk in enumerate(raw_chunks)
        if chunk.strip()
    ]


async def process_pdf(file_bytes: bytes, filename: str) -> list[TextChunk]:
    """Extract text from a PDF and split into chunks, preserving page numbers."""
    reader = PdfReader(io.BytesIO(file_bytes))
    chunks: list[TextChunk] = []
    for page_num, page in enumerate(reader.pages):
        text = page.extract_text() or ""
        if text.strip():
            page_chunks = _split_text(
                text,
                {"source": filename, "source_type": "pdf", "page": page_num + 1},
            )
            chunks.extend(page_chunks)
    return chunks


async def process_url(url: str) -> list[TextChunk]:
    """Fetch a URL, strip boilerplate HTML, and split into chunks."""
    async with httpx.AsyncClient(timeout=30, follow_redirects=True) as client:
        response = await client.get(url, headers={"User-Agent": "RAGnarok/1.0"})
        response.raise_for_status()

    soup = BeautifulSoup(response.text, "html.parser")

    # Remove noisy elements
    for tag in soup(["script", "style", "nav", "footer", "header", "aside", "form"]):
        tag.decompose()

    text = soup.get_text(separator="\n", strip=True)
    return _split_text(text, {"source": url, "source_type": "url"})
