"""
DestinAI — Parent Routes
Parent dashboard and student linking endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.roadmap import Roadmap
from app.models.student import ParentProfile, StudentProfile
from app.models.user import User
from app.schemas.auth import MessageResponse

router = APIRouter()


@router.get("/dashboard")
async def parent_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get parent dashboard data."""
    if current_user.role not in ["parent", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Parent role required.",
        )

    parent_profile = (
        db.query(ParentProfile)
        .filter(ParentProfile.user_id == current_user.id)
        .first()
    )

    if not parent_profile or not parent_profile.linked_student_id:
        return {
            "linked": False,
            "message": "No student linked yet. Use /parents/link to connect.",
            "student": None,
            "roadmap": None,
        }

    # Get linked student data
    student_user = (
        db.query(User).filter(User.id == parent_profile.linked_student_id).first()
    )
    student_profile = (
        db.query(StudentProfile)
        .filter(StudentProfile.user_id == parent_profile.linked_student_id)
        .first()
    )
    active_roadmap = (
        db.query(Roadmap)
        .filter(
            Roadmap.user_id == parent_profile.linked_student_id,
            Roadmap.is_active == True,
        )
        .first()
    )

    # Calculate milestone progress
    milestones_total = 0
    milestones_completed = 0
    if active_roadmap:
        milestones_total = len(active_roadmap.milestones)
        milestones_completed = sum(
            1 for m in active_roadmap.milestones if m.is_completed
        )

    return {
        "linked": True,
        "student": {
            "name": student_user.full_name if student_user else "Unknown",
            "email": student_user.email if student_user else None,
            "profile": {
                "interest_areas": student_profile.interest_areas if student_profile else None,
                "preferred_stream": student_profile.preferred_stream if student_profile else None,
                "education_level": student_profile.education_level if student_profile else None,
            },
        },
        "roadmap": {
            "title": active_roadmap.title if active_roadmap else None,
            "career_path": active_roadmap.career_path if active_roadmap else None,
            "confidence_score": active_roadmap.confidence_score if active_roadmap else None,
            "progress": f"{milestones_completed}/{milestones_total}",
            "progress_percent": (
                round(milestones_completed / milestones_total * 100, 1)
                if milestones_total > 0
                else 0
            ),
        },
    }


@router.post("/link", response_model=MessageResponse)
async def link_student(
    student_email: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Link a parent account to a student account."""
    if current_user.role not in ["parent", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Parent role required.",
        )

    # Find student by email
    student = (
        db.query(User)
        .filter(User.email == student_email, User.role == "student")
        .first()
    )
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found with that email",
        )

    # Get or create parent profile
    parent_profile = (
        db.query(ParentProfile)
        .filter(ParentProfile.user_id == current_user.id)
        .first()
    )

    if not parent_profile:
        parent_profile = ParentProfile(
            user_id=current_user.id,
            linked_student_id=student.id,
        )
        db.add(parent_profile)
    else:
        parent_profile.linked_student_id = student.id

    db.commit()

    return MessageResponse(
        message=f"Successfully linked to student: {student.full_name}",
        success=True,
    )
