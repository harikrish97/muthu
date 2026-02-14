from datetime import date
from typing import Any, Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.repositories.profile import list_recent_verified_profiles
from app.schemas.public import PublicRecentProfileItem, PublicRecentProfilesResponse

router = APIRouter(prefix="/public")


def _calculate_age(dob: Optional[str]) -> Optional[int]:
    if not dob:
        return None
    try:
        year, month, day = [int(part) for part in dob.split("-")]
        born = date(year, month, day)
    except Exception:
        return None
    today = date.today()
    return today.year - born.year - ((today.month, today.day) < (born.month, born.day))


def _get_profile_image(extra_data: Any) -> Optional[str]:
    data = extra_data if isinstance(extra_data, dict) else {}
    image_url = data.get("imageUrl")
    if isinstance(image_url, str) and image_url.strip():
        return image_url.strip()

    profile_photo = data.get("profilePhoto")
    if isinstance(profile_photo, str) and profile_photo.strip():
        return profile_photo.strip()
    if isinstance(profile_photo, dict):
        for key in ("url", "dataUrl", "preview", "path"):
            value = profile_photo.get(key)
            if isinstance(value, str) and value.strip():
                return value.strip()
    return None


@router.get("/profiles/recent-verified", response_model=PublicRecentProfilesResponse)
def list_recent_verified(
    limit: int = Query(default=8, ge=1, le=20),
    db: Session = Depends(get_db),
) -> PublicRecentProfilesResponse:
    rows = list_recent_verified_profiles(db, limit=limit)
    items = []
    for row in rows:
        extra_data = row.extra_data if isinstance(row.extra_data, dict) else {}
        items.append(
            PublicRecentProfileItem(
                profile_id=row.member_id,
                age=_calculate_age(row.dob),
                profession=row.occupation or None,
                location=row.city or str(extra_data.get("currentLocation") or "") or None,
                gothram=row.gothram or None,
                image_url=_get_profile_image(extra_data),
            )
        )
    return PublicRecentProfilesResponse(items=items)

