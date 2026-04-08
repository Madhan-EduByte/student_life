"""
DestinAI — Database Seeder
Seeds initial career, college, and stream data.
"""

import logging

from app.core.database import SessionLocal
from app.models.career import Career, CareerScore, Stream
from app.models.college import College, CollegeCourse, CollegeScore

logger = logging.getLogger(__name__)


def seed_streams(db):
    """Seed academic streams."""
    streams = [
        {"name": "Science", "slug": "science", "description": "Science and technology stream including engineering, medicine, and research.", "icon": "🔬"},
        {"name": "Commerce", "slug": "commerce", "description": "Commerce and business stream including finance, accounting, and management.", "icon": "📊"},
        {"name": "Arts", "slug": "arts", "description": "Arts and humanities stream including design, media, and social sciences.", "icon": "🎨"},
        {"name": "Vocational", "slug": "vocational", "description": "Vocational and skill-based courses including technology, trades, and services.", "icon": "🛠️"},
    ]

    for s_data in streams:
        existing = db.query(Stream).filter(Stream.slug == s_data["slug"]).first()
        if not existing:
            db.add(Stream(**s_data))

    db.commit()
    logger.info("✅ Streams seeded")


def seed_careers(db):
    """Seed career data."""
    careers = [
        {"title": "Software Engineer", "slug": "software-engineer", "stream": "science", "category": "Technology", "description": "Design, develop, and maintain software applications.", "average_salary_entry": 600000, "average_salary_mid": 1500000, "average_salary_senior": 3500000, "growth_rate": 15.0, "demand_level": "high", "work_environment": "hybrid"},
        {"title": "Data Scientist", "slug": "data-scientist", "stream": "science", "category": "Technology", "description": "Analyze complex data to help organizations make better decisions.", "average_salary_entry": 700000, "average_salary_mid": 1800000, "average_salary_senior": 4000000, "growth_rate": 20.0, "demand_level": "high", "work_environment": "hybrid"},
        {"title": "Doctor (MBBS)", "slug": "doctor-mbbs", "stream": "science", "category": "Healthcare", "description": "Diagnose and treat medical conditions in patients.", "average_salary_entry": 500000, "average_salary_mid": 1200000, "average_salary_senior": 3000000, "growth_rate": 8.0, "demand_level": "high", "work_environment": "office"},
        {"title": "Chartered Accountant", "slug": "chartered-accountant", "stream": "commerce", "category": "Finance", "description": "Manage financial records, auditing, and tax compliance.", "average_salary_entry": 700000, "average_salary_mid": 1500000, "average_salary_senior": 3000000, "growth_rate": 10.0, "demand_level": "high", "work_environment": "office"},
        {"title": "UX Designer", "slug": "ux-designer", "stream": "arts", "category": "Design", "description": "Design user experiences for digital products.", "average_salary_entry": 500000, "average_salary_mid": 1200000, "average_salary_senior": 2500000, "growth_rate": 18.0, "demand_level": "high", "work_environment": "hybrid"},
        {"title": "Mechanical Engineer", "slug": "mechanical-engineer", "stream": "science", "category": "Engineering", "description": "Design and manufacture mechanical systems and machines.", "average_salary_entry": 400000, "average_salary_mid": 1000000, "average_salary_senior": 2000000, "growth_rate": 6.0, "demand_level": "medium", "work_environment": "field"},
        {"title": "Business Analyst", "slug": "business-analyst", "stream": "commerce", "category": "Business", "description": "Analyze business processes and recommend improvements.", "average_salary_entry": 500000, "average_salary_mid": 1200000, "average_salary_senior": 2500000, "growth_rate": 12.0, "demand_level": "high", "work_environment": "office"},
        {"title": "Graphic Designer", "slug": "graphic-designer", "stream": "arts", "category": "Design", "description": "Create visual content for print and digital media.", "average_salary_entry": 300000, "average_salary_mid": 800000, "average_salary_senior": 1500000, "growth_rate": 10.0, "demand_level": "medium", "work_environment": "hybrid"},
        {"title": "Civil Engineer", "slug": "civil-engineer", "stream": "science", "category": "Engineering", "description": "Design and oversee construction of infrastructure projects.", "average_salary_entry": 400000, "average_salary_mid": 1000000, "average_salary_senior": 2200000, "growth_rate": 7.0, "demand_level": "medium", "work_environment": "field"},
        {"title": "Product Manager", "slug": "product-manager", "stream": "commerce", "category": "Technology", "description": "Lead product development from ideation to launch.", "average_salary_entry": 800000, "average_salary_mid": 2000000, "average_salary_senior": 4500000, "growth_rate": 16.0, "demand_level": "high", "work_environment": "hybrid"},
        {"title": "Full Stack Developer", "slug": "full-stack-developer", "stream": "vocational", "category": "Technology", "description": "Build both frontend and backend of web applications.", "average_salary_entry": 500000, "average_salary_mid": 1400000, "average_salary_senior": 3000000, "growth_rate": 17.0, "demand_level": "high", "work_environment": "remote"},
        {"title": "Content Strategist", "slug": "content-strategist", "stream": "arts", "category": "Marketing", "description": "Plan and manage content across digital platforms.", "average_salary_entry": 400000, "average_salary_mid": 900000, "average_salary_senior": 1800000, "growth_rate": 12.0, "demand_level": "medium", "work_environment": "remote"},
        {"title": "Financial Analyst", "slug": "financial-analyst", "stream": "commerce", "category": "Finance", "description": "Analyze financial data and provide investment recommendations.", "average_salary_entry": 600000, "average_salary_mid": 1300000, "average_salary_senior": 2800000, "growth_rate": 11.0, "demand_level": "high", "work_environment": "office"},
        {"title": "Research Scientist", "slug": "research-scientist", "stream": "science", "category": "Research", "description": "Conduct scientific research and experiments.", "average_salary_entry": 500000, "average_salary_mid": 1200000, "average_salary_senior": 2500000, "growth_rate": 9.0, "demand_level": "medium", "work_environment": "office"},
        {"title": "Cybersecurity Analyst", "slug": "cybersecurity-analyst", "stream": "science", "category": "Technology", "description": "Protect organizations from cyber threats and attacks.", "average_salary_entry": 600000, "average_salary_mid": 1500000, "average_salary_senior": 3200000, "growth_rate": 22.0, "demand_level": "high", "work_environment": "hybrid"},
    ]

    for c_data in careers:
        existing = db.query(Career).filter(Career.slug == c_data["slug"]).first()
        if not existing:
            career = Career(**c_data)
            db.add(career)
            db.flush()
            # Add career score
            score = CareerScore(
                career_id=career.id,
                automation_risk=30.0 if c_data["category"] == "Technology" else 50.0,
                future_proof_score=c_data["growth_rate"] * 5,
                market_demand_score=90.0 if c_data["demand_level"] == "high" else 60.0,
                skill_transferability=75.0,
            )
            db.add(score)

    db.commit()
    logger.info("✅ Careers seeded")


def seed_colleges(db):
    """Seed sample college data."""
    colleges = [
        {"name": "Indian Institute of Technology Bombay", "slug": "iit-bombay", "university": "IIT Bombay", "type": "government", "city": "Mumbai", "state": "Maharashtra", "country": "India", "established_year": 1958, "accreditation": "NAAC A++", "nirf_rank": 3, "placement_rate": 95.0, "average_package": 18.0, "highest_package": 80.0, "fee_range_min": 200000, "fee_range_max": 250000},
        {"name": "Indian Institute of Technology Delhi", "slug": "iit-delhi", "university": "IIT Delhi", "type": "government", "city": "New Delhi", "state": "Delhi", "country": "India", "established_year": 1961, "accreditation": "NAAC A++", "nirf_rank": 2, "placement_rate": 96.0, "average_package": 20.0, "highest_package": 90.0, "fee_range_min": 200000, "fee_range_max": 250000},
        {"name": "Indian Institute of Science Bangalore", "slug": "iisc-bangalore", "university": "IISc", "type": "government", "city": "Bangalore", "state": "Karnataka", "country": "India", "established_year": 1909, "accreditation": "NAAC A++", "nirf_rank": 1, "placement_rate": 90.0, "average_package": 15.0, "highest_package": 60.0, "fee_range_min": 100000, "fee_range_max": 200000},
        {"name": "BITS Pilani", "slug": "bits-pilani", "university": "BITS", "type": "deemed", "city": "Pilani", "state": "Rajasthan", "country": "India", "established_year": 1964, "accreditation": "NAAC A", "nirf_rank": 25, "placement_rate": 92.0, "average_package": 14.0, "highest_package": 65.0, "fee_range_min": 400000, "fee_range_max": 500000},
        {"name": "National Institute of Technology Karnataka", "slug": "nitk-surathkal", "university": "NIT Karnataka", "type": "government", "city": "Mangalore", "state": "Karnataka", "country": "India", "established_year": 1960, "accreditation": "NAAC A+", "nirf_rank": 12, "placement_rate": 88.0, "average_package": 12.0, "highest_package": 45.0, "fee_range_min": 150000, "fee_range_max": 200000},
        {"name": "VIT Vellore", "slug": "vit-vellore", "university": "VIT University", "type": "deemed", "city": "Vellore", "state": "Tamil Nadu", "country": "India", "established_year": 1984, "accreditation": "NAAC A++", "nirf_rank": 15, "placement_rate": 85.0, "average_package": 10.0, "highest_package": 40.0, "fee_range_min": 300000, "fee_range_max": 400000},
        {"name": "SRM Institute of Science and Technology", "slug": "srm-chennai", "university": "SRM University", "type": "deemed", "city": "Chennai", "state": "Tamil Nadu", "country": "India", "established_year": 1985, "accreditation": "NAAC A++", "nirf_rank": 30, "placement_rate": 82.0, "average_package": 8.0, "highest_package": 35.0, "fee_range_min": 250000, "fee_range_max": 400000},
        {"name": "Christ University", "slug": "christ-bangalore", "university": "Christ University", "type": "deemed", "city": "Bangalore", "state": "Karnataka", "country": "India", "established_year": 1969, "accreditation": "NAAC A+", "nirf_rank": 50, "placement_rate": 75.0, "average_package": 6.0, "highest_package": 20.0, "fee_range_min": 100000, "fee_range_max": 300000},
        {"name": "Manipal Institute of Technology", "slug": "mit-manipal", "university": "MAHE", "type": "deemed", "city": "Manipal", "state": "Karnataka", "country": "India", "established_year": 1957, "accreditation": "NAAC A++", "nirf_rank": 20, "placement_rate": 88.0, "average_package": 11.0, "highest_package": 42.0, "fee_range_min": 350000, "fee_range_max": 500000},
        {"name": "APS College of Arts and Science", "slug": "aps-college", "university": "Bangalore University", "type": "private", "city": "Bangalore", "state": "Karnataka", "country": "India", "established_year": 1995, "accreditation": "NAAC B+", "nirf_rank": None, "placement_rate": 70.0, "average_package": 4.0, "highest_package": 12.0, "fee_range_min": 50000, "fee_range_max": 100000},
    ]

    for c_data in colleges:
        existing = db.query(College).filter(College.slug == c_data["slug"]).first()
        if not existing:
            college = College(**c_data)
            db.add(college)
            db.flush()
            # Add college scores
            score = CollegeScore(
                college_id=college.id,
                academic_score=min((c_data.get("placement_rate", 70) / 100) * 90, 95),
                placement_score=c_data.get("placement_rate", 70),
                overall_score=c_data.get("placement_rate", 70) * 0.9,
            )
            db.add(score)
            # Add sample courses
            courses = [
                {"course_name": "B.Tech Computer Science", "degree_type": "UG", "duration_years": 4, "stream": "science", "annual_fee": c_data.get("fee_range_min", 100000)},
                {"course_name": "BCA", "degree_type": "UG", "duration_years": 3, "stream": "science", "annual_fee": c_data.get("fee_range_min", 50000)},
                {"course_name": "B.Com", "degree_type": "UG", "duration_years": 3, "stream": "commerce", "annual_fee": c_data.get("fee_range_min", 50000) * 0.8},
            ]
            for course_data in courses:
                course = CollegeCourse(college_id=college.id, **course_data)
                db.add(course)

    db.commit()
    logger.info("✅ Colleges seeded")


def run_seed():
    """Run all seeders."""
    db = SessionLocal()
    try:
        logger.info("🌱 Starting database seed...")
        seed_streams(db)
        seed_careers(db)
        seed_colleges(db)
        logger.info("🌱 Database seeding complete!")
    except Exception as e:
        logger.error(f"❌ Seeding failed: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    run_seed()
