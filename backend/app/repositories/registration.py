from sqlalchemy import desc, select
from sqlalchemy.orm import Session
from typing import Optional

from app.models.registration import Registration
from app.schemas.registration import RegistrationCreate
from app.services.security import hash_password


def create_registration(db: Session, payload: RegistrationCreate) -> Registration:
    payload_dict = payload.model_dump()

    known_fields = {
        "name",
        "email",
        "password",
        "phone",
        "gender",
        "dob",
        "city",
        "education",
        "occupation",
        "gothram",
        "message",
    }
    extra_data = {key: value for key, value in payload_dict.items() if key not in known_fields}

    registration = Registration(
        member_id="PENDING",
        name=payload.name,
        email=payload.email,
        phone=payload.phone,
        password_hash=hash_password(payload.password),
        gender=payload.gender,
        dob=payload.dob,
        city=payload.city,
        education=payload.education,
        occupation=payload.occupation,
        gothram=payload.gothram,
        message=payload.message,
        status="New",
        extra_data=extra_data,
    )
    db.add(registration)
    db.flush()
    registration.member_id = f"VV-{registration.id:06d}"
    db.commit()
    db.refresh(registration)
    return registration


def list_registrations(db: Session) -> list[Registration]:
    stmt = select(Registration).order_by(desc(Registration.created_at))
    return list(db.scalars(stmt).all())


def get_registration_by_member_id(db: Session, member_id: str) -> Optional[Registration]:
    stmt = select(Registration).where(Registration.member_id == member_id)
    return db.scalar(stmt)
