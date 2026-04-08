"""
DestinAI — Career Routes
Career listing, details, and future-proof score endpoints.
"""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.career import Career, CareerScore
from app.models.user import User
from app.schemas.career import (
    CareerListResponse,
    CareerResponse,
    CareerWithScore,
    FutureProofScore,
)

router = APIRouter()


@router.get("", response_model=CareerListResponse)
async def list_careers(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    stream: Optional[str] = None,
    category: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """List all career options with filters and pagination."""
    query = db.query(Career)

    if stream:
        query = query.filter(Career.stream == stream)
    if category:
        query = query.filter(Career.category.ilike(f"%{category}%"))
    if search:
        query = query.filter(
            Career.title.ilike(f"%{search}%")
            | Career.description.ilike(f"%{search}%")
        )

    total = query.count()
    offset = (page - 1) * per_page
    careers = query.offset(offset).limit(per_page).all()

    return CareerListResponse(
        careers=[CareerResponse.model_validate(c) for c in careers],
        total=total,
        page=page,
        per_page=per_page,
    )


@router.get("/{career_id}", response_model=CareerWithScore)
async def get_career(career_id: int, db: Session = Depends(get_db)):
    """Get career details with future-proof score."""
    career = db.query(Career).filter(Career.id == career_id).first()
    if not career:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Career not found",
        )

    # Get future-proof score
    score = (
        db.query(CareerScore)
        .filter(CareerScore.career_id == career_id)
        .first()
    )

    career_data = CareerResponse.model_validate(career)
    result = CareerWithScore(
        **career_data.model_dump(),
        future_proof=FutureProofScore.model_validate(score) if score else None,
    )
    return result
