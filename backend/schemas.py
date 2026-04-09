from typing import Optional
from pydantic import BaseModel, Field, ConfigDict

class FeatureFlagCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Unique name of the flag")
    description: Optional[str] = Field(None, max_length=255)
    is_enabled: bool = Field(default=False)

class FeatureFlagUpdate(BaseModel):
    is_enabled: bool

class FeatureFlagResponse(FeatureFlagCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: str
    updated_at: str
