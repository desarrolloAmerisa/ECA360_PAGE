from __future__ import annotations

import hashlib
import secrets
from typing import Optional

from fastapi import Depends, Header, HTTPException, status

from app.config import get_settings

# In-memory session tokens (simple auth — no JWT)
_active_tokens: set[str] = set()


def create_session_token() -> str:
    token = secrets.token_urlsafe(32)
    _active_tokens.add(token)
    return token


def revoke_session_token(token: str) -> None:
    _active_tokens.discard(token)


def verify_password(password: str) -> bool:
    settings = get_settings()
    return secrets.compare_digest(password, settings.admin_password)


def require_admin(authorization: Optional[str] = Header(None)) -> str:
    if not authorization:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No autorizado")
    token = authorization.replace("Bearer ", "").strip()
    if token not in _active_tokens:
        # Also accept a deterministic fallback based on password hash for persistence across restarts
        settings = get_settings()
        expected = hashlib.sha256(f"eca360:{settings.admin_password}".encode()).hexdigest()
        if token != expected and token not in _active_tokens:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Sesión inválida")
        _active_tokens.add(token)
    return token


def make_persistent_token() -> str:
    """Token derived from password so sessions survive server restarts."""
    settings = get_settings()
    token = hashlib.sha256(f"eca360:{settings.admin_password}".encode()).hexdigest()
    _active_tokens.add(token)
    return token
