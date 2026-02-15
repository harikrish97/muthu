from typing import Any, Optional

from pydantic import BaseModel, ConfigDict, Field


class MemberProfileBasic(BaseModel):
    profile_id: str = Field(serialization_alias="profileId")
    name: str
    gender: Optional[str] = None
    dob: Optional[str] = None
    age: Optional[int] = None
    height: str
    star_padham: str = Field(serialization_alias="starPadham")
    rasi: Optional[str] = None
    nakshatra: Optional[str] = None
    sect: Optional[str] = None
    subsect: Optional[str] = None
    horoscope_matching_required: Optional[str] = Field(default=None, serialization_alias="horoscopeMatchingRequired")
    city: Optional[str] = None
    education: Optional[str] = None
    occupation: Optional[str] = None
    gothram: Optional[str] = None
    image_url: Optional[str] = Field(default=None, serialization_alias="imageUrl")
    has_photo: bool = Field(serialization_alias="hasPhoto")
    unlocked: bool

    model_config = ConfigDict(populate_by_name=True)


class MemberProfileDetails(BaseModel):
    about: Optional[str] = None
    family_details: Optional[str] = Field(default=None, serialization_alias="familyDetails")
    phone: Optional[str] = None
    email: Optional[str] = None
    dob: Optional[str] = None
    city: Optional[str] = None
    address: Optional[str] = None
    education: Optional[str] = None
    occupation: Optional[str] = None
    gothram: Optional[str] = None
    additional_data: dict[str, Any] = Field(default_factory=dict, serialization_alias="additionalData")

    model_config = ConfigDict(populate_by_name=True)


class MemberProfileDetailResponse(BaseModel):
    profile: MemberProfileBasic
    full_details: Optional[MemberProfileDetails] = Field(default=None, serialization_alias="fullDetails")
    credits_remaining: int = Field(serialization_alias="creditsRemaining")

    model_config = ConfigDict(populate_by_name=True)


class MemberProfileListResponse(BaseModel):
    items: list[MemberProfileBasic]
    credits_remaining: int = Field(serialization_alias="creditsRemaining")
    total: int
    page: int
    page_size: int = Field(serialization_alias="pageSize")
    total_pages: int = Field(serialization_alias="totalPages")

    model_config = ConfigDict(populate_by_name=True)


class UnlockProfileResponse(BaseModel):
    message: str
    profile: MemberProfileBasic
    full_details: MemberProfileDetails = Field(serialization_alias="fullDetails")
    credits_remaining: int = Field(serialization_alias="creditsRemaining")

    model_config = ConfigDict(populate_by_name=True)
