"""
DestinAI — CareerGuide Model
AI-generated career career_guides with milestones and version history.
"""

from datetime import datetime

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship

from app.core.database import Base


class CareerGuide(Base):
    """AI-generated career career_guide for a student."""

    __tablename__ = "career_guides"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(500), nullable=False)
    summary = Column(Text, nullable=True)
    career_path = Column(String(255), nullable=True)
    recommended_stream = Column(String(50), nullable=True)
    confidence_score = Column(Float, nullable=True)  # 0-100
    future_proof_score = Column(Float, nullable=True)  # 0-100
    ai_model_used = Column(String(50), nullable=True)  # gemini / openai
    raw_ai_response = Column(Text, nullable=True)  # Full AI response JSON
    version = Column(Integer, default=1, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    next_update_at = Column(DateTime, nullable=True)  # Auto-update every 6 months

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    # Relationships
    user = relationship("User", back_populates="career_guides")
    milestones = relationship(
        "Milestone", back_populates="career_guide", cascade="all, delete"
    )
    history = relationship(
        "CareerGuideHistory", back_populates="career_guide", cascade="all, delete"
    )

    def __repr__(self):
        return f"<CareerGuide(id={self.id}, user_id={self.user_id}, career='{self.career_path}')>"


class Milestone(Base):
    """Weekly milestone tasks within a career_guide."""

    __tablename__ = "milestones"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    career_guide_id = Column(Integer, ForeignKey("career_guides.id"), nullable=False)
    week_number = Column(Integer, nullable=False)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(100), nullable=True)  # learning, project, networking, etc.
    priority = Column(
        Enum("high", "medium", "low", name="milestone_priority"),
        default="medium",
    )
    estimated_hours = Column(Float, nullable=True)
    resources = Column(Text, nullable=True)  # JSON array of resource links
    is_completed = Column(Boolean, default=False, nullable=False)
    completed_at = Column(DateTime, nullable=True)
    due_date = Column(DateTime, nullable=True)
    order = Column(Integer, default=0, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    # Relationships
    career_guide = relationship("CareerGuide", back_populates="milestones")

    def __repr__(self):
        return f"<Milestone(id={self.id}, week={self.week_number}, title='{self.title}')>"


class CareerGuideHistory(Base):
    """Version history for living career_guide updates."""

    __tablename__ = "career_guide_history"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    career_guide_id = Column(Integer, ForeignKey("career_guides.id"), nullable=False)
    version = Column(Integer, nullable=False)
    changes_summary = Column(Text, nullable=True)
    previous_data = Column(Text, nullable=True)  # JSON snapshot
    updated_data = Column(Text, nullable=True)    # JSON snapshot
    reason = Column(String(255), nullable=True)   # auto_update, user_request, etc.

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    career_guide = relationship("CareerGuide", back_populates="history")

    def __repr__(self):
        return f"<CareerGuideHistory(career_guide_id={self.career_guide_id}, version={self.version})>"


class StudentOutcome(Base):
    """Tracks student outcomes for AI improvement (moat data)."""

    __tablename__ = "student_outcomes"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    career_guide_id = Column(Integer, ForeignKey("career_guides.id"), nullable=True)
    outcome_type = Column(String(50), nullable=True)  # enrolled, employed, switched
    college_enrolled = Column(String(500), nullable=True)
    course_enrolled = Column(String(500), nullable=True)
    career_started = Column(String(255), nullable=True)
    satisfaction_score = Column(Integer, nullable=True)  # 1-10
    feedback = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<StudentOutcome(user_id={self.user_id}, outcome='{self.outcome_type}')>"


class SessionLog(Base):
    """User activity log for AI improvement."""

    __tablename__ = "session_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String(100), nullable=False)
    page = Column(String(255), nullable=True)
    metadata_json = Column(Text, nullable=True)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(500), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<SessionLog(user_id={self.user_id}, action='{self.action}')>"
