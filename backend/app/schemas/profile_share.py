from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class ProfileShareCreateRequest(BaseModel):
    expires_in_days: int = Field(default=7, ge=1, le=30, serialization_alias="expiresInDays")
    include_contact_details: bool = Field(default=False, serialization_alias="includeContactDetails")

    model_config = ConfigDict(populate_by_name=True, extra="forbid")


class ProfileShareCreateResponse(BaseModel):
    token: str
    share_path: str = Field(serialization_alias="sharePath")
    expires_at: datetime = Field(serialization_alias="expiresAt")
    include_contact_details: bool = Field(serialization_alias="includeContactDetails")
    link_status: str = Field(serialization_alias="linkStatus")

    model_config = ConfigDict(populate_by_name=True)


class SharedProfileContact(BaseModel):
    phone: Optional[str] = None
    whatsapp_number: Optional[str] = Field(default=None, serialization_alias="whatsappNumber")
    alternate_contact_number: Optional[str] = Field(default=None, serialization_alias="alternateContactNumber")
    email: Optional[str] = None
    primary_contact_name: Optional[str] = Field(default=None, serialization_alias="primaryContactName")
    primary_contact_relation: Optional[str] = Field(default=None, serialization_alias="primaryContactRelation")

    model_config = ConfigDict(populate_by_name=True)


class SharedProfileData(BaseModel):
    name: str
    gender: Optional[str] = None
    dob: Optional[str] = None
    age: Optional[int] = None
    location: Optional[str] = None
    education: Optional[str] = None
    occupation: Optional[str] = None
    gothram: Optional[str] = None
    nakshatra: Optional[str] = None
    sect: Optional[str] = None
    subsect: Optional[str] = None
    about: Optional[str] = None
    family_details: Optional[str] = Field(default=None, serialization_alias="familyDetails")
    image_url: Optional[str] = Field(default=None, serialization_alias="imageUrl")
    contact: Optional[SharedProfileContact] = None

    model_config = ConfigDict(populate_by_name=True)


class ProfileSharePublicResponse(BaseModel):
    profile: SharedProfileData
    expires_at: datetime = Field(serialization_alias="expiresAt")
    link_status: str = Field(serialization_alias="linkStatus")
    include_contact_details: bool = Field(serialization_alias="includeContactDetails")

    model_config = ConfigDict(populate_by_name=True)


class ProfileShareRevokeResponse(BaseModel):
    message: str
    link_status: str = Field(serialization_alias="linkStatus")

    model_config = ConfigDict(populate_by_name=True)
