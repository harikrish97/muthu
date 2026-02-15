import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.profile_share_link import ProfileShareLink


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


def create_profile_share_link(
    db: Session,
    member_id: str,
    expires_in_days: int = 7,
    include_contact_details: bool = False,
) -> ProfileShareLink:
    max_attempts = 8
    for _ in range(max_attempts):
        token = secrets.token_urlsafe(32)
        existing = db.scalar(
            select(ProfileShareLink).where(ProfileShareLink.token == token)
        )
        if existing:
            continue

        link = ProfileShareLink(
            member_id=member_id,
            token=token,
            include_contact_details=include_contact_details,
            expires_at=_utc_now() + timedelta(days=expires_in_days),
        )
        db.add(link)
        db.commit()
        db.refresh(link)
        return link

    raise RuntimeError("Failed to create unique share token")


def get_profile_share_link_by_token(db: Session, token: str) -> Optional[ProfileShareLink]:
    return db.scalar(select(ProfileShareLink).where(ProfileShareLink.token == token))


def is_profile_share_link_expired(link: ProfileShareLink) -> bool:
    expires_at = link.expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    return expires_at <= _utc_now()


def mark_profile_share_accessed(db: Session, link: ProfileShareLink) -> None:
    link.last_accessed_at = _utc_now()
    db.add(link)
    db.commit()


def revoke_profile_share_link(db: Session, link: ProfileShareLink) -> ProfileShareLink:
    link.revoked_at = _utc_now()
    db.add(link)
    db.commit()
    db.refresh(link)
    return link
