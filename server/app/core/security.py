import logging
import re

import jwt
from fastapi import Header, HTTPException, status

from .config import settings

logger = logging.getLogger(__name__)
_GROQ_KEY_RE = re.compile(r"^gsk_[a-zA-Z0-9]{50,}$")


def verify_jwt(token: str) -> dict:
    """Decode and validate a Supabase JWT. Raises 401 on failure."""
    try:
        payload = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            audience="authenticated",
        )
        return payload
    except jwt.PyJWTError as exc:
        logger.error("JWT verification failed: %s: %s", type(exc).__name__, exc)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        ) from exc


def get_user_id(authorization: str = Header(...)) -> tuple[str, str]:
    """
    Extract bearer token and user_id from the Authorization header.
    Returns (raw_token, user_id).
    """
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header must start with 'Bearer '",
        )
    token = authorization.removeprefix("Bearer ").strip()
    payload = verify_jwt(token)
    user_id: str | None = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing subject claim",
        )
    return token, user_id


def validate_llm_key(x_llm_key: str = Header(...)) -> str:
    """Validate the Groq API key format. Never persisted."""
    if not _GROQ_KEY_RE.match(x_llm_key):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid LLM key format",
        )
    return x_llm_key
