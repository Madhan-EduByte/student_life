from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

# NOTE: Import your actual database session dependency and models here
# from app.database import get_db
# from sqlalchemy.orm import Session
# import app.models as models

router = APIRouter(prefix="/api/v1/roadmaps", tags=["Roadmaps & Milestones"])

# ------ Pydantic Response Models ------
class MilestoneResponse(BaseModel):
    id: int
    week_number: int
    title: str
    description: Optional[str] = None
    category: Optional[str] = None
    priority: Optional[str] = None
    is_completed: bool
    due_date: Optional[datetime] = None

class RoadmapResponse(BaseModel):
    id: int
    user_id: int
    title: str
    summary: Optional[str] = None
    career_path: Optional[str] = None
    recommended_stream: Optional[str] = None
    is_active: bool
    milestones: List[MilestoneResponse] = []

# ------ API Endpoints ------
@router.get("", response_model=List[RoadmapResponse])
def get_user_roadmaps(user_id: int = 1): # Hardcoded user_id=1 for demo, replace with auth dependency
    """Fetch all roadmaps for the currently logged-in user."""
    # Example SQLAlchemy query:
    # roadmaps = db.query(models.Roadmap).filter(models.Roadmap.user_id == user_id).all()
    
    # Returning mock data for testing purposes
    return [
        {
            "id": 1,
            "user_id": user_id,
            "title": "Software Engineering Fast-Track",
            "summary": "A comprehensive guide to becoming a full-stack developer.",
            "career_path": "Software Engineer",
            "recommended_stream": "science",
            "is_active": True,
            "milestones": [
                {
                    "id": 1,
                    "week_number": 1,
                    "title": "HTML, CSS, and JS Fundamentals",
                    "description": "Learn the building blocks of the web.",
                    "category": "learning",
                    "priority": "high",
                    "is_completed": True,
                    "due_date": "2026-04-01T10:00:00Z"
                },
                {
                    "id": 2,
                    "week_number": 2,
                    "title": "Introduction to React",
                    "description": "Understand components, state, and props.",
                    "category": "learning",
                    "priority": "high",
                    "is_completed": False,
                    "due_date": "2026-04-15T10:00:00Z"
                }
            ]
        }
    ]

@router.get("/{roadmap_id}", response_model=RoadmapResponse)
def get_roadmap_details(roadmap_id: int, user_id: int = 1):
    """Fetch a specific roadmap and its attached milestones."""
    # For testing, we'll just return the first roadmap from the list above
    roadmaps = get_user_roadmaps(user_id)
    return roadmaps[0]