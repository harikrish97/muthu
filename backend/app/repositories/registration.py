from sqlalchemy import asc, desc, func, or_, select
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
        "address",
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
        address=payload.address,
        education=payload.education,
        occupation=payload.occupation,
        gothram=payload.gothram,
        message=payload.message,
        status="New",
        is_active=True,
        credits=3,
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


def list_registrations_paginated(
    db: Session,
    page: int,
    page_size: int,
    search: Optional[str] = None,
    member_id: Optional[str] = None,
    name: Optional[str] = None,
    is_active: Optional[bool] = None,
    max_credits: Optional[int] = None,
    sort_by: str = "created_at",
    sort_order: str = "desc",
) -> tuple[list[Registration], int]:
    filters = []

    if search:
        keyword = f"%{search.strip()}%"
        filters.append(
            or_(
                Registration.name.ilike(keyword),
                Registration.member_id.ilike(keyword),
            )
        )
    if member_id:
        filters.append(Registration.member_id.ilike(f"%{member_id.strip()}%"))
    if name:
        filters.append(Registration.name.ilike(f"%{name.strip()}%"))
    if is_active is not None:
        filters.append(Registration.is_active == is_active)
    if max_credits is not None:
        filters.append(Registration.credits <= max_credits)

    sortable_columns = {
        "created_at": Registration.created_at,
        "updated_at": Registration.updated_at,
        "name": Registration.name,
        "member_id": Registration.member_id,
        "credits": Registration.credits,
        "status": Registration.status,
        "is_active": Registration.is_active,
    }
    sort_column = sortable_columns.get(sort_by, Registration.created_at)
    sort_clause = asc(sort_column) if sort_order.lower() == "asc" else desc(sort_column)

    base_query = select(Registration)
    count_query = select(func.count(Registration.id))
    if filters:
        base_query = base_query.where(*filters)
        count_query = count_query.where(*filters)

    total = db.scalar(count_query) or 0
    offset = (page - 1) * page_size
    rows = list(db.scalars(base_query.order_by(sort_clause).offset(offset).limit(page_size)).all())
    return rows, total


def get_registration_by_member_id(db: Session, member_id: str) -> Optional[Registration]:
    stmt = select(Registration).where(Registration.member_id == member_id)
    return db.scalar(stmt)


def update_registration_fields(db: Session, registration: Registration, updates: dict) -> Registration:
    editable_fields = {
        "name",
        "email",
        "phone",
        "gender",
        "dob",
        "city",
        "address",
        "education",
        "occupation",
        "gothram",
        "message",
        "status",
        "is_active",
        "credits",
    }
    for key, value in updates.items():
        if key in editable_fields:
            setattr(registration, key, value)
        elif key == "extra_data":
            registration.extra_data = {
                **(registration.extra_data or {}),
                **(value or {}),
            }
        else:
            registration.extra_data = {
                **(registration.extra_data or {}),
                key: value,
            }

    db.add(registration)
    db.commit()
    db.refresh(registration)
    return registration


def reset_registration_password(db: Session, registration: Registration, new_password: str) -> Registration:
    registration.password_hash = hash_password(new_password)
    db.add(registration)
    db.commit()
    db.refresh(registration)
    return registration


def update_registration_address(db: Session, registration: Registration, address: str) -> Registration:
    registration.address = address
    db.add(registration)
    db.commit()
    db.refresh(registration)
    return registration


def update_registration_member_fields(
    db: Session,
    registration: Registration,
    address: Optional[str] = None,
    occupation: Optional[str] = None,
    message: Optional[str] = None,
) -> Registration:
    if address is not None:
        registration.address = address
    if occupation is not None:
        registration.occupation = occupation
    if message is not None:
        registration.message = message

    db.add(registration)
    db.commit()
    db.refresh(registration)
    return registration
