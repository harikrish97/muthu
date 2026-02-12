from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.repositories.registration import create_registration, list_registrations
from app.schemas.registration import (
    RegistrationCreate,
    RegistrationCreateResponse,
    RegistrationListItem,
)

router = APIRouter()


@router.post("", response_model=RegistrationCreateResponse)
def create_registration_handler(payload: RegistrationCreate, db: Session = Depends(get_db)) -> RegistrationCreateResponse:
    registration = create_registration(db, payload)
    return RegistrationCreateResponse(id=registration.member_id)


@router.get("", response_model=list[RegistrationListItem])
def list_registrations_handler(db: Session = Depends(get_db)) -> list[RegistrationListItem]:
    rows = list_registrations(db)
    response: list[RegistrationListItem] = []
    for row in rows:
        response.append(
            RegistrationListItem(
                id=row.member_id,
                data={
                    "name": row.name,
                    "phone": row.phone,
                    "email": row.email,
                    "city": row.city,
                },
                created_at=row.created_at,
                status=row.status,
            )
        )
    return response
