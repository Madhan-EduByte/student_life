"""
DestinAI — Career Model
Career options with metadata, scores, and automation risk.
"""

from datetime import datetime

from sqlalchemy import (
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship

from app.core.database import Base


class Career(Base):
    """Career option model with full metadata."""

    __tablename__ = "careers"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(255), unique=True, nullable=False, index=True)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    stream = Column(String(50), nullable=True)  # science, commerce, arts, vocational
    category = Column(String(100), nullable=True)  # Technology, Healthcare, etc.
    sub_category = Column(String(100), nullable=True)
    required_education = Column(String(255), nullable=True)
    required_skills = Column(Text, nullable=True)  # JSON array
    average_salary_entry = Column(Float, nullable=True)  # Entry-level salary (INR/year)
    average_salary_mid = Column(Float, nullable=True)    # Mid-career salary
    average_salary_senior = Column(Float, nullable=True) # Senior-level salary
    growth_rate = Column(Float, nullable=True)  # Annual growth rate %
    demand_level = Column(String(20), nullable=True)  # high, medium, low
    work_environment = Column(String(100), nullable=True)  # office, remote, hybrid, field
    icon = Column(String(100), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    # Relationships
    scores = relationship("CareerScore", back_populates="career", cascade="all, delete")

    def __repr__(self):
        return f"<Career(id={self.id}, title='{self.title}')>"


class CareerScore(Base):
    """Career future-proof scoring model."""

    __tablename__ = "career_scores"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    career_id = Column(Integer, ForeignKey("careers.id"), nullable=False)
    automation_risk = Column(Float, nullable=True)       # 0-100 percentage
    ai_replacement_risk = Column(Float, nullable=True)   # 0-100 percentage
    salary_projection_5yr = Column(Float, nullable=True)
    salary_projection_10yr = Column(Float, nullable=True)
    salary_projection_20yr = Column(Float, nullable=True)
    future_proof_score = Column(Float, nullable=True)    # 0-100 composite score
    market_demand_score = Column(Float, nullable=True)   # 0-100
    skill_transferability = Column(Float, nullable=True) # 0-100
    last_updated = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    career = relationship("Career", back_populates="scores")

    def __repr__(self):
        return f"<CareerScore(career_id={self.career_id}, future_proof={self.future_proof_score})>"


class Stream(Base):
    """Academic stream classification."""

    __tablename__ = "streams"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), unique=True, nullable=False)
    slug = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    icon = Column(String(100), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<Stream(id={self.id}, name='{self.name}')>"
