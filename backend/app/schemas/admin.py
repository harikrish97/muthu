from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, ConfigDict, Field


class AdminLoginRequest(BaseModel):
    username: str
    password: str


class AdminLoginResponse(BaseModel):
    token: str


class AdminRegistrationItem(BaseModel):
    id: str
    member_id: str = Field(serialization_alias="memberId")
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    city: Optional[str] = None
    address: Optional[str] = None
    gender: Optional[str] = None
    dob: Optional[str] = None
    education: Optional[str] = None
    occupation: Optional[str] = None
    gothram: Optional[str] = None
    message: Optional[str] = None
    status: str
    is_active: bool = Field(serialization_alias="isActive")
    credits: int
    extra_data: dict[str, Any] = Field(serialization_alias="extraData")
    created_at: datetime = Field(serialization_alias="createdAt")
    updated_at: Optional[datetime] = Field(serialization_alias="updatedAt")

    model_config = ConfigDict(populate_by_name=True)


class AdminRegistrationUpdateRequest(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    city: Optional[str] = None
    address: Optional[str] = None
    gender: Optional[str] = None
    dob: Optional[str] = None
    education: Optional[str] = None
    occupation: Optional[str] = None
    gothram: Optional[str] = None
    message: Optional[str] = None
    status: Optional[str] = None
    isActive: Optional[bool] = None
    credits: Optional[int] = None
    extraData: Optional[dict[str, Any]] = None

    model_config = ConfigDict(extra="allow")


class AdminResetPasswordRequest(BaseModel):
    newPassword: str


class AdminActionResponse(BaseModel):
    message: str


class AdminRegistrationListResponse(BaseModel):
    items: list[AdminRegistrationItem]
    total: int
    page: int
    page_size: int = Field(serialization_alias="pageSize")
    total_pages: int = Field(serialization_alias="totalPages")

    model_config = ConfigDict(populate_by_name=True)
