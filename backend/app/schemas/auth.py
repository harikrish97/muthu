from pydantic import BaseModel, ConfigDict


class MemberLoginRequest(BaseModel):
    memberId: str
    password: str


class MemberIdentity(BaseModel):
    id: str
    name: str


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

    model_config = ConfigDict(populate_by_name=True)
