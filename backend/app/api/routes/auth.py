from typing import Optional

from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.config import get_settings
from app.repositories.profile import list_profiles
from app.repositories.registration import (
    get_registration_by_member_id,
    update_registration_member_fields,
)
from app.schemas.auth import (
    MemberIdentity,
    MemberLoginRequest,
    MemberLoginResponse,
    MemberProfile,
    MemberProfileUpdateRequest,
)
from app.services.member_session import create_member_token, extract_member_id_from_token
from app.services.security import verify_password

router = APIRouter()
settings = get_settings()


def _build_member_login_response(registration, db: Session) -> MemberLoginResponse:
    profiles = list_profiles(db)
    response_profiles = [
        MemberProfile(
            sNo=index,
            profileId=profile.profile_id,
            name=profile.name,
            height=profile.height,
            starPadham=profile.star_padham,
            hasPhoto=profile.has_photo,
        )
        for index, profile in enumerate(profiles, start=1)
    ]

    return MemberLoginResponse(
        member=MemberIdentity(
            id=registration.member_id,
            name=registration.name,
            email=registration.email,
            phone=registration.phone,
            gender=registration.gender,
            dob=registration.dob,
            city=registration.city,
            address=registration.address,
            education=registration.education,
            occupation=registration.occupation,
            message=registration.message,
            gothram=registration.gothram,
            isActive=registration.is_active,
            credits=registration.credits,
        ),
        profiles=response_profiles,
        token=create_member_token(registration.member_id, settings.member_session_secret),
    )


def _get_member_from_auth_header(authorization: Optional[str], db: Session):
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


@router.post("/member-login", response_model=MemberLoginResponse)
def member_login(payload: MemberLoginRequest, db: Session = Depends(get_db)) -> MemberLoginResponse:
    registration = get_registration_by_member_id(db, payload.memberId)
    if not registration or not verify_password(payload.password, registration.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid member ID or password",
        )
    if not registration.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account is disabled. Contact support.",
        )
    if settings.enforce_credit_for_profile_access and registration.credits <= 0:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No credits remaining. Contact admin.",
        )

    return _build_member_login_response(registration, db)


@router.get("/member-session", response_model=MemberLoginResponse)
def member_session(
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
) -> MemberLoginResponse:
    registration = _get_member_from_auth_header(authorization, db)
    if settings.enforce_credit_for_profile_access and registration.credits <= 0:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No credits remaining. Contact admin.",
        )
    return _build_member_login_response(registration, db)


@router.patch("/member-profile", response_model=MemberIdentity)
def member_update_profile(
    payload: MemberProfileUpdateRequest,
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
) -> MemberIdentity:
    registration = _get_member_from_auth_header(authorization, db)
    if payload.address is None and payload.occupation is None and payload.message is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one editable field is required",
        )

    updated = update_registration_member_fields(
        db,
        registration,
        address=payload.address.strip() if payload.address is not None else None,
        occupation=payload.occupation.strip() if payload.occupation is not None else None,
        message=payload.message.strip() if payload.message is not None else None,
    )
    return MemberIdentity(
        id=updated.member_id,
        name=updated.name,
        email=updated.email,
        phone=updated.phone,
        gender=updated.gender,
        dob=updated.dob,
        city=updated.city,
        address=updated.address,
        education=updated.education,
        occupation=updated.occupation,
        message=updated.message,
        gothram=updated.gothram,
        isActive=updated.is_active,
        credits=updated.credits,
    )
