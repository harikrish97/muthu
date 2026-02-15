from sqlalchemy import inspect, select, text
from sqlalchemy.orm import Session

from app.db.base import Base
from app.db.session import engine
from app.models.member_profile_access import MemberProfileAccess  # noqa: F401
from app.models.profile import Profile
from app.models.profile_share_link import ProfileShareLink  # noqa: F401
from app.models.registration import Registration  # noqa: F401


def init_db() -> None:
    Base.metadata.create_all(bind=engine)
    _run_lightweight_migrations()
    with Session(bind=engine) as db:
        _seed_profiles(db)
        _backfill_profile_data(db)


def _run_lightweight_migrations() -> None:
    inspector = inspect(engine)
    with engine.begin() as conn:
        if inspector.has_table("registrations"):
            columns = {col["name"] for col in inspector.get_columns("registrations")}
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

        if inspector.has_table("profiles"):
            profile_columns = {col["name"] for col in inspector.get_columns("profiles")}
            if "gender" not in profile_columns:
                conn.execute(text("ALTER TABLE profiles ADD COLUMN gender VARCHAR(16)"))
            if "age" not in profile_columns:
                conn.execute(text("ALTER TABLE profiles ADD COLUMN age INTEGER"))
            if "city" not in profile_columns:
                conn.execute(text("ALTER TABLE profiles ADD COLUMN city VARCHAR(120)"))
            if "education" not in profile_columns:
                conn.execute(text("ALTER TABLE profiles ADD COLUMN education VARCHAR(255)"))
            if "occupation" not in profile_columns:
                conn.execute(text("ALTER TABLE profiles ADD COLUMN occupation VARCHAR(255)"))
            if "image_url" not in profile_columns:
                conn.execute(text("ALTER TABLE profiles ADD COLUMN image_url VARCHAR(1000)"))
            if "about" not in profile_columns:
                conn.execute(text("ALTER TABLE profiles ADD COLUMN about VARCHAR(1200)"))
            if "family_details" not in profile_columns:
                conn.execute(text("ALTER TABLE profiles ADD COLUMN family_details VARCHAR(1200)"))


def _seed_profiles(db: Session) -> None:
    existing = db.scalar(select(Profile.id).limit(1))
    if existing is not None:
        return

    seed_profiles = [
        Profile(
            profile_id="VV-2401",
            name="Aishwarya",
            gender="Female",
            age=26,
            height="5'5\"",
            star_padham="Rohini - 2",
            city="Chennai",
            education="B.E Computer Science",
            occupation="Software Engineer",
            image_url="https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80",
            about="Family-oriented professional with interest in music and travel.",
            family_details="Nuclear family settled in Chennai.",
            has_photo=True,
        ),
        Profile(
            profile_id="VV-3176",
            name="Sriram",
            gender="Male",
            age=28,
            height="5'10\"",
            star_padham="Swathi - 3",
            city="Bengaluru",
            education="CA",
            occupation="Chartered Accountant",
            image_url="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
            about="Calm and practical professional with strong family values.",
            family_details="Joint family based in Bengaluru.",
            has_photo=False,
        ),
        Profile(
            profile_id="VV-2894",
            name="Madhumitha",
            gender="Female",
            age=27,
            height="5'4\"",
            star_padham="Hastham - 1",
            city="Coimbatore",
            education="MBBS",
            occupation="Doctor",
            image_url="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80",
            about="Doctor with a balanced lifestyle and passion for classical arts.",
            family_details="Parents are retired teachers in Coimbatore.",
            has_photo=True,
        ),
        Profile(
            profile_id="VV-3661",
            name="Nandakumar",
            gender="Male",
            age=29,
            height="5'9\"",
            star_padham="Anusham - 4",
            city="Madurai",
            education="M.Tech",
            occupation="Product Manager",
            image_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
            about="Tech leader with traditional values and long-term outlook.",
            family_details="Family business background in Madurai.",
            has_photo=True,
        ),
    ]
    db.add_all(seed_profiles)
    db.commit()


def _backfill_profile_data(db: Session) -> None:
    defaults = {
        "VV-2401": {
            "gender": "Female",
            "age": 26,
            "city": "Chennai",
            "education": "B.E Computer Science",
            "occupation": "Software Engineer",
        },
        "VV-3176": {
            "gender": "Male",
            "age": 28,
            "city": "Bengaluru",
            "education": "CA",
            "occupation": "Chartered Accountant",
        },
        "VV-2894": {
            "gender": "Female",
            "age": 27,
            "city": "Coimbatore",
            "education": "MBBS",
            "occupation": "Doctor",
        },
        "VV-3661": {
            "gender": "Male",
            "age": 29,
            "city": "Madurai",
            "education": "M.Tech",
            "occupation": "Product Manager",
        },
    }

    rows = list(db.scalars(select(Profile)).all())
    updated = False
    for row in rows:
        ref = defaults.get(row.profile_id)
        if not ref:
            continue
        if not row.gender:
            row.gender = ref["gender"]
            updated = True
        if row.age is None:
            row.age = ref["age"]
            updated = True
        if not row.city:
            row.city = ref["city"]
            updated = True
        if not row.education:
            row.education = ref["education"]
            updated = True
        if not row.occupation:
            row.occupation = ref["occupation"]
            updated = True
    if updated:
        db.add_all(rows)
        db.commit()
