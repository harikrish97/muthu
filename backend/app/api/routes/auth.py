from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.repositories.profile import list_profiles
from app.repositories.registration import get_registration_by_member_id
from app.schemas.auth import MemberIdentity, MemberLoginRequest, MemberLoginResponse, MemberProfile
from app.services.security import verify_password

router = APIRouter()


@router.post("/member-login", response_model=MemberLoginResponse)
def member_login(payload: MemberLoginRequest, db: Session = Depends(get_db)) -> MemberLoginResponse:
    registration = get_registration_by_member_id(db, payload.memberId)
    if not registration or not verify_password(payload.password, registration.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid member ID or password",
        )

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
        member=MemberIdentity(id=registration.member_id, name=registration.name),
        profiles=response_profiles,
    )
