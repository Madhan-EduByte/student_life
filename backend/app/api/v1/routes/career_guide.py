"""
DestinAI — CareerGuide Routes
AI career_guide generation, retrieval, update, and milestone management.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.career_guide import (
    MilestoneResponse,
    MilestoneUpdate,
    CareerGuideGenerate,
    CareerGuideListResponse,
    CareerGuideResponse,
)
from app.services.career_guide_service import career_guide_service

router = APIRouter()


@router.post("/generate", response_model=CareerGuideResponse, status_code=201)
async def generate_career_guide(
    data: CareerGuideGenerate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Generate an AI career career_guide from 6 inputs."""
    career_inputs = data.career_inputs.model_dump()
    career_guide = await career_guide_service.generate_career_guide(
        db, current_user.id, career_inputs
    )
    return career_guide


@router.get("", response_model=CareerGuideListResponse)
async def list_career_guides(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all career_guides for the current user."""
    career_guides = career_guide_service.get_user_career_guides(db, current_user.id)
    return CareerGuideListResponse(
        career_guides=[CareerGuideResponse.model_validate(r) for r in career_guides],
        total=len(career_guides),
    )


@router.get("/active", response_model=CareerGuideResponse)
async def get_active_career_guide(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get the currently active career_guide."""
    career_guide = career_guide_service.get_active_career_guide(db, current_user.id)
    if not career_guide:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active career_guide found. Generate one first.",
        )
    return career_guide


@router.get("/{career_guide_id}", response_model=CareerGuideResponse)
async def get_career_guide(
    career_guide_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get a specific career_guide."""
    career_guide = career_guide_service.get_career_guide(db, career_guide_id)
    if not career_guide:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="CareerGuide not found",
        )
    if career_guide.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )
    return career_guide


@router.put("/{career_guide_id}/update", response_model=CareerGuideResponse)
async def update_career_guide(
    career_guide_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Trigger a living career_guide update."""
    career_guide = career_guide_service.get_career_guide(db, career_guide_id)
    if not career_guide or career_guide.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="CareerGuide not found",
        )

    updated_career_guide = await career_guide_service.update_career_guide(db, career_guide_id)
    if not updated_career_guide:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update career_guide",
        )
    return updated_career_guide


@router.get("/{career_guide_id}/milestones")
async def get_milestones(
    career_guide_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get weekly milestones for a career_guide."""
    career_guide = career_guide_service.get_career_guide(db, career_guide_id)
    if not career_guide or career_guide.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="CareerGuide not found",
        )

    milestones = career_guide_service.get_milestones(db, career_guide_id)
    return [MilestoneResponse.model_validate(m) for m in milestones]


@router.patch("/milestones/{milestone_id}", response_model=MilestoneResponse)
async def update_milestone(
    milestone_id: int,
    data: MilestoneUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Mark a milestone as complete or incomplete."""
    milestone = career_guide_service.update_milestone(
        db, milestone_id, data.is_completed
    )
    if not milestone:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Milestone not found",
        )
    return milestone
