"""
DestinAI — Roadmap Service
Business logic for roadmap generation, milestone management, and updates.
"""

import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional

from sqlalchemy.orm import Session

from app.models.roadmap import Milestone, Roadmap, RoadmapHistory
from app.models.student import StudentProfile
from app.services.ai_service import ai_service

logger = logging.getLogger(__name__)


class RoadmapService:
    """Service for managing career roadmaps."""

    async def generate_roadmap(
        self, db: Session, user_id: int, career_inputs: Dict[str, str]
    ) -> Roadmap:
        """Generate a new AI career roadmap for a student."""
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

        # Deactivate previous roadmaps
        db.query(Roadmap).filter(
            Roadmap.user_id == user_id, Roadmap.is_active == True
        ).update({"is_active": False})

        # Generate AI roadmap
        ai_result = await ai_service.generate_roadmap(career_inputs)

        # Create roadmap record
        roadmap = Roadmap(
            user_id=user_id,
            title=ai_result.get("title", "Your Career Roadmap"),
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
        db.add(roadmap)
        db.flush()  # Get roadmap ID

        # Create milestones
        milestones_data = ai_result.get("milestones", [])
        for i, m_data in enumerate(milestones_data):
            milestone = Milestone(
                roadmap_id=roadmap.id,
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
        db.refresh(roadmap)

        logger.info(
            f"Generated roadmap {roadmap.id} for user {user_id} "
            f"using {roadmap.ai_model_used}"
        )
        return roadmap

    def get_roadmap(self, db: Session, roadmap_id: int) -> Optional[Roadmap]:
        """Get a specific roadmap with milestones."""
        return (
            db.query(Roadmap)
            .filter(Roadmap.id == roadmap_id)
            .first()
        )

    def get_active_roadmap(self, db: Session, user_id: int) -> Optional[Roadmap]:
        """Get the active roadmap for a user."""
        return (
            db.query(Roadmap)
            .filter(Roadmap.user_id == user_id, Roadmap.is_active == True)
            .first()
        )

    def get_user_roadmaps(self, db: Session, user_id: int) -> List[Roadmap]:
        """Get all roadmaps for a user."""
        return (
            db.query(Roadmap)
            .filter(Roadmap.user_id == user_id)
            .order_by(Roadmap.created_at.desc())
            .all()
        )

    def get_milestones(
        self, db: Session, roadmap_id: int
    ) -> List[Milestone]:
        """Get milestones for a roadmap."""
        return (
            db.query(Milestone)
            .filter(Milestone.roadmap_id == roadmap_id)
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

    async def update_roadmap(self, db: Session, roadmap_id: int) -> Optional[Roadmap]:
        """Trigger an AI-powered roadmap update (living roadmap)."""
        roadmap = self.get_roadmap(db, roadmap_id)
        if not roadmap:
            return None

        # Get current profile
        profile = (
            db.query(StudentProfile)
            .filter(StudentProfile.user_id == roadmap.user_id)
            .first()
        )
        if not profile:
            return None

        # Store history
        history = RoadmapHistory(
            roadmap_id=roadmap.id,
            version=roadmap.version,
            changes_summary="Auto-update triggered",
            previous_data=roadmap.raw_ai_response,
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

        ai_result = await ai_service.generate_roadmap(career_inputs)

        # Update roadmap
        roadmap.title = ai_result.get("title", roadmap.title)
        roadmap.summary = ai_result.get("summary", roadmap.summary)
        roadmap.career_path = ai_result.get("career_path", roadmap.career_path)
        roadmap.confidence_score = ai_result.get("confidence_score", roadmap.confidence_score)
        roadmap.future_proof_score = ai_result.get("future_proof_score", roadmap.future_proof_score)
        roadmap.raw_ai_response = json.dumps(ai_result)
        roadmap.version += 1
        roadmap.next_update_at = datetime.utcnow() + timedelta(days=180)

        history.updated_data = json.dumps(ai_result)

        db.commit()
        db.refresh(roadmap)

        logger.info(f"Updated roadmap {roadmap.id} to version {roadmap.version}")
        return roadmap


# Singleton instance
roadmap_service = RoadmapService()
