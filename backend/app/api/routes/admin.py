import secrets
from math import ceil
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.dependencies import require_admin_auth
from app.core.config import get_settings
from app.db.session import get_db
from app.repositories.registration import (
    get_registration_by_member_id,
    list_registrations_paginated,
    reset_registration_password,
    update_registration_fields,
)
from app.schemas.admin import (
    AdminActionResponse,
    AdminLoginRequest,
    AdminLoginResponse,
    AdminRegistrationItem,
    AdminRegistrationListResponse,
    AdminRegistrationUpdateRequest,
    AdminResetPasswordRequest,
)

router = APIRouter(prefix="/admin")
settings = get_settings()


@router.post("/login", response_model=AdminLoginResponse)
def admin_login(payload: AdminLoginRequest) -> AdminLoginResponse:
    valid_username = secrets.compare_digest(payload.username, settings.admin_username)
    valid_password = secrets.compare_digest(payload.password, settings.admin_password)
    if not (valid_username and valid_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid admin credentials")
    return AdminLoginResponse(token=settings.admin_token)


@router.get(
    "/registrations",
    response_model=AdminRegistrationListResponse,
    dependencies=[Depends(require_admin_auth)],
)
def admin_list_registrations(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, alias="pageSize", ge=1, le=100),
    search: Optional[str] = Query(default=None),
    member_id: Optional[str] = Query(default=None, alias="memberId"),
    name: Optional[str] = Query(default=None),
    is_active: Optional[bool] = Query(default=None, alias="isActive"),
    max_credits: Optional[int] = Query(default=None, alias="maxCredits", ge=0),
    sort_by: str = Query(default="created_at", alias="sortBy"),
    sort_order: str = Query(default="desc", alias="sortOrder"),
    db: Session = Depends(get_db),
) -> AdminRegistrationListResponse:
    rows, total = list_registrations_paginated(
        db=db,
        page=page,
        page_size=page_size,
        search=search,
        member_id=member_id,
        name=name,
        is_active=is_active,
        max_credits=max_credits,
        sort_by=sort_by,
        sort_order=sort_order,
    )

    items = [
        AdminRegistrationItem(
            id=row.member_id,
            member_id=row.member_id,
            name=row.name,
            email=row.email,
            phone=row.phone,
            city=row.city,
            address=row.address,
            gender=row.gender,
            dob=row.dob,
            education=row.education,
            occupation=row.occupation,
            gothram=row.gothram,
            message=row.message,
            status=row.status,
            is_active=row.is_active,
            credits=row.credits,
            extra_data=row.extra_data or {},
            created_at=row.created_at,
            updated_at=row.updated_at,
        )
        for row in rows
    ]
    total_pages = ceil(total / page_size) if total > 0 else 1
    return AdminRegistrationListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.patch(
    "/registrations/{member_id}",
    response_model=AdminRegistrationItem,
    dependencies=[Depends(require_admin_auth)],
)
def admin_update_registration(
    member_id: str,
    payload: AdminRegistrationUpdateRequest,
    db: Session = Depends(get_db),
) -> AdminRegistrationItem:
    registration = get_registration_by_member_id(db, member_id)
    if not registration:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Member not found")

    payload_dict = payload.model_dump(exclude_unset=True)
    updates = {}
    for key, value in payload_dict.items():
        if key == "isActive":
            updates["is_active"] = value
        elif key == "extraData":
            updates["extra_data"] = value or {}
        else:
            updates[key] = value

    updated = update_registration_fields(db, registration, updates)
    return AdminRegistrationItem(
        id=updated.member_id,
        member_id=updated.member_id,
        name=updated.name,
        email=updated.email,
        phone=updated.phone,
        city=updated.city,
        address=updated.address,
        gender=updated.gender,
        dob=updated.dob,
        education=updated.education,
        occupation=updated.occupation,
        gothram=updated.gothram,
        message=updated.message,
        status=updated.status,
        is_active=updated.is_active,
        credits=updated.credits,
        extra_data=updated.extra_data or {},
        created_at=updated.created_at,
        updated_at=updated.updated_at,
    )


@router.post(
    "/registrations/{member_id}/reset-password",
    response_model=AdminActionResponse,
    dependencies=[Depends(require_admin_auth)],
)
def admin_reset_password(
    member_id: str,
    payload: AdminResetPasswordRequest,
    db: Session = Depends(get_db),
) -> AdminActionResponse:
    if len(payload.newPassword) < 4:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Password must be at least 4 characters")

    registration = get_registration_by_member_id(db, member_id)
    if not registration:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Member not found")

    reset_registration_password(db, registration, payload.newPassword)
    return AdminActionResponse(message="Password reset successful")
