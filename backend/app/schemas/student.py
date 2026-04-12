"""
DestinAI — Student Schemas
Pydantic schemas for student profile endpoints.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, field_validator

class StudentProfileBase(BaseModel):
    interest_areas: Optional[str] = None
    strengths: Optional[str] = None
    preferred_stream: Optional[str] = None
    education_level: Optional[str] = None
    budget_range: Optional[str] = None
    location_preference: Optional[str] = None

class StudentProfileCreate(StudentProfileBase):
    pass

class StudentProfileResponse(StudentProfileBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    @field_validator('created_at', 'updated_at', mode='before')
    @classmethod
    def handle_zero_datetime(cls, v):
        if isinstance(v, str) and v.startswith('0000-00-00'):
            return datetime.utcnow()
        return v

    class Config:
        from_attributes = True