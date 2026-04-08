"""
DestinAI — Student Schemas
Pydantic schemas for student profiles and career inputs.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class CareerInputs(BaseModel):
    """The 6 smart inputs for AI career guidance."""

    interest_areas: str = Field(
        ..., description="What are your interests? (e.g., technology, art, medicine)"
    )
    strengths: str = Field(
        ..., description="What are your strengths? (e.g., problem-solving, creativity)"
    )
    preferred_stream: str = Field(
        ...,
        description="Preferred stream",
        pattern="^(science|commerce|arts|vocational)$",
    )
    education_level: str = Field(
        ..., description="Current education level (e.g., 10th, 12th, UG)"
    )
    budget_range: str = Field(
        ..., description="Budget range (e.g., below 1L, 1-5L, 5-10L, above 10L)"
    )
    location_preference: str = Field(
        ..., description="Preferred location (e.g., Bangalore, Any India, Abroad)"
    )


class StudentProfileCreate(BaseModel):
    """Schema for creating/updating student profile."""

    date_of_birth: Optional[datetime] = None
    gender: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = "India"
    current_school: Optional[str] = None
    current_grade: Optional[str] = None
    board: Optional[str] = None
    percentage_score: Optional[str] = None
    interest_areas: Optional[str] = None
    strengths: Optional[str] = None
    preferred_stream: Optional[str] = None
    education_level: Optional[str] = None
    budget_range: Optional[str] = None
    location_preference: Optional[str] = None


class StudentProfileResponse(BaseModel):
    """Student profile response schema."""

    id: int
    user_id: int
    interest_areas: Optional[str] = None
    strengths: Optional[str] = None
    preferred_stream: Optional[str] = None
    education_level: Optional[str] = None
    budget_range: Optional[str] = None
    location_preference: Optional[str] = None
    date_of_birth: Optional[datetime] = None
    gender: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    current_school: Optional[str] = None
    current_grade: Optional[str] = None
    board: Optional[str] = None
    percentage_score: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
