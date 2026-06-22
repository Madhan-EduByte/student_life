#!/usr/bin/env python
"""Initialize database tables and seed default data."""

from app.core.database import Base, engine
from app.models import (
    User,
    StudentProfile,
    Career,
    CareerScore,
    Stream,
    College,
    CollegeCourse,
    CollegeScore,
    CareerGuide,
    Milestone,
    CareerGuideHistory,
    StudentOutcome,
    SessionLog,
)
from app.utils.seed import run_seed


def init_database() -> None:
    """Create tables and seed default/demo data."""
    print("Creating database tables...")
    Base.metadata.create_all(engine)
    print("✅ Database tables created successfully!")
    print("Seeding default data...")
    run_seed()
    print("✅ Default data seeded successfully!")


if __name__ == "__main__":
    init_database()
