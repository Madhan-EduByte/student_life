"""
DestinAI — 1000 Database Seeder (Parameterized with Timestamps & Unique Titles)
Generates and seeds exactly 1000 high-quality colleges and courses,
and 1000 modern, realistic career paths into the MySQL database.
"""

import logging
import random
import re
from datetime import datetime
from typing import List, Dict, Any, Optional
from sqlalchemy import text
from app.core.database import engine

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Sample Indian cities and states mapping
CITIES_STATES = [
    ("Mumbai", "Maharashtra"), ("Pune", "Maharashtra"), ("Nagpur", "Maharashtra"), ("Thane", "Maharashtra"),
    ("Bangalore", "Karnataka"), ("Manipal", "Karnataka"), ("Mangalore", "Karnataka"), ("Mysore", "Karnataka"),
    ("New Delhi", "Delhi"), ("Noida", "Uttar Pradesh"), ("Kanpur", "Uttar Pradesh"), ("Lucknow", "Uttar Pradesh"),
    ("Chennai", "Tamil Nadu"), ("Vellore", "Tamil Nadu"), ("Coimbatore", "Tamil Nadu"), ("Trichy", "Tamil Nadu"),
    ("Hyderabad", "Telangana"), ("Warangal", "Telangana"), ("Kolkata", "West Bengal"), ("Jadavpur", "West Bengal"),
    ("Pilani", "Rajasthan"), ("Jaipur", "Rajasthan"), ("Jodhpur", "Rajasthan"), ("Udaipur", "Rajasthan"),
    ("Ahmedabad", "Gujarat"), ("Gandhinagar", "Gujarat"), ("Surat", "Gujarat"), ("Vadodara", "Gujarat"),
    ("Kochi", "Kerala"), ("Trivandrum", "Kerala"), ("Calicut", "Kerala"), ("Indore", "Madhya Pradesh"),
    ("Bhopal", "Madhya Pradesh"), ("Chandigarh", "Punjab"), ("Amritsar", "Punjab"), ("Ludhiana", "Punjab"),
    ("Bhubaneswar", "Odisha"), ("Guwahati", "Assam"), ("Dehradun", "Uttarakhand"), ("Patna", "Bihar")
]

UNIVERSITIES = [
    "Delhi University", "Mumbai University", "Bangalore University", "Anna University",
    "Pune University", "Calcutta University", "Symbiosis International", "Manipal Academy of Higher Education",
    "BITS University", "Jawaharlal Nehru University", "Amity University", "Christ University",
    "VIT University", "SRM University", "PES University", "Jadavpur University", "Osmania University"
]

ACCREDITATIONS = ["NAAC A++", "NAAC A+", "NAAC A", "NAAC B++", "NAAC B+", "NAAC B"]

# Stream courses lists
ARTS_COURSES = [
    ("B.A. Journalism & Mass Communication", "UG", 3, 40000, 120000),
    ("B.Des Fashion & Apparel Design", "UG", 4, 150000, 300000),
    ("B.Des Product & Industrial Design", "UG", 4, 180000, 350000),
    ("B.A. Psychology & Sociology", "UG", 3, 30000, 90000),
    ("B.A. English Literature & Creative Writing", "UG", 3, 25000, 80000),
    ("B.A. Animation & Visual Effects", "UG", 3, 100000, 250000),
    ("B.A. Fine Arts & Sculpture", "UG", 3, 20000, 70000),
    ("B.A. Public Policy & Economics", "UG", 3, 40000, 100000),
    ("B.A. Performing Arts & Theater", "UG", 3, 30000, 110000),
    ("B.Des Visual Communication", "UG", 4, 120000, 280000),
    ("B.Arch Bachelor of Architecture", "UG", 5, 150000, 350000)
]

SCIENCE_COURSES = [
    ("B.Tech Computer Science & Engineering", "UG", 4, 180000, 450000),
    ("B.Tech Artificial Intelligence & Machine Learning", "UG", 4, 200000, 500000),
    ("B.Tech Data Science & Analytics", "UG", 4, 190000, 480000),
    ("B.Tech Information Technology", "UG", 4, 160000, 400000),
    ("B.Tech Electronics & Communication", "UG", 4, 140000, 350000),
    ("B.Tech Mechanical & Robotics Engineering", "UG", 4, 120000, 300000),
    ("B.Tech Aerospace & Astronautics", "UG", 4, 220000, 550000),
    ("B.Sc Data Analytics", "UG", 3, 50000, 150000),
    ("B.Sc Research in Physics", "UG", 4, 60000, 180000),
    ("B.Sc Mathematics & Statistics", "UG", 3, 40000, 120000),
    ("B.Sc Bioinformatics", "UG", 3, 70000, 200000),
    ("BCA Bachelor of Computer Applications", "UG", 3, 60000, 180000)
]

COMMERCE_COURSES = [
    ("B.Com Honors in Financial Markets", "UG", 3, 40000, 130000),
    ("B.Com General Accounting & Auditing", "UG", 3, 30000, 90000),
    ("BBA Finance & Investment Banking", "UG", 3, 100000, 300000),
    ("BBA Global Marketing & Strategy", "UG", 3, 120000, 320000),
    ("BBA Entrepreneurship & Family Business", "UG", 3, 150000, 350000),
    ("BBA Human Resource Management", "UG", 3, 80000, 220000),
    ("B.Com in E-Commerce & Digital Trade", "UG", 3, 50000, 150000),
    ("M.Com Chartered Accounting Track", "PG", 2, 60000, 180000),
    ("B.Com Business Analytics", "UG", 3, 70000, 200000)
]

VOCATIONAL_COURSES = [
    ("B.Voc Software Development & Coding", "UG", 3, 40000, 100000),
    ("B.Voc Animation & VFX Production", "UG", 3, 80000, 180000),
    ("B.Voc Culinary Arts & Hotel Management", "UG", 3, 100000, 250000),
    ("B.Voc Travel, Tourism & Aviation Management", "UG", 3, 60000, 160000),
    ("B.Voc Smart Grid Electrical Technology", "UG", 3, 40000, 110000),
    ("B.Voc Green Energy & Sustainable Practices", "UG", 3, 50000, 130000),
    ("B.Voc Automobile Service & Robotics", "UG", 3, 40000, 120000),
    ("B.Voc Interior Space Design", "UG", 3, 80000, 200000)
]

def clean_slug(name: str) -> str:
    slug = name.lower().strip()
    slug = re.sub(r'[^a-z0-9\s-]', '', slug)
    slug = re.sub(r'[\s-]+', '-', slug)
    return slug

def generate_seeds() -> None:
    logger.info("🌱 Beginning dynamic 1000 colleges & 1000 careers seeder script")
    
    # ── 1. Clear Tables safely ──────────────────────────────────
    with engine.begin() as conn:
        logger.info("🧹 Clearing existing database tables...")
        conn.exec_driver_sql("SET FOREIGN_KEY_CHECKS = 0;")
        conn.exec_driver_sql("TRUNCATE TABLE college_courses;")
        conn.exec_driver_sql("TRUNCATE TABLE college_scores;")
        conn.exec_driver_sql("TRUNCATE TABLE colleges;")
        conn.exec_driver_sql("TRUNCATE TABLE career_scores;")
        conn.exec_driver_sql("TRUNCATE TABLE careers;")
        conn.exec_driver_sql("SET FOREIGN_KEY_CHECKS = 1;")
        logger.info("✅ Database tables cleared successfully.")

    # ── 2. Generate 1000 Colleges ────────────────────
    logger.info("🏫 Generating 1000 diverse Indian Colleges...")
    colleges_list = []
    
    prefixes = [
        "National Institute of", "Royal College of", "Apex Institute of", "Vanguard University School of",
        "Pioneer College of", "Imperial Academy of", "Trinity Institute of", "St. Xavier's College of",
        "Sanskrit Academy of", "Future Ready College of", "Elysian School of", "Mahatma Gandhi Institute of",
        "Indira Priyadarshini College of", "Subhash Chandra Academy of", "Aryabhata School of", "Chanakya Institute of"
    ]
    
    specialties = [
        ("Design & Creative Media", "arts"), ("Journalism & Communication", "arts"), ("Liberal Arts & Humanities", "arts"), ("Fine Arts & Music", "arts"),
        ("Engineering & Technology", "science"), ("Computer Science & AI", "science"), ("Advanced Research & Sciences", "science"), ("Information Systems", "science"),
        ("Finance & Commerce", "commerce"), ("Business Administration & Management", "commerce"), ("Global Trade & Economics", "commerce"), ("Financial Markets", "commerce"),
        ("Vocational Studies & Coding", "vocational"), ("Applied Arts & Trades", "vocational"), ("Sustainable Technologies", "vocational"), ("Hospitality & Aviation", "vocational")
    ]
    
    multi_titles = [
        "Metropolitan University", "Global Heritage College", "Central Multidisciplinary Academy", "Apex Unified Institute",
        "National Integrated University", "Universal Excellence College", "State Concord College", "Pinnacle Multidisciplinary Academy"
    ]

    now_time = datetime.utcnow()

    for i in range(1, 1001):
        city, state = random.choice(CITIES_STATES)
        univ = random.choice(UNIVERSITIES)
        col_type = random.choice(["government", "deemed", "private"])
        established = random.randint(1920, 2022)
        accreditation = random.choice(ACCREDITATIONS)
        nirf_rank = i
        placement_rate = round(random.uniform(62.0, 98.0), 1)
        avg_package = round(random.uniform(3.5, 24.0), 1)
        highest_package = round(avg_package * random.uniform(2.5, 4.8), 1)
        
        # Decide category of college
        cat_roll = random.random()
        if cat_roll < 0.25:
            prefix = random.choice([p for p in prefixes if "Arts" in p or "Creative" in p or "Academy" in p or "College" in p or "Xavier" in p])
            field_name, primary_stream = random.choice([s for s in specialties if s[1] == "arts"])
            col_name = f"{prefix} {field_name} {city}"
        elif cat_roll < 0.55:
            prefix = random.choice([p for p in prefixes if "Institute" in p or "Engineering" in p or "School" in p or "Academy" in p])
            field_name, primary_stream = random.choice([s for s in specialties if s[1] == "science"])
            col_name = f"{prefix} {field_name} {city}"
        elif cat_roll < 0.80:
            prefix = random.choice([p for p in prefixes if "Business" in p or "College" in p or "Trinity" in p or "Chanakya" in p])
            field_name, primary_stream = random.choice([s for s in specialties if s[1] == "commerce"])
            col_name = f"{prefix} {field_name} {city}"
        else:
            primary_stream = "multidisciplinary"
            col_name = f"{random.choice(multi_titles)} {city}"

        slug = clean_slug(col_name)
        
        if primary_stream == "arts" or col_type == "government":
            fee_min = float(random.randint(8000, 60000))
            fee_max = float(random.randint(int(fee_min), 120000))
        elif primary_stream == "science" or col_type == "deemed":
            fee_min = float(random.randint(120000, 250000))
            fee_max = float(random.randint(int(fee_min), 550000))
        else:
            fee_min = float(random.randint(50000, 150000))
            fee_max = float(random.randint(int(fee_min), 350000))

        colleges_list.append({
            "id": i,
            "name": f"{col_name} #{i}",
            "slug": f"{slug}-{i}",
            "university": f"{univ} ({city})",
            "type": col_type,
            "city": city,
            "state": state,
            "country": "India",
            "established_year": established,
            "accreditation": accreditation,
            "nirf_rank": nirf_rank,
            "placement_rate": placement_rate,
            "average_package": avg_package,
            "highest_package": highest_package,
            "fee_range_min": fee_min,
            "fee_range_max": fee_max,
            "primary_stream": primary_stream,
            "created_at": now_time,
            "updated_at": now_time
        })

    # Bulk insert colleges using Parameterized SQL including timestamps
    with engine.begin() as conn:
        conn.execute(
            text("INSERT INTO colleges (id, name, slug, university, type, city, state, country, established_year, accreditation, nirf_rank, placement_rate, average_package, highest_package, fee_range_min, fee_range_max, created_at, updated_at) "
                 "VALUES (:id, :name, :slug, :university, :type, :city, :state, :country, :established_year, :accreditation, :nirf_rank, :placement_rate, :average_package, :highest_package, :fee_range_min, :fee_range_max, :created_at, :updated_at)"),
            colleges_list
        )
    logger.info("✅ 1000 Colleges successfully seeded.")

    # ── 3. Generate College Courses & Scores ────────────────────
    logger.info("📚 Populating Courses and DNA scores for 1000 Colleges...")
    courses_to_insert = []
    scores_to_insert = []
    
    course_id = 1
    for c in colleges_list:
        p_stream = c["primary_stream"]
        
        offered_list = []
        if p_stream == "arts":
            offered_list = random.sample(ARTS_COURSES, random.randint(3, 6))
        elif p_stream == "science":
            offered_list = random.sample(SCIENCE_COURSES, random.randint(3, 6))
        elif p_stream == "commerce":
            offered_list = random.sample(COMMERCE_COURSES, random.randint(3, 6))
        else:
            offered_list += random.sample(ARTS_COURSES, random.randint(1, 2))
            offered_list += random.sample(SCIENCE_COURSES, random.randint(1, 2))
            offered_list += random.sample(COMMERCE_COURSES, random.randint(1, 2))
            offered_list += random.sample(VOCATIONAL_COURSES, random.randint(1, 2))

        fee_factor = 1.0
        if c["type"] == "government":
            fee_factor = 0.4
        elif c["type"] == "deemed":
            fee_factor = 1.3
            
        for course_name, deg, duration, min_f, max_f in offered_list:
            c_stream = "arts"
            if course_name in [sc[0] for sc in SCIENCE_COURSES]:
                c_stream = "science"
            elif course_name in [cc[0] for cc in COMMERCE_COURSES]:
                c_stream = "commerce"
            elif course_name in [vc[0] for vc in VOCATIONAL_COURSES]:
                c_stream = "vocational"
                
            fee = float(int(random.uniform(min_f, max_f) * fee_factor))
            
            courses_to_insert.append({
                "id": course_id,
                "college_id": c["id"],
                "course_name": course_name,
                "degree_type": deg,
                "duration_years": duration,
                "stream": c_stream,
                "annual_fee": fee,
                "created_at": now_time
            })
            course_id += 1

        academic = float(random.randint(65, 98))
        infrastructure = float(random.randint(60, 96))
        placement = float(random.randint(int(c["placement_rate"]) - 5, min(99, int(c["placement_rate"]) + 2)))
        faculty = float(random.randint(65, 97))
        culture = float(random.randint(70, 98))
        alumni = float(random.randint(60, 96))
        research = float(random.randint(50, 97))
        overall = round((academic + infrastructure + placement + faculty + culture) / 5, 1)

        scores_to_insert.append({
            "college_id": c["id"],
            "academic_score": academic,
            "infrastructure_score": infrastructure,
            "placement_score": placement,
            "overall_score": overall,
            "last_updated": now_time
        })

    # Parameterized Chunked inserts
    chunk_size = 500
    with engine.begin() as conn:
        for idx in range(0, len(courses_to_insert), chunk_size):
            chunk = courses_to_insert[idx : idx + chunk_size]
            conn.execute(
                text("INSERT INTO college_courses (id, college_id, course_name, degree_type, duration_years, stream, annual_fee, created_at) "
                     "VALUES (:id, :college_id, :course_name, :degree_type, :duration_years, :stream, :annual_fee, :created_at)"),
                chunk
            )
            
        for idx in range(0, len(scores_to_insert), chunk_size):
            chunk = scores_to_insert[idx : idx + chunk_size]
            conn.execute(
                text("INSERT INTO college_scores (college_id, academic_score, infrastructure_score, placement_score, overall_score, last_updated) "
                     "VALUES (:college_id, :academic_score, :infrastructure_score, :placement_score, :overall_score, :last_updated)"),
                chunk
            )

    logger.info("✅ Courses and scores successfully seeded for 1000 Colleges.")

    # ── 4. Generate 1000 Careers ─────────────────────
    logger.info("🚀 Generating 1000 modern Career Paths...")
    careers_list = []
    
    career_prefixes = [
        "AI", "Global", "Sustainable", "Quantum", "Digital", "Bio", "Nanotech", "Strategic",
        "UX", "Creative", "Cybersecurity", "Corporate", "Financial", "Applied", "Robotics", "E-Commerce"
    ]
    
    career_titles = [
        ("Engineer", "science", "Technology", "💻"), ("Scientist", "science", "Research", "🔬"),
        ("Developer", "vocational", "Technology", "🌐"), ("Specialist", "commerce", "Business", "📊"),
        ("Strategist", "commerce", "Marketing", "📱"), ("Designer", "arts", "Design", "🎨"),
        ("Architect", "arts", "Design", "🏛️"), ("Counsel", "arts", "Legal", "⚖️"),
        ("Auditor", "commerce", "Finance", "💹"), ("Manager", "commerce", "Business", "📈"),
        ("Planner", "commerce", "Logistics", "🚢"), ("Technician", "vocational", "Trades", "🛠️"),
        ("Specialist", "science", "Healthcare", "🩺"), ("Therapist", "science", "Healthcare", "💊"),
        ("Mural Artist", "arts", "Art", "🖌️"), ("Consultant", "commerce", "Business", "📋")
    ]

    field_keywords = [
        "Agentic Systems", "Decarbonization", "Cloud Security", "VFX Sculpting", "Financial Modeling",
        "Neuromorphic Computing", "Autonomous Delivery", "Precision Agronomy", "Pediatric Health",
        "Growth Marketing", "Supply Chain", "Micro-Grid Systems", "Smart Materials", "Cyber Law"
    ]

    for i in range(1, 1001):
        pref = random.choice(career_prefixes)
        base, stream, category, icon = random.choice(career_titles)
        keyword = random.choice(field_keywords)
        
        # Include index i to guarantee absolute uniqueness
        title = f"{pref} {keyword} {base} #{i}"
        slug = clean_slug(title)
        
        salary_entry = random.randint(250000, 900000)
        salary_mid = random.randint(salary_entry + 200000, 2200000)
        salary_senior = random.randint(salary_mid + 500000, 5000000)
        growth = round(random.uniform(4.0, 28.0), 1)
        demand = random.choice(["high", "medium", "low"])
        env = random.choice(["office", "hybrid", "field", "remote"])

        desc = f"Specialized professional pathway in {title}. Focuses on building, managing, or optimizing modern {category} processes using state-of-the-art tools."

        careers_list.append({
            "id": i,
            "title": title,
            "slug": f"{slug}-{i}",
            "stream": stream,
            "category": category,
            "description": desc,
            "average_salary_entry": salary_entry,
            "average_salary_mid": salary_mid,
            "average_salary_senior": salary_senior,
            "growth_rate": growth,
            "demand_level": demand,
            "work_environment": env,
            "icon": icon,
            "created_at": now_time,
            "updated_at": now_time
        })

    with engine.begin() as conn:
        for idx in range(0, len(careers_list), chunk_size):
            chunk = careers_list[idx : idx + chunk_size]
            conn.execute(
                text("INSERT INTO careers (id, title, slug, stream, category, description, average_salary_entry, average_salary_mid, average_salary_senior, growth_rate, demand_level, work_environment, icon, created_at, updated_at) "
                     "VALUES (:id, :title, :slug, :stream, :category, :description, :average_salary_entry, :average_salary_mid, :average_salary_senior, :growth_rate, :demand_level, :work_environment, :icon, :created_at, :updated_at)"),
                chunk
            )

    logger.info("✅ 1000 Careers successfully seeded.")

    # ── 5. Generate Career Scores ────────────────────
    logger.info("📊 Seeding career compatibility scores...")
    career_scores_to_insert = []
    
    for c in careers_list:
        auto_risk = random.randint(8, 88)
        future_proof = random.randint(45, 96)
        market_demand = random.randint(40, 98)
        skill_transfer = random.randint(50, 95)
        
        career_scores_to_insert.append({
            "career_id": c["id"],
            "automation_risk": auto_risk,
            "future_proof_score": future_proof,
            "market_demand_score": market_demand,
            "skill_transferability": skill_transfer,
            "last_updated": now_time
        })

    with engine.begin() as conn:
        for idx in range(0, len(career_scores_to_insert), chunk_size):
            chunk = career_scores_to_insert[idx : idx + chunk_size]
            conn.execute(
                text("INSERT INTO career_scores (career_id, automation_risk, future_proof_score, market_demand_score, skill_transferability, last_updated) "
                     "VALUES (:career_id, :automation_risk, :future_proof_score, :market_demand_score, :skill_transferability, :last_updated)"),
                chunk
            )
            
    logger.info("✅ Seeding completed! Database successfully populated with exactly 1000 Parameterized Colleges and 1000 Careers.")

if __name__ == "__main__":
    generate_seeds()
