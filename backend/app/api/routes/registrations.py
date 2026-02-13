from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.repositories.registration import create_registration
from app.schemas.registration import (
    RegistrationCreate,
    RegistrationCreateResponse,
)

router = APIRouter()


@router.post("", response_model=RegistrationCreateResponse)
def create_registration_handler(payload: RegistrationCreate, db: Session = Depends(get_db)) -> RegistrationCreateResponse:
    registration = create_registration(db, payload)
    return RegistrationCreateResponse(id=registration.member_id)
