#!/usr/bin/env python
"""Initialize database tables."""

from app.core.database import Base, engine
from app.models import (
    User,
    StudentProfile,
    ParentProfile,
    Career,
    CareerScore,
    Stream,
    College,
    CollegeCourse,
    CollegeScore,
    Roadmap,
    Milestone,
    RoadmapHistory,
    StudentOutcome,
    SessionLog,
)

if __name__ == "__main__":
    print("Creating database tables...")
    Base.metadata.create_all(engine)
    print("✅ Database tables created successfully!")
