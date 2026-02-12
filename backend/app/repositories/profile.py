from sqlalchemy import asc, select
from sqlalchemy.orm import Session

from app.models.profile import Profile


def list_profiles(db: Session) -> list[Profile]:
    stmt = select(Profile).order_by(asc(Profile.profile_id))
    return list(db.scalars(stmt).all())
