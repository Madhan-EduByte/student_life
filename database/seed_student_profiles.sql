-- =============================================
-- DestinAI — Student Profile Seed Data
-- =============================================

USE destinai_db;

INSERT IGNORE INTO student_profiles (
  user_id,
  education_level,
  preferred_stream,
  budget_range,
  location_preference
)
SELECT id, '12th Grade', 'science', '500000-1000000', 'India'
FROM users
WHERE email = 'student@example.com';

INSERT IGNORE INTO student_profiles (
  user_id,
  education_level,
  preferred_stream,
  budget_range,
  location_preference
)
SELECT id, '12th Grade', 'science', '500000-1000000', 'India'
FROM users
WHERE email = 'student2@example.com';

INSERT IGNORE INTO student_profiles (
  user_id,
  education_level,
  preferred_stream,
  budget_range,
  location_preference
)
SELECT id, '12th Grade', 'science', '500000-1000000', 'India'
FROM users
WHERE email = 'student3@example.com';
