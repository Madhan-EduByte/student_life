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
            profile.interest_areas = 'technology, coding, logic'
            profile.strengths = 'problem-solving, mathematics'
            profile.preferred_stream = 'science'
            profile.education_level = '12th Grade'
            profile.budget_range = '1-5 Lakhs'
            profile.location_preference = 'Bangalore, India'
        elif current_user.email == 'student2@example.com':
            profile.interest_areas = 'business, marketing, finance'
            profile.strengths = 'leadership, communication'
            profile.preferred_stream = 'commerce'
            profile.education_level = '12th Grade'
            profile.budget_range = '5-10 Lakhs'
            profile.location_preference = 'Mumbai, India'
        elif current_user.email == 'student3@example.com':
            profile.interest_areas = 'art, design, psychology'
            profile.strengths = 'creativity, empathy'
            profile.preferred_stream = 'arts'
            profile.education_level = '12th Grade'
            profile.budget_range = '10-15 Lakhs'
            profile.location_preference = 'Delhi, India'
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

    update_data = profile_data.model_dump(exclude_unset=True, exclude={"interests", "industry_stream", "budget", "location"})
    for key, value in update_data.items():
        setattr(profile, key, value)

    db.commit()
    db.refresh(profile)
    return profile