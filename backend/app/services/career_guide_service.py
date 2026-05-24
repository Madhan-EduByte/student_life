"""
DestinAI — CareerGuide Service
Business logic for career_guide generation, milestone management, and updates.
"""

import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional

from sqlalchemy.orm import Session

from app.models.career_guide import Milestone, CareerGuide, CareerGuideHistory
from app.models.student import StudentProfile
from app.services.ai_service import ai_service

logger = logging.getLogger(__name__)


class CareerGuideService:
    """Service for managing career career_guides."""

    async def generate_career_guide(
        self, db: Session, user_id: int, career_inputs: Dict[str, str]
    ) -> CareerGuide:
        """Generate a new AI career career_guide for a student."""
        # Filter inputs to avoid TypeError when creating profile and to map keys if needed
        allowed_keys = {
            "interest_areas", "strengths", "preferred_stream", "education_level",
            "budget_range", "location_preference", "work_life_balance",
            "risk_tolerance", "interaction_style"
        }
        
        # Ensure we map any frontend aliases if they exist (though schemas validator should have done it)
        mapped_inputs = career_inputs.copy()
        if "interests" in mapped_inputs and not mapped_inputs.get("interest_areas"):
            val = mapped_inputs["interests"]
            mapped_inputs["interest_areas"] = ", ".join(val) if isinstance(val, list) else str(val)
        if "strengths" in mapped_inputs and isinstance(mapped_inputs["strengths"], list):
            mapped_inputs["strengths"] = ", ".join(mapped_inputs["strengths"])
        if "industry_stream" in mapped_inputs and not mapped_inputs.get("preferred_stream"):
            mapped_inputs["preferred_stream"] = mapped_inputs["industry_stream"]
        if "budget" in mapped_inputs and not mapped_inputs.get("budget_range"):
            mapped_inputs["budget_range"] = mapped_inputs["budget"]
        if "location" in mapped_inputs and not mapped_inputs.get("location_preference"):
            mapped_inputs["location_preference"] = mapped_inputs["location"]

        filtered_inputs = {k: v for k, v in mapped_inputs.items() if k in allowed_keys}

        # Update student profile with career inputs
        profile = (
            db.query(StudentProfile)
            .filter(StudentProfile.user_id == user_id)
            .first()
        )
        if profile:
            for k, v in filtered_inputs.items():
                if v is not None:
                    setattr(profile, k, v)
        else:
            profile = StudentProfile(user_id=user_id, **filtered_inputs)
            db.add(profile)

        # Deactivate previous career_guides
        db.query(CareerGuide).filter(
            CareerGuide.user_id == user_id, CareerGuide.is_active == True
        ).update({"is_active": False})

        # Generate AI career_guide
        ai_result = await ai_service.generate_career_guide(career_inputs)

        # Create career_guide record
        career_guide = CareerGuide(
            user_id=user_id,
            title=ai_result.get("title", "Your Career CareerGuide"),
            summary=ai_result.get("summary", ""),
            career_path=ai_result.get("career_path", ""),
            recommended_stream=ai_result.get("recommended_stream", ""),
            confidence_score=ai_result.get("confidence_score", 0),
            future_proof_score=ai_result.get("future_proof_score", 0),
            ai_model_used=ai_result.get("_ai_model_used", "unknown"),
            raw_ai_response=json.dumps(ai_result),
            version=1,
            is_active=True,
            next_update_at=datetime.utcnow() + timedelta(days=180),  # 6 months
        )
        db.add(career_guide)
        db.flush()  # Get career_guide ID

        # Create milestones
        milestones_data = ai_result.get("milestones", [])
        for i, m_data in enumerate(milestones_data):
            milestone = Milestone(
                career_guide_id=career_guide.id,
                week_number=m_data.get("week_number", i + 1),
                title=m_data.get("title", f"Week {i + 1}"),
                description=m_data.get("description", ""),
                category=m_data.get("category", "learning"),
                priority=m_data.get("priority", "medium"),
                estimated_hours=m_data.get("estimated_hours"),
                resources=json.dumps(m_data.get("resources", [])),
                order=i,
                due_date=datetime.utcnow() + timedelta(weeks=m_data.get("week_number", i + 1)),
            )
            db.add(milestone)

        db.commit()
        db.refresh(career_guide)

        logger.info(
            f"Generated career_guide {career_guide.id} for user {user_id} "
            f"using {career_guide.ai_model_used}"
        )
        return career_guide

    def get_career_guide(self, db: Session, career_guide_id: int) -> Optional[CareerGuide]:
        """Get a specific career_guide with milestones."""
        return (
            db.query(CareerGuide)
            .filter(CareerGuide.id == career_guide_id)
            .first()
        )

    def get_active_career_guide(self, db: Session, user_id: int) -> Optional[CareerGuide]:
        """Get the active career_guide for a user."""
        return (
            db.query(CareerGuide)
            .filter(CareerGuide.user_id == user_id, CareerGuide.is_active == True)
            .first()
        )

    def get_user_career_guides(self, db: Session, user_id: int) -> List[CareerGuide]:
        """Get all career_guides for a user."""
        return (
            db.query(CareerGuide)
            .filter(CareerGuide.user_id == user_id)
            .order_by(CareerGuide.created_at.desc())
            .all()
        )

    def get_milestones(
        self, db: Session, career_guide_id: int
    ) -> List[Milestone]:
        """Get milestones for a career_guide."""
        return (
            db.query(Milestone)
            .filter(Milestone.career_guide_id == career_guide_id)
            .order_by(Milestone.order)
            .all()
        )

    def update_milestone(
        self, db: Session, milestone_id: int, is_completed: bool
    ) -> Optional[Milestone]:
        """Mark a milestone as complete or incomplete."""
        milestone = db.query(Milestone).filter(Milestone.id == milestone_id).first()
        if milestone:
            milestone.is_completed = is_completed
            milestone.completed_at = datetime.utcnow() if is_completed else None
            db.commit()
            db.refresh(milestone)
        return milestone

    async def update_career_guide(self, db: Session, career_guide_id: int) -> Optional[CareerGuide]:
        """Trigger an AI-powered career_guide update (living career_guide)."""
        career_guide = self.get_career_guide(db, career_guide_id)
        if not career_guide:
            return None

        # Get current profile
        profile = (
            db.query(StudentProfile)
            .filter(StudentProfile.user_id == career_guide.user_id)
            .first()
        )
        if not profile:
            return None

        # Store history
        history = CareerGuideHistory(
            career_guide_id=career_guide.id,
            version=career_guide.version,
            changes_summary="Auto-update triggered",
            previous_data=career_guide.raw_ai_response,
            reason="auto_update",
        )
        db.add(history)

        career_inputs = {
            "interest_areas": profile.interest_areas or "",
            "strengths": profile.strengths or "",
            "preferred_stream": profile.preferred_stream or "",
            "education_level": profile.education_level or "",
            "budget_range": profile.budget_range or "",
            "location_preference": profile.location_preference or "",
            "work_life_balance": profile.work_life_balance or "",
            "risk_tolerance": profile.risk_tolerance or "",
            "interaction_style": profile.interaction_style or "",
        }

        ai_result = await ai_service.generate_career_guide(career_inputs)

        # Update career_guide
        career_guide.title = ai_result.get("title", career_guide.title)
        career_guide.summary = ai_result.get("summary", career_guide.summary)
        career_guide.career_path = ai_result.get("career_path", career_guide.career_path)
        career_guide.confidence_score = ai_result.get("confidence_score", career_guide.confidence_score)
        career_guide.future_proof_score = ai_result.get("future_proof_score", career_guide.future_proof_score)
        career_guide.raw_ai_response = json.dumps(ai_result)
        career_guide.version += 1
        career_guide.next_update_at = datetime.utcnow() + timedelta(days=180)

        history.updated_data = json.dumps(ai_result)

        db.commit()
        db.refresh(career_guide)

        logger.info(f"Updated career_guide {career_guide.id} to version {career_guide.version}")
        return career_guide


# Singleton instance
career_guide_service = CareerGuideService()
