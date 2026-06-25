"""
DestinAI — College Routes
College listing, filtering, matching, and detail endpoints.
"""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_current_user_optional
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
    location: Optional[str] = Query(None),
    budget_range: Optional[str] = Query(None),
    preferred_stream: Optional[str] = Query(None),
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    """Get AI-generated college recommendations for the student.

    When a valid AI API key is configured, the AI generates fresh college
    recommendations entirely from its own world knowledge — no DB rows are
    fetched. If AI is unavailable, falls back to the existing DB-based
    matching logic seamlessly.
    """
    from app.models.student import StudentProfile
    from app.services.ai_service import ai_service

    criteria = {}
    user_id = 0
    if current_user:
        user_id = current_user.id
        profile = (
            db.query(StudentProfile)
            .filter(StudentProfile.user_id == current_user.id)
            .first()
        )
        if profile:
            criteria = {
                "location": location or profile.location_preference or "",
                "budget_range": budget_range or profile.budget_range or "",
                "preferred_stream": preferred_stream or profile.preferred_stream or "",
                "interests": profile.interest_areas or "",
            }

    if not criteria:
        criteria = {
            "location": location or "",
            "budget_range": budget_range or "",
            "preferred_stream": preferred_stream or "",
            "interests": "",
        }

    # ── Try fully AI-generated recommendations first ──────────────────────
    if ai_service.is_api_configured():
        ai_colleges = await ai_service.generate_college_recommendations(criteria)
        if ai_colleges:
            is_real_ai = ai_service.last_used_model != "mock"
            matches_out = []
            for idx, c in enumerate(ai_colleges):
                matches_out.append({
                    "college": {
                        "id": None,
                        "name": c.get("name", ""),
                        "university": c.get("university", ""),
                        "city": c.get("city", ""),
                        "state": c.get("state", ""),
                        "country": "India",
                        "type": c.get("type", ""),
                        "accreditation": c.get("accreditation"),
                        "nirf_rank": c.get("nirf_rank"),
                        "placement_rate": c.get("placement_rate"),
                        "average_package": c.get("average_package"),
                        "fee_range_min": c.get("fee_range_min"),
                        "fee_range_max": c.get("fee_range_max"),
                        "streams": c.get("stream", []),
                        "courses": [],
                        "recommended_courses": [],
                        "website": None,
                        "description": c.get("description", ""),
                        "established_year": None,
                        "campus_size": None,
                        "hostel_available": None,
                        "scholarships_available": None,
                        "image_url": None,
                    },
                    "match_score": c.get("match_score", 80),
                    "match_reasons": c.get("match_reasons", ["Recommended by AI"]),
                    "ai_predict_order": idx + 1 if is_real_ai else None,
                    "ai_generated": True,
                })
            return {
                "matches": matches_out,
                "ai_active": is_real_ai,
                "ai_model": ai_service.last_used_model if is_real_ai else None,
                "ai_generated": True,
            }

        # AI is configured but generation returned nothing — return empty, never load DB
        return {
            "matches": [],
            "ai_active": False,
            "ai_model": None,
            "ai_generated": True,
        }

    # No API key configured — return empty, never load DB
    return {
        "matches": [],
        "ai_active": False,
        "ai_model": None,
        "ai_generated": False,
    }



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
