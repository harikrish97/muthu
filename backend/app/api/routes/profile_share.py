from datetime import date
from typing import Any, Optional

from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies_member import require_member_auth
from app.db.session import get_db
from app.repositories.profile_share import (
    create_profile_share_link,
    get_profile_share_link_by_token,
    is_profile_share_link_expired,
    mark_profile_share_accessed,
    revoke_profile_share_link,
)
from app.repositories.registration import get_registration_by_member_id
from app.schemas.profile_share import (
    ProfileShareCreateRequest,
    ProfileShareCreateResponse,
    ProfileSharePublicResponse,
    ProfileShareRevokeResponse,
    SharedProfileContact,
    SharedProfileData,
)

router = APIRouter(prefix="/profile/share")


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


def _extract_image_url(extra_data: Any) -> Optional[str]:
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


def _link_status(link) -> str:
    if link.revoked_at is not None:
        return "revoked"
    if is_profile_share_link_expired(link):
        return "expired"
    return "active"


def _build_shared_profile(registration, include_contact_details: bool) -> SharedProfileData:
    extra_data = registration.extra_data if isinstance(registration.extra_data, dict) else {}
    contact = None
    if include_contact_details:
        contact = SharedProfileContact(
            phone=registration.phone,
            whatsapp_number=str(extra_data.get("whatsappNumber") or "") or None,
            alternate_contact_number=str(extra_data.get("alternateContactNumber") or "") or None,
            email=registration.email,
            primary_contact_name=str(extra_data.get("primaryContactName") or "") or None,
            primary_contact_relation=str(extra_data.get("primaryContactRelation") or "") or None,
        )

    return SharedProfileData(
        name=registration.name,
        gender=registration.gender,
        dob=registration.dob,
        age=_calculate_age(registration.dob),
        location=registration.city or str(extra_data.get("currentLocation") or "") or None,
        education=registration.education or str(extra_data.get("highestQualification") or "") or None,
        occupation=registration.occupation,
        gothram=registration.gothram,
        nakshatra=str(extra_data.get("nakshatra") or "") or None,
        sect=str(extra_data.get("sect") or "") or None,
        subsect=str(extra_data.get("subsect") or "") or None,
        about=registration.message or str(extra_data.get("aboutMe") or "") or None,
        family_details=str(extra_data.get("familyPropertyDetails") or "") or None,
        image_url=_extract_image_url(extra_data),
        contact=contact,
    )


@router.post("", response_model=ProfileShareCreateResponse)
def create_share_link(
    payload: ProfileShareCreateRequest,
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
) -> ProfileShareCreateResponse:
    member = require_member_auth(authorization, db)
    link = create_profile_share_link(
        db,
        member_id=member.member_id,
        expires_in_days=payload.expires_in_days,
        include_contact_details=payload.include_contact_details,
    )

    return ProfileShareCreateResponse(
        token=link.token,
        share_path=f"/profile/share/{link.token}",
        expires_at=link.expires_at,
        include_contact_details=link.include_contact_details,
        link_status=_link_status(link),
    )


@router.get("/{token}", response_model=ProfileSharePublicResponse)
def get_shared_profile(token: str, db: Session = Depends(get_db)) -> ProfileSharePublicResponse:
    link = get_profile_share_link_by_token(db, token)
    if not link:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Share link not found")

    status_value = _link_status(link)
    if status_value == "revoked":
        raise HTTPException(status_code=status.HTTP_410_GONE, detail="Share link has been disabled")
    if status_value == "expired":
        raise HTTPException(status_code=status.HTTP_410_GONE, detail="Share link has expired")

    registration = get_registration_by_member_id(db, link.member_id)
    if not registration:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Shared profile unavailable")

    mark_profile_share_accessed(db, link)
    return ProfileSharePublicResponse(
        profile=_build_shared_profile(registration, link.include_contact_details),
        expires_at=link.expires_at,
        link_status="active",
        include_contact_details=link.include_contact_details,
    )


@router.delete("/{token}", response_model=ProfileShareRevokeResponse)
def revoke_shared_profile(
    token: str,
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
) -> ProfileShareRevokeResponse:
    member = require_member_auth(authorization, db)
    link = get_profile_share_link_by_token(db, token)
    if not link or link.member_id != member.member_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Share link not found")

    if link.revoked_at is None:
        link = revoke_profile_share_link(db, link)

    return ProfileShareRevokeResponse(message="Share link disabled", link_status=_link_status(link))
