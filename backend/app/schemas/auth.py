from pydantic import BaseModel, ConfigDict
from typing import Optional


class MemberLoginRequest(BaseModel):
    memberId: str
    password: str


class MemberIdentity(BaseModel):
    id: str
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    gender: Optional[str] = None
    dob: Optional[str] = None
    city: Optional[str] = None
    address: Optional[str] = None
    education: Optional[str] = None
    occupation: Optional[str] = None
    message: Optional[str] = None
    gothram: Optional[str] = None
    isActive: bool
    credits: int


class MemberProfile(BaseModel):
    sNo: int
    profileId: str
    name: str
    height: str
    starPadham: str
    hasPhoto: bool


class MemberLoginResponse(BaseModel):
    member: MemberIdentity
    profiles: list[MemberProfile]
    token: str

    model_config = ConfigDict(populate_by_name=True)


class MemberProfileUpdateRequest(BaseModel):
    address: Optional[str] = None
    occupation: Optional[str] = None
    message: Optional[str] = None

    model_config = ConfigDict(extra="forbid")
