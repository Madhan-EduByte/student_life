"""
DestinAI — Compatibility Engine & Match Scoring Tests
"""

import pytest
from app.models.college import College, CollegeCourse, CollegeScore
from app.services.college_service import college_service


def test_compatibility_engine_arts_profile(db_session):
    """
    Test that the compatibility engine filters out engineering-only colleges
    when an arts profile is matched, correctly maps recommended courses, and
    favors rural/small-town campuses over metro hubs for rural preferences.
    """
    # 1. Seed the test SQLite database with diverse colleges
    # College A: Pure Engineering (Science) in Metropolitan Mumbai
    eng_college = College(
        id=1,
        name="Apex Engineering College",
        slug="apex-engineering",
        university="VTU",
        type="private",
        city="Mumbai",
        state="Maharashtra",
        country="India",
        established_year=2001,
        accreditation="NAAC A",
        nirf_rank=45,
        placement_rate=85.0,
        average_package=8.0,
        highest_package=25.0,
        fee_range_min=200000.0,
        fee_range_max=250000.0,
    )
    # College B: Liberal Arts (Arts) in non-metro Small Town Vellore (Low Fee)
    arts_small_town = College(
        id=2,
        name="St. Xavier's Liberal Arts College",
        slug="st-xaviers-arts",
        university="Delhi University",
        type="government",
        city="Vellore",
        state="Tamil Nadu",
        country="India",
        established_year=1965,
        accreditation="NAAC A++",
        nirf_rank=8,
        placement_rate=90.0,
        average_package=9.5,
        highest_package=20.0,
        fee_range_min=20000.0,
        fee_range_max=30000.0,
    )
    # College C: Design (Arts) in Metropolitan Bangalore (Higher Fee)
    design_metro = College(
        id=3,
        name="RV College of Design",
        slug="rv-design",
        university="Bangalore University",
        type="private",
        city="Bangalore",
        state="Karnataka",
        country="India",
        established_year=2012,
        accreditation="NAAC A+",
        nirf_rank=28,
        placement_rate=82.0,
        average_package=7.0,
        highest_package=15.0,
        fee_range_min=100000.0,
        fee_range_max=120000.0,
    )

    db_session.add_all([eng_college, arts_small_town, design_metro])
    db_session.commit()

    # Seed Courses
    courses = [
        # Engineering College Courses (Science stream)
        CollegeCourse(id=1, college_id=1, course_name="B.Tech Computer Science", stream="science", annual_fee=250000.0),
        CollegeCourse(id=2, college_id=1, course_name="B.Tech Data Science", stream="science", annual_fee=240000.0),
        # Small Town Arts College Courses (Arts stream)
        CollegeCourse(id=3, college_id=2, course_name="B.A. English Literature & Journalism", stream="arts", annual_fee=30000.0),
        CollegeCourse(id=4, college_id=2, course_name="B.A. Applied Psychology", stream="arts", annual_fee=25000.0),
        # Metro Design College Courses (Arts stream)
        CollegeCourse(id=5, college_id=3, course_name="B.Des Fashion Design", stream="arts", annual_fee=120000.0),
        CollegeCourse(id=6, college_id=3, course_name="B.Des Visual Communication", stream="arts", annual_fee=110000.0),
    ]
    db_session.add_all(courses)
    db_session.commit()

    # 2. Simulate Creative Arts profile matching with rural & free preferences
    criteria = {
        "preferred_stream": "Creative Arts & Media",  # Mapped to ["arts", "vocational"]
        "location": "Rural / Small Town",             # Metropolitan penalty for Mumbai/Bangalore, Small town bonus for Vellore
        "budget_range": "Zero/Self-Taught"            # Mapped to 10k fee, budget penalty for all except very low fees
    }

    # 3. Call matching engine
    import asyncio
    loop = asyncio.get_event_loop()
    matches = loop.run_until_complete(college_service.match_colleges(db_session, user_id=0, criteria=criteria))

    # 4. Verify Assertions
    # A. Engineering college is completely excluded because of stream mismatch SQL join filtering!
    matched_ids = [m["college"].id for m in matches]
    assert eng_college.id not in matched_ids, "Engineering college must be excluded for Creative Arts student"

    # B. Arts and Design colleges are successfully matched
    assert arts_small_town.id in matched_ids, "Small town Arts college should be matched"
    assert design_metro.id in matched_ids, "Metro Design college should be matched"

    # C. Match Order & Scoring verification
    # Small town arts college should rank higher than metro design college due to lower fee and small town Vellore bonus (+20 vs -15 metro penalty)
    arts_match = next(m for m in matches if m["college"].id == arts_small_town.id)
    design_match = next(m for m in matches if m["college"].id == design_metro.id)

    assert arts_match["match_score"] > design_match["match_score"], (
        f"Small town Arts college ({arts_match['match_score']}%) must score higher than "
        f"Metro Design college ({design_match['match_score']}%)"
    )

    # D. Recommended Courses mapping verification
    assert len(arts_match["college"].recommended_courses) > 0, "Recommended courses should be populated"
    assert "B.A. English Literature & Journalism" in arts_match["college"].recommended_courses
    assert "B.A. Applied Psychology" in arts_match["college"].recommended_courses
    assert "B.Tech Computer Science" not in arts_match["college"].recommended_courses
