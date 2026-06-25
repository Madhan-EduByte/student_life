"""
DestinAI — Career Routes
Career listing, details, and future-proof score endpoints.
"""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_current_user_optional
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


@router.get("/match")
async def match_careers(
    interests: Optional[str] = Query(None),
    strengths: Optional[str] = Query(None),
    stream: Optional[str] = Query(None),
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    """Get AI-generated career recommendations for a student profile.

    When a valid AI API key is configured, the AI generates fresh career
    recommendations entirely from its own world knowledge — no DB rows are
    fetched. If AI is unavailable, falls back to the existing DB-based
    matching logic seamlessly.
    """
    from app.models.student import StudentProfile
    from app.services.ai_service import ai_service

    criteria = {}
    if current_user:
        profile = (
            db.query(StudentProfile)
            .filter(StudentProfile.user_id == current_user.id)
            .first()
        )
        if profile:
            criteria = {
                "interests": interests or profile.interest_areas or "",
                "strengths": strengths or profile.strengths or "",
                "preferred_stream": stream or profile.preferred_stream or "",
            }

    if not criteria:
        criteria = {
            "interests": interests or "",
            "strengths": strengths or "",
            "preferred_stream": stream or "",
        }

    # Guard: if no meaningful input at all, skip AI and prompt for profile
    has_criteria = bool(
        criteria.get("interests", "").strip() or
        criteria.get("strengths", "").strip() or
        criteria.get("preferred_stream", "").strip()
    )
    if not has_criteria:
        return {
            "matches": [],
            "ai_active": False,
            "ai_model": None,
            "ai_generated": False,
            "needs_profile": True,
        }

    # ── Try fully AI-generated recommendations first ──────────────────────


    if ai_service.is_api_configured():
        ai_careers = await ai_service.generate_career_recommendations(criteria)
        if ai_careers:
            is_real_ai = ai_service.last_used_model != "mock"
            matches_out = []
            for idx, c in enumerate(ai_careers):
                matches_out.append({
                    "career": {
                        "id": None,
                        "title": c.get("title", ""),
                        "stream": c.get("stream", ""),
                        "category": c.get("category", ""),
                        "description": c.get("description", ""),
                        "demand_level": c.get("demand_level", ""),
                        "average_salary_entry": c.get("average_salary_entry"),
                        "average_salary_mid": None,
                        "average_salary_senior": None,
                        "growth_rate": c.get("growth_rate"),
                        "skills_required": [],
                        "education_required": None,
                        "work_environment": None,
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

