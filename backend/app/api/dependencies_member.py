from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.repositories.registration import get_registration_by_member_id
from app.services.member_session import extract_member_id_from_token

settings = get_settings()


def require_member_auth(authorization: Optional[str], db: Session):
    if not authorization:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing Authorization header")
    parts = authorization.split(" ", 1)
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid auth header format")

    member_id = extract_member_id_from_token(parts[1].strip(), settings.member_session_secret)
    if not member_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid session token")

    registration = get_registration_by_member_id(db, member_id)
    if not registration:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Member not found")
    if not registration.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Your account is disabled. Contact support.")
    return registration
