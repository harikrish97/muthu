from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class PublicRecentProfileItem(BaseModel):
    profile_id: str = Field(serialization_alias="profileId")
    age: Optional[int] = None
    profession: Optional[str] = None
    location: Optional[str] = None
    gothram: Optional[str] = None
    image_url: Optional[str] = Field(default=None, serialization_alias="imageUrl")

    model_config = ConfigDict(populate_by_name=True)


class PublicRecentProfilesResponse(BaseModel):
    items: list[PublicRecentProfileItem]

