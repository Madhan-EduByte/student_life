"""
DestinAI — College Routes
College listing, filtering, matching, and detail endpoints.
"""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.college import (
    CollegeDetailResponse,
    CollegeFilters,
    CollegeListResponse,
    CollegeMatchResponse,
    CollegeResponse,
)
from app.services.college_service import college_service

router = APIRouter()


@router.get("", response_model=CollegeListResponse)
async def list_colleges(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    stream: Optional[str] = None,
    city: Optional[str] = None,
    state: Optional[str] = None,
    country: Optional[str] = None,
    type: Optional[str] = None,
    fee_max: Optional[float] = None,
    min_placement_rate: Optional[float] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """List colleges with filters and pagination."""
    filters = CollegeFilters(
        stream=stream,
        city=city,
        state=state,
        country=country,
        type=type,
        fee_max=fee_max,
        min_placement_rate=min_placement_rate,
        search=search,
        page=page,
        per_page=per_page,
    )

    colleges, total = college_service.get_colleges(db, filters)

    return CollegeListResponse(
        colleges=[CollegeResponse.model_validate(c) for c in colleges],
        total=total,
        page=page,
        per_page=per_page,
    )


@router.get("/match")
async def match_colleges(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get AI-matched colleges for the current student."""
    from app.models.student import StudentProfile

    profile = (
        db.query(StudentProfile)
        .filter(StudentProfile.user_id == current_user.id)
        .first()
    )

    criteria = {}
    if profile:
        criteria = {
            "location": profile.location_preference or "",
            "budget_range": profile.budget_range or "",
            "preferred_stream": profile.preferred_stream or "",
        }

    matches = college_service.match_colleges(db, current_user.id, criteria)

    return [
        {
            "college": CollegeResponse.model_validate(m["college"]),
            "match_score": m["match_score"],
            "match_reasons": m["match_reasons"],
        }
        for m in matches
    ]


@router.get("/{college_id}", response_model=CollegeDetailResponse)
async def get_college(college_id: int, db: Session = Depends(get_db)):
    """Get detailed college information."""
    college = college_service.get_college_detail(db, college_id)
    if not college:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="College not found",
        )

    return college
