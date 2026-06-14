"""
DestinAI — CareerGuide Schemas
Pydantic schemas for career_guide and milestone endpoints.
"""

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, field_validator

from app.schemas.student import StudentProfileCreate


class CareerGuideGenerate(BaseModel):
    """Request to generate an AI career_guide from 6 inputs."""

    career_inputs: StudentProfileCreate


class MilestoneResponse(BaseModel):
    """Milestone response schema."""

    id: int
    week_number: int
    title: str
    description: Optional[str] = None
    category: Optional[str] = None
    priority: str = "medium"
    estimated_hours: Optional[float] = None
    resources: Optional[str] = None
    is_completed: bool = False
    completed_at: Optional[datetime] = None
    due_date: Optional[datetime] = None
    order: int = 0

    class Config:
        from_attributes = True


class CareerGuideResponse(BaseModel):
    """CareerGuide response schema."""

    id: int
    user_id: int
    title: str
    summary: Optional[str] = None
    career_path: Optional[str] = None
    recommended_stream: Optional[str] = None
    confidence_score: Optional[float] = None
    future_proof_score: Optional[float] = None
    ai_model_used: Optional[str] = None
    version: int
    is_active: bool
    next_update_at: Optional[datetime] = None
    milestones: List[MilestoneResponse] = []
    alternative_careers: Optional[List[str]] = []
    created_at: datetime
    updated_at: datetime

    @field_validator('created_at', 'updated_at', mode='before')
    @classmethod
    def handle_zero_datetime(cls, v):
        if isinstance(v, str) and v.startswith('0000-00-00'):
            return datetime.utcnow()
        return v

    @field_validator('alternative_careers', mode='before')
    @classmethod
    def parse_alternative_careers(cls, v):
        """Deserialize JSON string or list to a Python list."""
        if v is None:
            return []
        if isinstance(v, list):
            return v
        if isinstance(v, str):
            try:
                import json as _json
                parsed = _json.loads(v)
                return parsed if isinstance(parsed, list) else []
            except Exception:
                return []
        return []

    class Config:
        from_attributes = True


class CareerGuideListResponse(BaseModel):
    """List of career_guides for a user."""

    career_guides: List[CareerGuideResponse]
    total: int


class MilestoneUpdate(BaseModel):
    """Update a milestone (mark complete/incomplete)."""

    is_completed: bool


class CareerGuideHistoryResponse(BaseModel):
    """CareerGuide version history."""

    id: int
    version: int
    changes_summary: Optional[str] = None
    reason: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
