"""
DestinAI — Roadmap Schemas
Pydantic schemas for roadmap and milestone endpoints.
"""

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel

from app.schemas.student import CareerInputs


class RoadmapGenerate(BaseModel):
    """Request to generate an AI roadmap from 6 inputs."""

    career_inputs: CareerInputs


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


class RoadmapResponse(BaseModel):
    """Roadmap response schema."""

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
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class RoadmapListResponse(BaseModel):
    """List of roadmaps for a user."""

    roadmaps: List[RoadmapResponse]
    total: int


class MilestoneUpdate(BaseModel):
    """Update a milestone (mark complete/incomplete)."""

    is_completed: bool


class RoadmapHistoryResponse(BaseModel):
    """Roadmap version history."""

    id: int
    version: int
    changes_summary: Optional[str] = None
    reason: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
