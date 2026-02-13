from typing import Optional

from sqlalchemy import and_, desc, func, select
from sqlalchemy.orm import Session

from app.models.member_profile_access import MemberProfileAccess
from app.models.registration import Registration


def _preferred_gender_for_member(member_gender: Optional[str]) -> Optional[str]:
    if not member_gender:
        return None
    normalized = member_gender.strip().lower()
    if normalized in {"male", "m"}:
        return "Female"
    if normalized in {"female", "f"}:
        return "Male"
    return None


def list_recent_profiles_for_member(
    db: Session,
    member: Registration,
    page: int = 1,
    page_size: int = 20,
) -> tuple[list[tuple[Registration, bool]], int]:
    preferred_gender = _preferred_gender_for_member(member.gender)
    stmt = select(Registration).where(
        and_(
            Registration.is_active.is_(True),
            Registration.member_id != member.member_id,
        )
    )
    count_stmt = select(func.count(Registration.id)).where(
        and_(
            Registration.is_active.is_(True),
            Registration.member_id != member.member_id,
        )
    )
    if preferred_gender:
        stmt = stmt.where(Registration.gender == preferred_gender)
        count_stmt = count_stmt.where(Registration.gender == preferred_gender)
    total = db.scalar(count_stmt) or 0
    offset = (page - 1) * page_size
    stmt = stmt.order_by(desc(Registration.created_at)).offset(offset).limit(page_size)
    profiles = list(db.scalars(stmt).all())

    unlocked_stmt = select(MemberProfileAccess.profile_id).where(MemberProfileAccess.member_id == member.member_id)
    unlocked_profile_ids = set(db.scalars(unlocked_stmt).all())
    return [(profile, profile.member_id in unlocked_profile_ids) for profile in profiles], total


def get_profile_for_member(db: Session, member: Registration, profile_id: str) -> Optional[tuple[Registration, bool]]:
    preferred_gender = _preferred_gender_for_member(member.gender)
    stmt = select(Registration).where(
        and_(
            Registration.member_id == profile_id,
            Registration.is_active.is_(True),
            Registration.member_id != member.member_id,
        )
    )
    if preferred_gender:
        stmt = stmt.where(Registration.gender == preferred_gender)
    profile = db.scalar(stmt)
    if not profile:
        return None

    access = db.scalar(
        select(MemberProfileAccess).where(
            and_(
                MemberProfileAccess.member_id == member.member_id,
                MemberProfileAccess.profile_id == profile.member_id,
            )
        )
    )
    return profile, access is not None


def unlock_profile_for_member(db: Session, member: Registration, profile: Registration) -> tuple[bool, int]:
    access = db.scalar(
        select(MemberProfileAccess).where(
            and_(
                MemberProfileAccess.member_id == member.member_id,
                MemberProfileAccess.profile_id == profile.member_id,
            )
        )
    )
    if access:
        return False, member.credits

    if member.credits <= 0:
        raise ValueError("No credits available")

    member.credits -= 1
    db.add(member)
    db.add(
        MemberProfileAccess(
            member_id=member.member_id,
            profile_id=profile.member_id,
            credits_spent=1,
        )
    )
    db.commit()
    db.refresh(member)
    return True, member.credits
