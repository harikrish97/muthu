from datetime import datetime
from typing import Any
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class RegistrationCreate(BaseModel):
    name: str
    email: Optional[str] = None
    password: str
    phone: Optional[str] = None
    gender: Optional[str] = None
    dob: Optional[str] = None
    city: Optional[str] = None
    address: Optional[str] = None
    education: Optional[str] = None
    occupation: Optional[str] = None
    gothram: Optional[str] = None
    message: Optional[str] = None

    model_config = ConfigDict(extra="allow")


class RegistrationCreateResponse(BaseModel):
    id: str


class RegistrationListItem(BaseModel):
    id: str
    data: dict[str, Any]
    created_at: datetime = Field(serialization_alias="createdAt")
    status: str
    is_active: bool = Field(serialization_alias="isActive")
    credits: int

    model_config = ConfigDict(populate_by_name=True)
