from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict, field_serializer

class FeatureFlagCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, pattern=r'^[a-z0-9_-]+$', description="Unique name of the flag (lowercase letters, digits, underscores, hyphens only)")
    description: Optional[str] = Field(None, max_length=255)
    is_enabled: bool = Field(default=False)

class FeatureFlagUpdate(BaseModel):
    is_enabled: bool

class FeatureFlagResponse(BaseModel):
    """Read-only response schema — decoupled from input validation constraints."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: Optional[str]
    is_enabled: bool
    created_at: datetime
    updated_at: datetime

    @field_serializer('created_at', 'updated_at')
    def serialize_datetime(self, dt: datetime) -> str:
        return dt.isoformat() + 'Z'
