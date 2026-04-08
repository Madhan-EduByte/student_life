"""
DestinAI — College Model
College matching with courses, rankings, and scoring.
"""

from datetime import datetime

from sqlalchemy import (
    Boolean,
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


class College(Base):
    """College model with comprehensive metadata."""

    __tablename__ = "colleges"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(500), nullable=False, index=True)
    slug = Column(String(500), unique=True, nullable=False, index=True)
    university = Column(String(500), nullable=True)
    type = Column(String(50), nullable=True)  # private, government, deemed, autonomous
    city = Column(String(100), nullable=True, index=True)
    state = Column(String(100), nullable=True, index=True)
    country = Column(String(100), default="India", nullable=True, index=True)
    pincode = Column(String(10), nullable=True)
    website = Column(String(500), nullable=True)
    email = Column(String(255), nullable=True)
    phone = Column(String(20), nullable=True)
    logo_url = Column(String(500), nullable=True)
    banner_url = Column(String(500), nullable=True)
    description = Column(Text, nullable=True)
    established_year = Column(Integer, nullable=True)
    accreditation = Column(String(255), nullable=True)  # NAAC A++, etc.
    nirf_rank = Column(Integer, nullable=True)
    is_featured = Column(Boolean, default=False)
    admission_process = Column(Text, nullable=True)
    fee_range_min = Column(Float, nullable=True)
    fee_range_max = Column(Float, nullable=True)
    placement_rate = Column(Float, nullable=True)  # percentage
    average_package = Column(Float, nullable=True)  # INR LPA
    highest_package = Column(Float, nullable=True)  # INR LPA

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    # Relationships
    courses = relationship(
        "CollegeCourse", back_populates="college", cascade="all, delete"
    )
    scores = relationship(
        "CollegeScore", back_populates="college", cascade="all, delete"
    )

    def __repr__(self):
        return f"<College(id={self.id}, name='{self.name}')>"


class CollegeCourse(Base):
    """Courses offered by a college."""

    __tablename__ = "college_courses"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    college_id = Column(Integer, ForeignKey("colleges.id"), nullable=False)
    course_name = Column(String(500), nullable=False)
    degree_type = Column(String(50), nullable=True)  # UG, PG, Diploma, PhD
    duration_years = Column(Float, nullable=True)
    stream = Column(String(50), nullable=True)
    specialization = Column(String(255), nullable=True)
    annual_fee = Column(Float, nullable=True)
    seats_available = Column(Integer, nullable=True)
    entrance_exam = Column(String(255), nullable=True)
    eligibility = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    college = relationship("College", back_populates="courses")

    def __repr__(self):
        return f"<CollegeCourse(college_id={self.college_id}, course='{self.course_name}')>"


class CollegeScore(Base):
    """College DNA matching scores."""

    __tablename__ = "college_scores"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    college_id = Column(Integer, ForeignKey("colleges.id"), nullable=False)
    academic_score = Column(Float, nullable=True)       # 0-100
    infrastructure_score = Column(Float, nullable=True)  # 0-100
    placement_score = Column(Float, nullable=True)       # 0-100
    faculty_score = Column(Float, nullable=True)         # 0-100
    culture_score = Column(Float, nullable=True)         # 0-100
    alumni_score = Column(Float, nullable=True)          # 0-100
    research_score = Column(Float, nullable=True)        # 0-100
    overall_score = Column(Float, nullable=True)         # 0-100 composite
    last_updated = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    college = relationship("College", back_populates="scores")

    def __repr__(self):
        return f"<CollegeScore(college_id={self.college_id}, overall={self.overall_score})>"
