"""
DestinAI — Student Routes
Student profile management and preferences.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.models.student import StudentProfile
from app.schemas.student import StudentProfileCreate, StudentProfileResponse

router = APIRouter()

@router.get("/profile", response_model=StudentProfileResponse)
async def get_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get the current student's profile."""
    if current_user.role != "student":
        raise HTTPException(status_code=403, detail="Not a student")

    profile = (
        db.query(StudentProfile)
        .filter(StudentProfile.user_id == current_user.id)
        .first()
    )
    
    # Auto-create an empty profile if the database seed missed this user
    if not profile:
        profile = StudentProfile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)

    # Self-healing: Populate demo users if their profile is currently blank
    if not profile.interest_areas and current_user.email in ['student@example.com', 'student2@example.com', 'student3@example.com']:
        if current_user.email == 'student@example.com':
            profile.interest_areas = 'technical, analytical'
            profile.strengths = 'technical_systems, mathematical'
            profile.preferred_stream = 'technology'
            profile.education_level = 'bachelor'
            profile.budget_range = 'high'
            profile.location_preference = 'major_hub'
            profile.work_life_balance = 'standard'
            profile.risk_tolerance = 'moderate'
            profile.interaction_style = 'balanced'
        elif current_user.email == 'student2@example.com':
            profile.interest_areas = 'enterprising, organizational'
            profile.strengths = 'communication, interpersonal'
            profile.preferred_stream = 'business'
            profile.education_level = 'bachelor'
            profile.budget_range = 'high'
            profile.location_preference = 'major_hub'
            profile.work_life_balance = 'hustle'
            profile.risk_tolerance = 'high'
            profile.interaction_style = 'collaborative'
        elif current_user.email == 'student3@example.com':
            profile.interest_areas = 'creative, social'
            profile.strengths = 'creative_spatial, interpersonal'
            profile.preferred_stream = 'creative_arts'
            profile.education_level = 'bachelor'
            profile.budget_range = 'medium'
            profile.location_preference = 'remote'
            profile.work_life_balance = 'flexible'
            profile.risk_tolerance = 'moderate'
            profile.interaction_style = 'balanced'
        db.commit()
        db.refresh(profile)

    return profile

@router.put("/profile", response_model=StudentProfileResponse)
async def update_profile(
    profile_data: StudentProfileCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update the current student's profile/AI inputs."""
    if current_user.role != "student":
        raise HTTPException(status_code=403, detail="Not a student")

    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not profile:
        profile = StudentProfile(user_id=current_user.id)
        db.add(profile)

    # Clean and map fields manually to ensure 100% robust data updates
    raw_data = profile_data.model_dump(exclude_unset=True)
    
    # Explicit mapping for frontend keys
    if "interests" in raw_data and raw_data["interests"] is not None:
        val = raw_data["interests"]
        profile.interest_areas = ", ".join(val) if isinstance(val, list) else str(val)
    elif "interest_areas" in raw_data and raw_data["interest_areas"] is not None:
        val = raw_data["interest_areas"]
        profile.interest_areas = ", ".join(val) if isinstance(val, list) else str(val)

    if "strengths" in raw_data and raw_data["strengths"] is not None:
        val = raw_data["strengths"]
        profile.strengths = ", ".join(val) if isinstance(val, list) else str(val)

    if "industry_stream" in raw_data and raw_data["industry_stream"] is not None:
        profile.preferred_stream = raw_data["industry_stream"]
    elif "preferred_stream" in raw_data and raw_data["preferred_stream"] is not None:
        profile.preferred_stream = raw_data["preferred_stream"]

    if "budget" in raw_data and raw_data["budget"] is not None:
        profile.budget_range = raw_data["budget"]
    elif "budget_range" in raw_data and raw_data["budget_range"] is not None:
        profile.budget_range = raw_data["budget_range"]

    if "location" in raw_data and raw_data["location"] is not None:
        profile.location_preference = raw_data["location"]
    elif "location_preference" in raw_data and raw_data["location_preference"] is not None:
        profile.location_preference = raw_data["location_preference"]

    # Map other fields
    for field in ["education_level", "work_life_balance", "risk_tolerance", "interaction_style"]:
        if field in raw_data and raw_data[field] is not None:
            setattr(profile, field, raw_data[field])

    db.commit()
    db.refresh(profile)
    return profile