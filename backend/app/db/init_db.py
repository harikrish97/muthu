from sqlalchemy import inspect, select, text
from sqlalchemy.orm import Session

from app.db.base import Base
from app.db.session import engine
from app.models.profile import Profile
from app.models.registration import Registration  # noqa: F401


def init_db() -> None:
    Base.metadata.create_all(bind=engine)
    _run_lightweight_migrations()
    with Session(bind=engine) as db:
        _seed_profiles(db)


def _run_lightweight_migrations() -> None:
    inspector = inspect(engine)
    if not inspector.has_table("registrations"):
        return

    columns = {col["name"] for col in inspector.get_columns("registrations")}
    with engine.begin() as conn:
        if "is_active" not in columns:
            conn.execute(text("ALTER TABLE registrations ADD COLUMN is_active BOOLEAN DEFAULT TRUE"))
            conn.execute(text("UPDATE registrations SET is_active = TRUE WHERE is_active IS NULL"))
        if "credits" not in columns:
            conn.execute(text("ALTER TABLE registrations ADD COLUMN credits INTEGER DEFAULT 0"))
            conn.execute(text("UPDATE registrations SET credits = 0 WHERE credits IS NULL"))
        if "updated_at" not in columns:
            conn.execute(
                text("ALTER TABLE registrations ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
            )
            conn.execute(text("UPDATE registrations SET updated_at = created_at WHERE updated_at IS NULL"))
        if "address" not in columns:
            conn.execute(text("ALTER TABLE registrations ADD COLUMN address VARCHAR(500)"))


def _seed_profiles(db: Session) -> None:
    existing = db.scalar(select(Profile.id).limit(1))
    if existing is not None:
        return

    seed_profiles = [
        Profile(
            profile_id="VV-2401",
            name="Aishwarya",
            height="5'5\"",
            star_padham="Rohini - 2",
            has_photo=True,
        ),
        Profile(
            profile_id="VV-3176",
            name="Sriram",
            height="5'10\"",
            star_padham="Swathi - 3",
            has_photo=False,
        ),
        Profile(
            profile_id="VV-2894",
            name="Madhumitha",
            height="5'4\"",
            star_padham="Hastham - 1",
            has_photo=True,
        ),
        Profile(
            profile_id="VV-3661",
            name="Nandakumar",
            height="5'9\"",
            star_padham="Anusham - 4",
            has_photo=True,
        ),
    ]
    db.add_all(seed_profiles)
    db.commit()
