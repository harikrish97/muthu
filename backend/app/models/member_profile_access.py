from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class MemberProfileAccess(Base):
    __tablename__ = "member_profile_access"
    __table_args__ = (UniqueConstraint("member_id", "profile_id", name="uq_member_profile_access"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    member_id: Mapped[str] = mapped_column(String(24), index=True)
    profile_id: Mapped[str] = mapped_column(String(24), index=True)
    credits_spent: Mapped[int] = mapped_column(Integer, default=1)
    unlocked_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
