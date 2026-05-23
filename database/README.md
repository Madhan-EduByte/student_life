# DestinAI — Database Documentation

This folder contains all the SQL initialization scripts, migration logic references, and seed data files for the DestinAI platform. The database is built on **MySQL 8.0+** and integrates with **SQLAlchemy** via the FastAPI backend.

## 🗄️ Database Overview

The DestinAI database is designed to be highly relational and optimized for AI-driven roadmap generation. It currently consists of **14 core tables** that manage users, educational data, AI-generated roadmaps, and career intelligence.

### Files in this Directory
- `init.sql`: The primary initialization script to create the schema and relationships.
- `seed_users.sql`: Populates initial test accounts (Student, Admin), along with their dummy student profiles, active AI roadmaps, and milestones.
- `seed_colleges.sql`: Contains 15,000+ global colleges (currently seeded with sample institutions), their courses, and ranking scores.
- `seed_careers.sql`: Contains base streams, professions, and their associated future-proof metrics.

---

## 📊 Core Tables & Schema

Below is a breakdown of the 14 tables, their primary columns, and how they power the DestinAI ecosystem.

### 1. Users & Profiles
These tables handle security, roles, and initial AI inputs.

| Table | Key Columns | Purpose / How it helps |
|---|---|---|
| **`users`** | `id`, `email`, `password_hash`, `role` | Stores secure credentials for students, parents, counsellors, and admins. Supports multiple roles. |
| **`student_profiles`** | `id`, `user_id`, `interest_areas`, `strengths` | Stores the student's background, budget, and preferences. Serves as the exact input mapped for the AI career guidance engine prompts. |
| **`parent_profiles`** | `id`, `user_id`, `linked_student_id` | Links parent accounts to student accounts, powering the "Family Compass" dashboard securely. |

### 2. Education Directory (College DNA)
The structured data used for the "College DNA Matching" feature.

| Table | Key Columns | Purpose / How it helps |
|---|---|---|
| **`colleges`** | `id`, `name`, `nirf_rank`, `placement_rate` | The master list of institutions. Used by the AI to match students based on budget, location, and metrics. |
| **`college_courses`** | `id`, `college_id`, `course_name`, `annual_fee` | Maps which colleges offer which courses (e.g., B.Tech Computer Science). Utilized for dynamic frontend filtering. |
| **`college_scores`** | `id`, `college_id`, `overall_score` | Detailed ratings (academic, infrastructure, placement) used to strictly evaluate college fit for students. |

### 4. Career Intelligence Engine
This powers the "Future-proof Career Score".

| Table | Key Columns | Purpose / How it helps |
|---|---|---|
| **`streams`** | `id`, `name`, `slug` | Defines core educational tracks (Science, Commerce, Arts, Vocational). |
| **`careers`** | `id`, `title`, `average_salary_entry` | Master directory of professions (Software Engineer, Data Scientist, Doctor, etc.). |
| **`career_scores`** | `id`, `career_id`, `automation_risk`, `future_proof_score` | Evaluates exact AI replacement risk and long-term salary projections to guide students safely. |

### 5. The Living Roadmap
The heart of the application. These tables store the AI's output and track student progress.

| Table | Key Columns | Purpose / How it helps |
|---|---|---|
| **`roadmaps`** | `id`, `user_id`, `career_path`, `version` | The master record of a student's AI-generated career path. Tracks the specific model used (e.g., Gemini). |
| **`milestones`** | `id`, `roadmap_id`, `week_number`, `is_completed` | The **Micro-milestone engine**. Breaks the multi-year roadmap into weekly actionable tasks. |
| **`roadmap_history`** | `id`, `roadmap_id`, `version`, `changes_summary` | Tracks changes and versioning when the AI auto-updates the roadmap every 6 months to stay relevant. |

### 6. Tracking & Analytics
Helps monitor application health and student success over time.

| Table | Key Columns | Purpose / How it helps |
|---|---|---|
| **`student_outcomes`** | `id`, `user_id`, `college_enrolled` | Tracks long-term success of the students (enrolled college, career started) for continuous AI feedback and training. |
| **`session_logs`** | `id`, `user_id`, `action`, `ip_address` | Audit logs for user actions, security monitoring, and system analytics. |

---

## ⚙️ How It Helps the DestinAI Project

1. **Prompt Engineering Storage**: By isolating `student_profiles` answers, the backend can easily pull exact answers to format structured prompts for the Gemini / OpenAI GPT-4 APIs.
2. **Living Roadmap Logic**: The `roadmaps` table and `roadmap_history` track versions. A background CRON job can easily query roadmaps older than 6 months and trigger an automatic recalculation.
3. **Fast Filtering**: Breaking down `colleges` and `college_courses` into indexed relational tables allows the frontend to quickly filter massive datasets instantly without overloading the AI.
4. **Role Isolation**: The `parent_profiles` table ensures strict data privacy via the Family Compass feature. Parents view specific dashboards without altering the student's milestone progress.

---

## 🚀 Quick Setup Commands

If you need to reset the database manually or run the seed scripts outside of the main PowerShell script, use the following:

```bash
# 1. Access MySQL
mysql -u root -proot123

# 2. Recreate the database
DROP DATABASE IF EXISTS destinai_db;
CREATE DATABASE destinai_db;
EXIT;

# 3. Run Alembic Migrations (from the /backend folder)
cd ../backend
alembic upgrade head

# 4. Seed the initial data
python init_db.py
```

> **Note:** The `init_db.py` script automatically reads the `.sql` files in this directory to populate the 20 colleges, 20 careers, and test accounts.