"""
DestinAI — Simulation Routes
Career simulation endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.career import Career
from app.models.user import User
from app.schemas.career import CareerSimulationRequest, CareerSimulationResponse
from app.services.ai_service import ai_service

router = APIRouter()


@router.post("/simulate", response_model=CareerSimulationResponse)
async def simulate_career(
    data: CareerSimulationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Start an AI career simulation.
    
    Accepts either:
    - career_id: look up the career title from the DB (DB-sourced careers)
    - career_title: use the title directly (AI-generated careers with no DB row)
    """
    if data.career_id is not None:
        # DB-sourced career
        career = db.query(Career).filter(Career.id == data.career_id).first()
        if not career:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Career not found",
            )
        title = career.title
    elif data.career_title:
        # AI-generated career — simulate by title directly
        title = data.career_title
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Provide either career_id or career_title.",
        )

    result = await ai_service.simulate_career(title, data.simulation_duration)
    return CareerSimulationResponse(**result)


@router.get("/simulate/{career_id}", response_model=CareerSimulationResponse)
async def simulate_career_get(
    career_id: int,
    duration: str = "1_day",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Start a career simulation via GET (convenience endpoint)."""
    career = db.query(Career).filter(Career.id == career_id).first()
    if not career:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Career not found",
        )

    result = await ai_service.simulate_career(career.title, duration)
    return CareerSimulationResponse(**result)
