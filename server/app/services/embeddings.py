from functools import lru_cache

import numpy as np
from sentence_transformers import SentenceTransformer

MODEL_NAME = "all-MiniLM-L6-v2"


@lru_cache(maxsize=1)
def _get_model() -> SentenceTransformer:
    return SentenceTransformer(MODEL_NAME)


def embed_text(text: str) -> list[float]:
    """Embed a single piece of text and return a normalised float list."""
    model = _get_model()
    embedding: np.ndarray = model.encode(text, normalize_embeddings=True)
    return embedding.tolist()


def embed_batch(texts: list[str]) -> list[list[float]]:
    """Embed multiple texts in one forward pass."""
    model = _get_model()
    embeddings: np.ndarray = model.encode(texts, normalize_embeddings=True, batch_size=32)
    return embeddings.tolist()
