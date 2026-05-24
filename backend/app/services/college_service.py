"""
DestinAI — College Service
College matching, scoring, and filtering business logic.
"""

import logging
from typing import Dict, List, Optional, Tuple

from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models.college import College, CollegeCourse, CollegeScore
from app.schemas.college import CollegeFilters

logger = logging.getLogger(__name__)


class CollegeService:
    """Service for college matching and search."""

    def get_colleges(
        self, db: Session, filters: CollegeFilters
    ) -> Tuple[List[College], int]:
        """Get colleges with filters and pagination."""
        query = db.query(College)

        # Apply filters
        if filters.stream:
            query = query.join(CollegeCourse).filter(
                CollegeCourse.stream == filters.stream
            )
        if filters.city:
            query = query.filter(College.city.ilike(f"%{filters.city}%"))
        if filters.state:
            query = query.filter(College.state.ilike(f"%{filters.state}%"))
        if filters.country:
            query = query.filter(College.country.ilike(f"%{filters.country}%"))
        if filters.type:
            query = query.filter(College.type == filters.type)
        if filters.fee_max:
            query = query.filter(College.fee_range_max <= filters.fee_max)
        if filters.min_placement_rate:
            query = query.filter(
                College.placement_rate >= filters.min_placement_rate
            )
        if filters.search:
            search_term = f"%{filters.search}%"
            query = query.filter(
                or_(
                    College.name.ilike(search_term),
                    College.university.ilike(search_term),
                    College.city.ilike(search_term),
                )
            )

        # Get total count
        total = query.count()

        # Apply pagination
        offset = (filters.page - 1) * filters.per_page
        colleges = (
            query.order_by(College.nirf_rank.asc())
            .offset(offset)
            .limit(filters.per_page)
            .all()
        )

        return colleges, total

    def get_college_detail(
        self, db: Session, college_id: int
    ) -> Optional[College]:
        """Get detailed college information with courses and scores."""
        return db.query(College).filter(College.id == college_id).first()

    async def match_colleges(
        self,
        db: Session,
        user_id: int,
        criteria: Optional[Dict] = None,
    ) -> List[Dict]:
        """AI-powered college matching for a student."""
        # Get all colleges
        query = db.query(College)

        if criteria:
            if criteria.get("location"):
                location = criteria["location"]
                if location.lower() not in ["any", "any india"]:
                    query = query.filter(
                        or_(
                            College.city.ilike(f"%{location}%"),
                            College.state.ilike(f"%{location}%"),
                        )
                    )

            if criteria.get("budget_range"):
                budget = criteria["budget_range"]
                budget_map = {
                    "below 1L": 100000,
                    "1-5L": 500000,
                    "5-10L": 1000000,
                    "above 10L": 10000000,
                }
                max_fee = budget_map.get(budget, 1000000)
                query = query.filter(
                    or_(
                        College.fee_range_max <= max_fee,
                        College.fee_range_max.is_(None),
                    )
                )

        colleges = query.limit(20).all()

        # Check if AI API is configured
        from app.services.ai_service import ai_service
        
        if ai_service.is_api_configured():
            colleges_data = []
            for c in colleges:
                colleges_data.append({
                    "id": c.id,
                    "name": c.name,
                    "university": c.university,
                    "nirf_rank": c.nirf_rank,
                    "placement_rate": c.placement_rate,
                    "average_package": c.average_package,
                    "fee_range_max": c.fee_range_max,
                    "city": c.city,
                    "state": c.state,
                    "type": c.type,
                })
            
            ai_predictions = await ai_service.predict_college_matches(colleges_data, criteria or {})
            if ai_predictions:
                prediction_map = {p["college_id"]: p for p in ai_predictions}
                matches = []
                for college in colleges:
                    pred = prediction_map.get(college.id)
                    if pred:
                        score = float(pred.get("match_score", 50.0))
                        reasons = pred.get("match_reasons", ["Recommended by AI"])
                        pred_index = next((idx + 1 for idx, item in enumerate(ai_predictions) if item["college_id"] == college.id), None)
                        matches.append({
                            "college": college,
                            "match_score": score,
                            "match_reasons": reasons,
                            "ai_predict_order": pred_index
                        })
                matches.sort(key=lambda x: x.get("ai_predict_order", 999))
                return matches[:10]

        # Score and rank matches using rule-based fallback
        matches = []
        for college in colleges:
            score = self._calculate_match_score(college, criteria or {})
            reasons = self._get_match_reasons(college, criteria or {})
            matches.append(
                {
                    "college": college,
                    "match_score": score,
                    "match_reasons": reasons,
                    "ai_predict_order": None
                }
            )

        # Sort by match score descending
        matches.sort(key=lambda x: x["match_score"], reverse=True)
        return matches[:10]


    def _calculate_match_score(
        self, college: College, criteria: Dict
    ) -> float:
        """Calculate a match score for a college based on criteria."""
        score = 50.0  # Base score

        # Placement rate contributes 20 points
        if college.placement_rate:
            score += (college.placement_rate / 100) * 20

        # NIRF rank contributes 15 points (lower is better)
        if college.nirf_rank and college.nirf_rank <= 100:
            score += (100 - college.nirf_rank) / 100 * 15
        elif college.nirf_rank and college.nirf_rank <= 500:
            score += 5

        # Accreditation contributes 10 points
        if college.accreditation:
            accreditation_scores = {
                "A++": 10,
                "A+": 8,
                "A": 6,
                "B++": 4,
                "B+": 2,
                "B": 1,
            }
            for grade, pts in accreditation_scores.items():
                if grade in college.accreditation:
                    score += pts
                    break

        # Fee affordability contributes 5 points
        if criteria.get("budget_range") and college.fee_range_max:
            budget_map = {
                "below 1L": 100000,
                "1-5L": 500000,
                "5-10L": 1000000,
                "above 10L": 10000000,
            }
            max_budget = budget_map.get(criteria["budget_range"], 500000)
            if college.fee_range_max <= max_budget:
                score += 5

        return min(score, 100.0)

    def _get_match_reasons(
        self, college: College, criteria: Dict
    ) -> List[str]:
        """Generate human-readable match reasons."""
        reasons = []

        if college.placement_rate and college.placement_rate > 80:
            reasons.append(
                f"Excellent placement rate of {college.placement_rate}%"
            )

        if college.nirf_rank and college.nirf_rank <= 100:
            reasons.append(f"NIRF Rank #{college.nirf_rank}")

        if college.accreditation:
            reasons.append(f"Accredited: {college.accreditation}")

        if college.average_package:
            reasons.append(
                f"Average package: ₹{college.average_package:.1f} LPA"
            )

        if criteria.get("location"):
            location = criteria["location"]
            if (
                college.city
                and location.lower() in college.city.lower()
            ):
                reasons.append(f"Located in your preferred city: {college.city}")

        if not reasons:
            reasons.append("Good overall academic profile")

        return reasons


# Singleton instance
college_service = CollegeService()
