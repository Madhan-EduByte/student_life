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
    """Get AI-matched and ranked careers for a student profile."""
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

    # Fetch all careers
    all_careers = db.query(Career).all()

    # Check if AI is configured
    if ai_service.is_api_configured() and all_careers:
        careers_data = []
        for c in all_careers:
            careers_data.append({
                "id": c.id,
                "title": c.title,
                "stream": c.stream,
                "category": c.category,
                "demand_level": c.demand_level,
                "average_salary_entry": c.average_salary_entry,
                "growth_rate": c.growth_rate,
            })

        ai_predictions = await ai_service.predict_career_matches(careers_data, criteria)
        if ai_predictions:
            prediction_map = {p["career_id"]: p for p in ai_predictions}
            matches = []
            for c in all_careers:
                pred = prediction_map.get(c.id)
                if pred:
                    score = float(pred.get("match_score", 50.0))
                    reasons = pred.get("match_reasons", ["Matches your profile"])
                    
                    # Only show AI rank badge if a real validated provider succeeded
                    pred_index = None
                    if ai_service.last_used_model != "mock":
                        pred_index = next((idx + 1 for idx, item in enumerate(ai_predictions) if item["career_id"] == c.id), None)
                        
                    matches.append({
                        "career": CareerResponse.model_validate(c),
                        "match_score": score,
                        "match_reasons": reasons,
                        "ai_predict_order": pred_index,
                    })
            
            if ai_service.last_used_model != "mock":
                matches.sort(key=lambda x: x.get("ai_predict_order") or 999)
            else:
                matches.sort(key=lambda x: x["match_score"], reverse=True)
                
            is_real_ai = ai_service.last_used_model != "mock"
            return {
                "matches": matches,
                "ai_active": is_real_ai,
                "ai_model": ai_service.last_used_model if is_real_ai else None
            }

    # Standard database/rule-based matching fallback
    matches = []
    pref_stream = criteria.get("preferred_stream", "").lower()
    interest_words = [w.strip().lower() for w in criteria.get("interests", "").split(",") if w.strip()]

    for c in all_careers:
        score = 50.0
        reasons = []

        # Stream compatibility (up to 25 points)
        if pref_stream and c.stream and pref_stream in c.stream.lower():
            score += 25.0
            reasons.append(f"Aligned with your stream preference ({c.stream})")

        # Interest matches (up to 25 points)
        matched_interests = []
        for word in interest_words:
            if word in (c.title or "").lower() or word in (c.description or "").lower() or word in (c.category or "").lower():
                matched_interests.append(word)
        if matched_interests:
            score += min(len(matched_interests) * 10, 25)
            reasons.append(f"Matches interests: {', '.join(matched_interests)}")

        if not reasons:
            reasons.append("Good overall career fit")

        matches.append({
            "career": CareerResponse.model_validate(c),
            "match_score": min(score, 100.0),
            "match_reasons": reasons,
            "ai_predict_order": None,
        })

    matches.sort(key=lambda x: x["match_score"], reverse=True)
    return {
        "matches": matches,
        "ai_active": False,
        "ai_model": None
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

