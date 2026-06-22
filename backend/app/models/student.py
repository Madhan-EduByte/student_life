"""
DestinAI — Student Model
Extended student profile with career inputs and preferences.
"""

from datetime import datetime

from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


class StudentProfile(Base):
    """Extended student profile linked to a user."""

    __tablename__ = "student_profiles"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)

    # ── 6 Career Inputs ──────────────────────────────────
    interest_areas = Column(Text, nullable=True)          # Q1: What are your interests?
    strengths = Column(Text, nullable=True)               # Q2: What are your strengths?
    preferred_stream = Column(String(100), nullable=True)                                                     # Q3: Preferred stream
    education_level = Column(String(100), nullable=True)  # Q4: Current education level
    budget_range = Column(String(100), nullable=True)     # Q5: Budget range
    location_preference = Column(String(255), nullable=True)  # Q6: Preferred location
    work_life_balance = Column(String(50), nullable=True)     # Q7: Work-life balance preference
    risk_tolerance = Column(String(50), nullable=True)        # Q8: Risk tolerance level
    interaction_style = Column(String(50), nullable=True)     # Q9: Daily interaction style

    # ── Additional Profile ───────────────────────────────
    date_of_birth = Column(DateTime, nullable=True)
    gender = Column(String(20), nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    country = Column(String(100), default="India", nullable=True)
    current_school = Column(String(255), nullable=True)
    current_grade = Column(String(50), nullable=True)
    board = Column(String(50), nullable=True)  # CBSE, ICSE, State Board, etc.
    percentage_score = Column(String(10), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    # Relationships
    user = relationship("User", back_populates="student_profile")

    def __repr__(self):
        return f"<StudentProfile(id={self.id}, user_id={self.user_id})>"
