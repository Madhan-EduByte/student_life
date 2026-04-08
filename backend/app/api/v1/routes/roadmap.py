"""
DestinAI — Roadmap Routes
AI roadmap generation, retrieval, update, and milestone management.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.roadmap import (
    MilestoneResponse,
    MilestoneUpdate,
    RoadmapGenerate,
    RoadmapListResponse,
    RoadmapResponse,
)
from app.services.roadmap_service import roadmap_service

router = APIRouter()


@router.post("/generate", response_model=RoadmapResponse, status_code=201)
async def generate_roadmap(
    data: RoadmapGenerate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Generate an AI career roadmap from 6 inputs."""
    career_inputs = data.career_inputs.model_dump()
    roadmap = await roadmap_service.generate_roadmap(
        db, current_user.id, career_inputs
    )
    return roadmap


@router.get("", response_model=RoadmapListResponse)
async def list_roadmaps(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all roadmaps for the current user."""
    roadmaps = roadmap_service.get_user_roadmaps(db, current_user.id)
    return RoadmapListResponse(
        roadmaps=[RoadmapResponse.model_validate(r) for r in roadmaps],
        total=len(roadmaps),
    )


@router.get("/active", response_model=RoadmapResponse)
async def get_active_roadmap(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get the currently active roadmap."""
    roadmap = roadmap_service.get_active_roadmap(db, current_user.id)
    if not roadmap:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active roadmap found. Generate one first.",
        )
    return roadmap


@router.get("/{roadmap_id}", response_model=RoadmapResponse)
async def get_roadmap(
    roadmap_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get a specific roadmap."""
    roadmap = roadmap_service.get_roadmap(db, roadmap_id)
    if not roadmap:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Roadmap not found",
        )
    if roadmap.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )
    return roadmap


@router.put("/{roadmap_id}/update", response_model=RoadmapResponse)
async def update_roadmap(
    roadmap_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Trigger a living roadmap update."""
    roadmap = roadmap_service.get_roadmap(db, roadmap_id)
    if not roadmap or roadmap.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Roadmap not found",
        )

    updated_roadmap = await roadmap_service.update_roadmap(db, roadmap_id)
    if not updated_roadmap:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update roadmap",
        )
    return updated_roadmap


@router.get("/{roadmap_id}/milestones")
async def get_milestones(
    roadmap_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get weekly milestones for a roadmap."""
    roadmap = roadmap_service.get_roadmap(db, roadmap_id)
    if not roadmap or roadmap.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Roadmap not found",
        )

    milestones = roadmap_service.get_milestones(db, roadmap_id)
    return [MilestoneResponse.model_validate(m) for m in milestones]


@router.patch("/milestones/{milestone_id}", response_model=MilestoneResponse)
async def update_milestone(
    milestone_id: int,
    data: MilestoneUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Mark a milestone as complete or incomplete."""
    milestone = roadmap_service.update_milestone(
        db, milestone_id, data.is_completed
    )
    if not milestone:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Milestone not found",
        )
    return milestone
