from math import ceil
from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, Header, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.dependencies_member import require_member_auth
from app.db.session import get_db
from app.repositories.profile import (
    get_profile_for_member,
    list_recent_profiles_for_member,
    unlock_profile_for_member,
)
from app.schemas.member_profiles import (
    MemberProfileBasic,
    MemberProfileDetailResponse,
    MemberProfileDetails,
    MemberProfileListResponse,
    UnlockProfileResponse,
)

router = APIRouter(prefix="/member-profiles")


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


def _to_basic(profile, unlocked: bool) -> MemberProfileBasic:
    extra_data = profile.extra_data if isinstance(profile.extra_data, dict) else {}
    return MemberProfileBasic(
        profile_id=profile.member_id,
        name=profile.name,
        gender=profile.gender,
        age=_calculate_age(profile.dob),
        height=str(extra_data.get("height") or "-"),
        star_padham=str(extra_data.get("starPadham") or "-"),
        city=profile.city,
        education=profile.education,
        occupation=profile.occupation,
        image_url=extra_data.get("imageUrl"),
        has_photo=bool(extra_data.get("hasPhoto", False)),
        unlocked=unlocked,
    )


@router.get("/recent", response_model=MemberProfileListResponse)
def list_recent_profiles(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, alias="pageSize", ge=1, le=100),
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
) -> MemberProfileListResponse:
    member = require_member_auth(authorization, db)
    pairs, total = list_recent_profiles_for_member(
        db,
        member,
        page=page,
        page_size=page_size,
    )
    total_pages = ceil(total / page_size) if total > 0 else 1
    return MemberProfileListResponse(
        items=[_to_basic(profile, unlocked) for profile, unlocked in pairs],
        credits_remaining=member.credits,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get("/{profile_id}", response_model=MemberProfileDetailResponse)
def get_profile_detail(
    profile_id: str,
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
) -> MemberProfileDetailResponse:
    member = require_member_auth(authorization, db)
    result = get_profile_for_member(db, member, profile_id)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")
    profile, unlocked = result

    full_details = (
        MemberProfileDetails(
            about=profile.message,
            family_details=profile.address,
        )
        if unlocked
        else None
    )
    return MemberProfileDetailResponse(
        profile=_to_basic(profile, unlocked),
        full_details=full_details,
        credits_remaining=member.credits,
    )


@router.post("/{profile_id}/unlock", response_model=UnlockProfileResponse)
def unlock_profile(
    profile_id: str,
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
) -> UnlockProfileResponse:
    member = require_member_auth(authorization, db)
    result = get_profile_for_member(db, member, profile_id)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")
    profile, already_unlocked = result
    if already_unlocked:
        return UnlockProfileResponse(
            message="Full profile already unlocked",
            profile=_to_basic(profile, True),
            full_details=MemberProfileDetails(
                about=profile.message,
                family_details=profile.address,
            ),
            credits_remaining=member.credits,
        )

    try:
        _, credits_remaining = unlock_profile_for_member(db, member, profile)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No credits available to unlock this profile",
        )

    return UnlockProfileResponse(
        message="Full profile unlocked successfully",
        profile=_to_basic(profile, True),
        full_details=MemberProfileDetails(
            about=profile.message,
            family_details=profile.address,
        ),
        credits_remaining=credits_remaining,
    )
