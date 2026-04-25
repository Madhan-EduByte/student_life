from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from pydantic import BaseModel

# NOTE: Import your actual database session dependency and models here
# from app.database import get_db
# from sqlalchemy.orm import Session
# import app.models as models

router = APIRouter(prefix="/api/v1/dashboard", tags=["Dashboard"])

# ------ Pydantic Response Models ------
class UpcomingTask(BaseModel):
    milestone_id: int
    title: str
    due_date: Optional[str] = None

class DashboardSummaryResponse(BaseModel):
    user_name: str
    preferred_stream: Optional[str] = None
    active_roadmap_title: Optional[str] = None
    completed_milestones: int = 0
    total_milestones: int = 0
    upcoming_tasks: List[UpcomingTask] = []

# ------ API Endpoints ------
@router.get("/student", response_model=DashboardSummaryResponse)
def get_student_dashboard(user_id: int = 1): # Hardcoded user_id=1 for demo, replace with auth dependency
    """Fetch aggregated data to populate the student dashboard."""
    
    # 1. Fetch user data (from `users` and `student_profiles` table)
    # 2. Fetch their active roadmap (from `roadmaps` table where is_active=True)
    # 3. Calculate milestone progress (Count from `milestones` table where roadmap_id = active_roadmap.id)
    # 4. Get next 3 tasks (from `milestones` where is_completed=False limit 3)
    
    # Returning mock data for testing purposes
    return {
        "user_name": "Demo Student",
        "preferred_stream": "science",
        "active_roadmap_title": "Software Engineering Fast-Track",
        "completed_milestones": 3,
        "total_milestones": 12,
        "upcoming_tasks": [
            {"milestone_id": 4, "title": "Complete React Basics", "due_date": "2026-04-15"},
            {"milestone_id": 5, "title": "Build a Simple API", "due_date": "2026-04-22"}
        ]
    }