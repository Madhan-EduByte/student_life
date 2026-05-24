"""
DestinAI — Models Package
Exports all SQLAlchemy models for Alembic and application use.
"""

from app.models.career import Career, CareerScore, Stream
from app.models.college import College, CollegeCourse, CollegeScore
from app.models.career_guide import (
    Milestone,
    CareerGuide,
    CareerGuideHistory,
    SessionLog,
    StudentOutcome,
)
from app.models.student import StudentProfile
from app.models.user import User

__all__ = [
    "User",
    "StudentProfile",
    "Career",
    "CareerScore",
    "Stream",
    "College",
    "CollegeCourse",
    "CollegeScore",
    "CareerGuide",
    "Milestone",
    "CareerGuideHistory",
    "StudentOutcome",
    "SessionLog",
]
