-- =============================================
-- DestinAI — Database Schema
-- MySQL 8.0+ Initial Schema Creation
-- =============================================

CREATE DATABASE IF NOT EXISTS destinai_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE destinai_db;

-- ─── Users ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) DEFAULT NULL,
  role ENUM('student', 'admin') DEFAULT 'student',
  is_active BOOLEAN DEFAULT TRUE,
  is_verified BOOLEAN DEFAULT FALSE,
  avatar_url VARCHAR(500) DEFAULT NULL,
  language VARCHAR(10) DEFAULT 'en',
  login_attempts INT DEFAULT 0,
  locked_until DATETIME DEFAULT NULL,
  last_login_at DATETIME DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
) ENGINE=InnoDB;

-- ─── Student Profiles ───────────────────────────────
CREATE TABLE IF NOT EXISTS student_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  interest_areas TEXT DEFAULT NULL,
  strengths TEXT DEFAULT NULL,
  preferred_stream ENUM('science', 'commerce', 'arts') DEFAULT NULL,
  education_level VARCHAR(100) DEFAULT NULL,
  budget_range VARCHAR(100) DEFAULT NULL,
  location_preference VARCHAR(255) DEFAULT NULL,
  date_of_birth DATETIME DEFAULT NULL,
  gender VARCHAR(20) DEFAULT NULL,
  city VARCHAR(100) DEFAULT NULL,
  state VARCHAR(100) DEFAULT NULL,
  country VARCHAR(100) DEFAULT 'India',
  current_school VARCHAR(255) DEFAULT NULL,
  current_grade VARCHAR(50) DEFAULT NULL,
  board VARCHAR(50) DEFAULT NULL,
  percentage_score VARCHAR(10) DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ─── Careers ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS careers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL UNIQUE,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT DEFAULT NULL,
  stream VARCHAR(50) DEFAULT NULL,
  category VARCHAR(100) DEFAULT NULL,
  sub_category VARCHAR(100) DEFAULT NULL,
  required_education VARCHAR(255) DEFAULT NULL,
  required_skills TEXT DEFAULT NULL,
  average_salary_entry DOUBLE DEFAULT NULL,
  average_salary_mid DOUBLE DEFAULT NULL,
  average_salary_senior DOUBLE DEFAULT NULL,
  growth_rate DOUBLE DEFAULT NULL,
  demand_level VARCHAR(20) DEFAULT NULL,
  work_environment VARCHAR(100) DEFAULT NULL,
  icon VARCHAR(100) DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_stream (stream),
  INDEX idx_category (category),
  INDEX idx_slug (slug)
) ENGINE=InnoDB;

-- ─── Career Scores ──────────────────────────────────
CREATE TABLE IF NOT EXISTS career_scores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  career_id INT NOT NULL,
  automation_risk DOUBLE DEFAULT NULL,
  ai_replacement_risk DOUBLE DEFAULT NULL,
  salary_projection_5yr DOUBLE DEFAULT NULL,
  salary_projection_10yr DOUBLE DEFAULT NULL,
  salary_projection_20yr DOUBLE DEFAULT NULL,
  future_proof_score DOUBLE DEFAULT NULL,
  market_demand_score DOUBLE DEFAULT NULL,
  skill_transferability DOUBLE DEFAULT NULL,
  last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (career_id) REFERENCES careers(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ─── Career Simulations ─────────────────────────────
CREATE TABLE IF NOT EXISTS career_simulations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  career_id INT NOT NULL,
  career_title VARCHAR(255) DEFAULT NULL,
  simulation TEXT DEFAULT NULL,
  daily_tasks TEXT DEFAULT NULL,
  challenges TEXT DEFAULT NULL,
  rewards TEXT DEFAULT NULL,
  typical_salary DOUBLE DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (career_id) REFERENCES careers(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ─── Colleges ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS colleges (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(500) NOT NULL,
  slug VARCHAR(500) NOT NULL UNIQUE,
  university VARCHAR(500) DEFAULT NULL,
  type VARCHAR(50) DEFAULT NULL,
  city VARCHAR(100) DEFAULT NULL,
  state VARCHAR(100) DEFAULT NULL,
  country VARCHAR(100) DEFAULT 'India',
  pincode VARCHAR(10) DEFAULT NULL,
  website VARCHAR(500) DEFAULT NULL,
  email VARCHAR(255) DEFAULT NULL,
  phone VARCHAR(20) DEFAULT NULL,
  logo_url VARCHAR(500) DEFAULT NULL,
  banner_url VARCHAR(500) DEFAULT NULL,
  description TEXT DEFAULT NULL,
  established_year INT DEFAULT NULL,
  accreditation VARCHAR(255) DEFAULT NULL,
  nirf_rank INT DEFAULT NULL,
  is_featured BOOLEAN DEFAULT FALSE,
  admission_process TEXT DEFAULT NULL,
  fee_range_min DOUBLE DEFAULT NULL,
  fee_range_max DOUBLE DEFAULT NULL,
  placement_rate DOUBLE DEFAULT NULL,
  average_package DOUBLE DEFAULT NULL,
  highest_package DOUBLE DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_city (city),
  INDEX idx_state (state),
  INDEX idx_country (country),
  INDEX idx_slug (slug)
) ENGINE=InnoDB;

-- ─── College Courses ────────────────────────────────
CREATE TABLE IF NOT EXISTS college_courses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  college_id INT NOT NULL,
  course_name VARCHAR(500) NOT NULL,
  degree_type VARCHAR(50) DEFAULT NULL,
  duration_years DOUBLE DEFAULT NULL,
  stream VARCHAR(50) DEFAULT NULL,
  specialization VARCHAR(255) DEFAULT NULL,
  annual_fee DOUBLE DEFAULT NULL,
  seats_available INT DEFAULT NULL,
  entrance_exam VARCHAR(255) DEFAULT NULL,
  eligibility TEXT DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (college_id) REFERENCES colleges(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ─── College Scores ─────────────────────────────────
CREATE TABLE IF NOT EXISTS college_scores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  college_id INT NOT NULL,
  academic_score DOUBLE DEFAULT NULL,
  infrastructure_score DOUBLE DEFAULT NULL,
  placement_score DOUBLE DEFAULT NULL,
  faculty_score DOUBLE DEFAULT NULL,
  culture_score DOUBLE DEFAULT NULL,
  alumni_score DOUBLE DEFAULT NULL,
  research_score DOUBLE DEFAULT NULL,
  overall_score DOUBLE DEFAULT NULL,
  last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (college_id) REFERENCES colleges(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ─── Roadmaps ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS roadmaps (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(500) NOT NULL,
  summary TEXT DEFAULT NULL,
  career_path VARCHAR(255) DEFAULT NULL,
  recommended_stream VARCHAR(50) DEFAULT NULL,
  confidence_score DOUBLE DEFAULT NULL,
  future_proof_score DOUBLE DEFAULT NULL,
  ai_model_used VARCHAR(50) DEFAULT NULL,
  raw_ai_response TEXT DEFAULT NULL,
  version INT DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  next_update_at DATETIME DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_active (user_id, is_active)
) ENGINE=InnoDB;

-- ─── Milestones ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS milestones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  roadmap_id INT NOT NULL,
  week_number INT NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT DEFAULT NULL,
  category VARCHAR(100) DEFAULT NULL,
  priority ENUM('high', 'medium', 'low') DEFAULT 'medium',
  estimated_hours DOUBLE DEFAULT NULL,
  resources TEXT DEFAULT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at DATETIME DEFAULT NULL,
  due_date DATETIME DEFAULT NULL,
  `order` INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (roadmap_id) REFERENCES roadmaps(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ─── Roadmap History ────────────────────────────────
CREATE TABLE IF NOT EXISTS roadmap_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  roadmap_id INT NOT NULL,
  version INT NOT NULL,
  changes_summary TEXT DEFAULT NULL,
  previous_data TEXT DEFAULT NULL,
  updated_data TEXT DEFAULT NULL,
  reason VARCHAR(255) DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (roadmap_id) REFERENCES roadmaps(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ─── Student Outcomes ───────────────────────────────
CREATE TABLE IF NOT EXISTS student_outcomes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  roadmap_id INT DEFAULT NULL,
  outcome_type VARCHAR(50) DEFAULT NULL,
  college_enrolled VARCHAR(500) DEFAULT NULL,
  course_enrolled VARCHAR(500) DEFAULT NULL,
  career_started VARCHAR(255) DEFAULT NULL,
  satisfaction_score INT DEFAULT NULL,
  feedback TEXT DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (roadmap_id) REFERENCES roadmaps(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ─── Session Logs ───────────────────────────────────
CREATE TABLE IF NOT EXISTS session_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT DEFAULT NULL,
  action VARCHAR(100) NOT NULL,
  page VARCHAR(255) DEFAULT NULL,
  metadata_json TEXT DEFAULT NULL,
  ip_address VARCHAR(45) DEFAULT NULL,
  user_agent VARCHAR(500) DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_action (user_id, action)
) ENGINE=InnoDB;
