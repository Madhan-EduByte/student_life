"""
DestinAI — Student Schemas
Pydantic schemas for student profile endpoints.
"""

from datetime import datetime
from typing import Any, Optional
from pydantic import BaseModel, field_validator, model_validator

class StudentProfileBase(BaseModel):
    interest_areas: Optional[str] = None
    strengths: Optional[str] = None
    preferred_stream: Optional[str] = None
    education_level: Optional[str] = None
    budget_range: Optional[str] = None
    location_preference: Optional[str] = None
    work_life_balance: Optional[str] = None
    risk_tolerance: Optional[str] = None
    interaction_style: Optional[str] = None

class StudentProfileCreate(StudentProfileBase):
    # Accept frontend field names as aliases
    interests: Optional[Any] = None
    industry_stream: Optional[str] = None
    budget: Optional[str] = None
    location: Optional[str] = None

    @model_validator(mode='before')
    @classmethod
    def map_frontend_fields(cls, data):
        if isinstance(data, dict):
            # Map frontend 'interests' (array) -> backend 'interest_areas' (comma-separated string)
            if 'interests' in data and data['interests'] and 'interest_areas' not in data:
                val = data['interests']
                data['interest_areas'] = ', '.join(val) if isinstance(val, list) else str(val)
            # If interest_areas is passed directly as a list, convert to comma-separated string
            if 'interest_areas' in data and isinstance(data['interest_areas'], list):
                data['interest_areas'] = ', '.join(data['interest_areas'])
            # Map frontend 'strengths' (array) -> backend 'strengths' (comma-separated string)
            if 'strengths' in data and isinstance(data['strengths'], list):
                data['strengths'] = ', '.join(data['strengths'])
            # Map frontend field names to backend field names
            if 'industry_stream' in data and data['industry_stream'] and 'preferred_stream' not in data:
                data['preferred_stream'] = data['industry_stream']
            if 'budget' in data and data['budget'] and 'budget_range' not in data:
                data['budget_range'] = data['budget']
            if 'location' in data and data['location'] and 'location_preference' not in data:
                data['location_preference'] = data['location']
        return data

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