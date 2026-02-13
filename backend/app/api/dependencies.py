import secrets
from typing import Optional

from fastapi import Header, HTTPException, status

from app.core.config import get_settings

settings = get_settings()


def require_admin_auth(authorization: Optional[str] = Header(default=None)) -> None:
    if not authorization:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing Authorization header")

    parts = authorization.split(" ", 1)
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid auth header format")

    token = parts[1].strip()
    if not secrets.compare_digest(token, settings.admin_token):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid admin token")
