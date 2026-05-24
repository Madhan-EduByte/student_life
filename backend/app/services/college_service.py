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

# General/abstract locations that should not be queried as literal cities or states in SQL
GENERAL_LOCATIONS = {
    "remote", "100% remote", "major_hub", "major tech/business hub",
    "mid_city", "mid-sized city", "rural", "rural / small town",
    "nomad", "global/nomad", "any", "any india"
}


def map_budget_to_max_fee(budget: Optional[str]) -> float:
    """Map student budget preference string to maximum annual fee limit."""
    if not budget:
        return 10000000.0  # safe default if not provided (1 Crore)
    b_clean = budget.strip().lower()
    if b_clean in ["free", "zero/self-taught", "zero", "self-taught"]:
        return 10000.0  # basic self-learning or free (e.g. up to 10k)
    elif b_clean in ["low", "below 1l", "below 1 lakh"]:
        return 100000.0
    elif b_clean in ["medium", "1-5l", "1-5 lakh", "1 to 5l"]:
        return 500000.0
    elif b_clean in ["high", "5-10l", "5-10 lakh", "5 to 10l"]:
        return 1000000.0
    elif b_clean in ["premium", "above 10l", "above 10 lakh"]:
        return 10000000.0
    return 1000000.0  # fallback standard default


def map_profile_stream_to_db_streams(pref_stream: Optional[str]) -> List[str]:
    """Map comprehensive student stream preference to database stream categories."""
    if not pref_stream:
        return []
    s_clean = pref_stream.strip().lower()
    if "creative" in s_clean or "arts" in s_clean or "media" in s_clean:
        return ["arts", "vocational"]
    elif "tech" in s_clean or "it" in s_clean:
        return ["science", "vocational"]
    elif "health" in s_clean or "med" in s_clean:
        return ["science"]
    elif "business" in s_clean or "finance" in s_clean or "commerce" in s_clean:
        return ["commerce"]
    elif "engineer" in s_clean or "manufactur" in s_clean:
        return ["science"]
    elif "law" in s_clean or "policy" in s_clean:
        return ["arts", "commerce"]
    elif "trade" in s_clean or "vocational" in s_clean:
        return ["vocational"]
    
    # Legacy direct match fallbacks
    if s_clean == "science":
        return ["science"]
    elif s_clean == "commerce":
        return ["commerce"]
    elif s_clean == "arts":
        return ["arts"]
    elif s_clean == "vocational":
        return ["vocational"]
        
    return [s_clean]


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

        pref_stream = criteria.get("preferred_stream") if criteria else None
        target_db_streams = map_profile_stream_to_db_streams(pref_stream) if pref_stream else []

        # Stream filtering must be strictly enforced first so that engineering colleges are excluded for non-science students
        if pref_stream and target_db_streams:
            query = query.join(CollegeCourse).filter(
                CollegeCourse.stream.in_(target_db_streams)
            ).distinct()

        query_strict = query

        if criteria:
            if criteria.get("location"):
                location = criteria["location"].strip()
                if location.lower() not in GENERAL_LOCATIONS:
                    query_strict = query_strict.filter(
                        or_(
                            College.city.ilike(f"%{location}%"),
                            College.state.ilike(f"%{location}%"),
                        )
                    )

            if criteria.get("budget_range"):
                budget = criteria["budget_range"]
                max_fee = map_budget_to_max_fee(budget)
                query_strict = query_strict.filter(
                    or_(
                        College.fee_range_max <= max_fee,
                        College.fee_range_max.is_(None),
                    )
                )

        colleges = query_strict.limit(30).all()

        # Fallback 1: Relax budget and location, but keep the stream filter intact!
        if not colleges:
            logger.warning("No colleges found with strict filters. Relaxing secondary filters but keeping stream filter.")
            colleges = query.limit(30).all()

            # Fallback 2: Absolute fallback to any colleges (only if no colleges offer the stream at all)
            if not colleges:
                logger.warning("No colleges found with stream filter. Absolute fallback to any colleges.")
                colleges = db.query(College).limit(30).all()

        # Attach recommended courses matching the student's stream preference
        for c in colleges:
            rec_courses = []
            if pref_stream and target_db_streams:
                rec_courses = [course.course_name for course in c.courses if course.stream.lower() in target_db_streams]
            else:
                rec_courses = [course.course_name for course in c.courses] if c.courses else []
            c.recommended_courses = rec_courses

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
                    "offered_streams": list(set(course.stream.lower() for course in c.courses)) if c.courses else []
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
                        
                        # Only show AI rank badge if a real validated provider succeeded
                        pred_index = None
                        if ai_service.last_used_model != "mock":
                            pred_index = next((idx + 1 for idx, item in enumerate(ai_predictions) if item["college_id"] == college.id), None)
                            
                        matches.append({
                            "college": college,
                            "match_score": score,
                            "match_reasons": reasons,
                            "ai_predict_order": pred_index
                        })
                
                if ai_service.last_used_model != "mock":
                    matches.sort(key=lambda x: x.get("ai_predict_order") or 999)
                else:
                    matches.sort(key=lambda x: x["match_score"], reverse=True)
                return matches

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
        return matches


    def _calculate_match_score(
        self, college: College, criteria: Dict
    ) -> float:
        """Calculate a highly dynamic and realistic match score (30-99%) based on criteria alignment."""
        score = 45.0  # Dynamic base score

        # Track penalties and bonuses
        stream_penalty = 0.0
        budget_penalty = 0.0
        location_bonus_penalty = 0.0

        # 1. Stream compatibility (contributes up to 25 points)
        pref_stream = criteria.get("preferred_stream")
        if pref_stream and pref_stream.strip():
            target_db_streams = map_profile_stream_to_db_streams(pref_stream)
            course_streams = [c.stream.lower() for c in college.courses] if college.courses else []
            
            # Check if any course stream matches target_db_streams
            has_match = any(ts in course_streams for ts in target_db_streams)
            if has_match:
                score += 25.0
            else:
                # Severe stream misfit penalty
                stream_penalty = -25.0
        else:
            score += 15.0

        # 2. Location compatibility (contributes up to 20 points)
        loc_pref = criteria.get("location")
        if loc_pref and loc_pref.strip():
            loc_clean = loc_pref.strip().lower()
            c_city = (college.city or "").lower()
            c_state = (college.state or "").lower()

            metropolitan_hubs = {"mumbai", "delhi", "new delhi", "bangalore", "bengaluru", "chennai", "kolkata", "noida", "pune"}
            small_towns_t23 = {"pilani", "vellore", "tiruchirappalli", "trichy", "mangalore", "surathkal", "kanpur", "manipal"}

            if loc_clean in ["rural", "rural / small town"]:
                if c_city in metropolitan_hubs:
                    location_bonus_penalty = -15.0  # metropolitan penalty
                elif c_city in small_towns_t23:
                    location_bonus_penalty = 20.0   # small town bonus
                else:
                    location_bonus_penalty = 5.0
            elif loc_clean in ["major_hub", "major tech/business hub"]:
                if c_city in metropolitan_hubs:
                    location_bonus_penalty = 20.0
                else:
                    location_bonus_penalty = 5.0
            elif loc_clean in ["mid_city", "mid-sized city"]:
                if c_city in small_towns_t23 or c_city in ["pune", "noida"]:
                    location_bonus_penalty = 20.0
                else:
                    location_bonus_penalty = 5.0
            elif loc_clean in ["remote", "100% remote", "nomad", "global/nomad"]:
                location_bonus_penalty = 12.0
            elif loc_clean in ["any", "any india"]:
                location_bonus_penalty = 12.0
            else:
                # Specific city or state
                if loc_clean in c_city or loc_clean in c_state:
                    location_bonus_penalty = 20.0
                else:
                    location_bonus_penalty = 4.0
        else:
            location_bonus_penalty = 10.0

        score += location_bonus_penalty

        # 3. Placement contribution (up to 12 points)
        if college.placement_rate:
            score += (college.placement_rate / 100) * 12

        # 4. NIRF rank contribution (up to 8 points)
        if college.nirf_rank and college.nirf_rank <= 100:
            score += (100 - college.nirf_rank) / 100 * 8
        elif college.nirf_rank and college.nirf_rank <= 500:
            score += 3

        # 5. Accreditation contribution (up to 5 points)
        if college.accreditation:
            accreditation_scores = {
                "A++": 5,
                "A+": 4,
                "A": 3,
                "B++": 2,
                "B+": 1,
            }
            for grade, pts in accreditation_scores.items():
                if grade in college.accreditation:
                    score += pts
                    break

        # 6. Budget contribution (up to 15 points)
        budget_pref = criteria.get("budget_range")
        if budget_pref and college.fee_range_max:
            max_budget = map_budget_to_max_fee(budget_pref)
            if college.fee_range_max <= max_budget:
                score += 15.0
            elif college.fee_range_max <= max_budget * 1.5:
                score += 5.0
            else:
                # Severe budget penalty
                budget_penalty = -30.0
        else:
            score += 8.0

        # Apply cumulative penalties and hard cap reductions
        final_score = score + stream_penalty + budget_penalty

        # Apply multiplier scaling for severe misfits to drop compatibility down to 30-55%
        if stream_penalty < 0:
            final_score *= 0.60
        if budget_penalty < 0:
            final_score *= 0.65
        if location_bonus_penalty < 0:
            final_score *= 0.85

        # Bound the score realistically between 30.0% and 99.0%
        return max(30.0, min(round(final_score, 1), 99.0))


    def _get_match_reasons(
        self, college: College, criteria: Dict
    ) -> List[str]:
        """Generate human-readable match reasons."""
        reasons = []

        # 1. Stream compatibility
        pref_stream = criteria.get("preferred_stream")
        if pref_stream and pref_stream.strip():
            target_db_streams = map_profile_stream_to_db_streams(pref_stream)
            course_streams = [c.stream.lower() for c in college.courses] if college.courses else []
            has_match = any(ts in course_streams for ts in target_db_streams)
            if has_match:
                reasons.append(f"Offers your preferred stream ({pref_stream})")
            else:
                reasons.append(f"Stream mismatch (No {pref_stream} courses)")

        # 2. Budget compatibility
        budget_pref = criteria.get("budget_range")
        if budget_pref and college.fee_range_max:
            max_budget = map_budget_to_max_fee(budget_pref)
            if college.fee_range_max <= max_budget:
                reasons.append("Comfortably within your preferred budget range")
            else:
                reasons.append(f"Fees exceed your target budget range")

        # 3. Location preference
        loc_pref = criteria.get("location")
        if loc_pref and loc_pref.strip():
            loc_clean = loc_pref.strip().lower()
            c_city = (college.city or "").lower()
            c_state = (college.state or "").lower()

            metropolitan_hubs = {"mumbai", "delhi", "new delhi", "bangalore", "bengaluru", "chennai", "kolkata", "noida", "pune"}
            small_towns_t23 = {"pilani", "vellore", "tiruchirappalli", "trichy", "mangalore", "surathkal", "kanpur", "manipal"}

            if loc_clean in ["rural", "rural / small town"]:
                if c_city in small_towns_t23:
                    reasons.append("Excellent non-metropolitan / small town campus environment")
                elif c_city in metropolitan_hubs:
                    reasons.append("Located in metropolitan hub (unlike rural preference)")
            elif loc_clean in ["major_hub", "major tech/business hub"] and c_city in metropolitan_hubs:
                reasons.append("Great location for metropolitan corporate networking")
            elif loc_clean in c_city or loc_clean in c_state:
                reasons.append(f"Located directly in your preferred location ({college.city})")

        # Fallbacks/Academic details
        if len(reasons) < 3:
            if college.placement_rate and college.placement_rate > 80:
                reasons.append(f"Stellar placement rate of {college.placement_rate}%")
            if college.nirf_rank and college.nirf_rank <= 100:
                reasons.append(f"Premier Ranked Academic Institution (NIRF #{college.nirf_rank})")
            if college.average_package:
                reasons.append(f"High average compensation package of ₹{college.average_package:.1f} LPA")

        if not reasons:
            reasons.append("Good overall academic profile")

        return reasons[:3]


# Singleton instance
college_service = CollegeService()
