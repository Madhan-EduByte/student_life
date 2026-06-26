"""
DestinAI — Career Schemas
Pydantic schemas for career endpoints.
"""

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


class CareerResponse(BaseModel):
    """Single career response."""

    id: int
    title: str
    slug: str
    description: Optional[str] = None
    stream: Optional[str] = None
    category: Optional[str] = None
    sub_category: Optional[str] = None
    required_education: Optional[str] = None
    required_skills: Optional[str] = None
    average_salary_entry: Optional[float] = None
    average_salary_mid: Optional[float] = None
    average_salary_senior: Optional[float] = None
    growth_rate: Optional[float] = None
    demand_level: Optional[str] = None
    work_environment: Optional[str] = None
    icon: Optional[str] = None

    class Config:
        from_attributes = True


class FutureProofScore(BaseModel):
    """Career future-proof score response."""

    career_id: int
    automation_risk: Optional[float] = None
    ai_replacement_risk: Optional[float] = None
    salary_projection_5yr: Optional[float] = None
    salary_projection_10yr: Optional[float] = None
    salary_projection_20yr: Optional[float] = None
    future_proof_score: Optional[float] = None
    market_demand_score: Optional[float] = None
    skill_transferability: Optional[float] = None

    class Config:
        from_attributes = True


class CareerWithScore(CareerResponse):
    """Career with future-proof score."""

    future_proof: Optional[FutureProofScore] = None


class CareerListResponse(BaseModel):
    """Paginated career list response."""

    careers: List[CareerResponse]
    total: int
    page: int
    per_page: int


class CareerSimulationRequest(BaseModel):
    """Request for career simulation."""

    career_id: Optional[int] = None        # DB career id (for DB-sourced careers)
    career_title: Optional[str] = None     # Direct title (for AI-generated careers with no DB id)
    simulation_duration: str = "1_day"     # 1_day, 1_week, 1_month


class CareerSimulationResponse(BaseModel):
    """Career simulation response."""

    career_title: str
    simulation: str
    daily_tasks: List[str]
    challenges: List[str]
    rewards: List[str]
    typical_salary: Optional[float] = None
    ai_model_used: str
