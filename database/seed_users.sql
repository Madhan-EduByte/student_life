-- =============================================
-- DestinAI — User Seed Data
-- =============================================

USE destinai_db;

-- Password for all demo users: password123
INSERT IGNORE INTO users (
  email,
  password_hash,
  full_name,
  phone,
  role,
  is_active,
  is_verified,
  language
) VALUES
('student@example.com', '$argon2id$v=19$m=65536,t=3,p=4$3xuDEOK8F8K4V2othTBmzA$xGK4tsMmyxSmWpQZUu7RAsJZEEb4Ehbd0/ifMGaM9co', 'John Doe', '9876543210', 'student', TRUE, TRUE, 'en'),
('admin@example.com', '$argon2id$v=19$m=65536,t=3,p=4$3xuDEOK8F8K4V2othTBmzA$xGK4tsMmyxSmWpQZUu7RAsJZEEb4Ehbd0/ifMGaM9co', 'Admin User', '9876543213', 'admin', TRUE, TRUE, 'en'),
('student2@example.com', '$argon2id$v=19$m=65536,t=3,p=4$3xuDEOK8F8K4V2othTBmzA$xGK4tsMmyxSmWpQZUu7RAsJZEEb4Ehbd0/ifMGaM9co', 'Alice Johnson', '9876543214', 'student', TRUE, TRUE, 'en'),
('student3@example.com', '$argon2id$v=19$m=65536,t=3,p=4$3xuDEOK8F8K4V2othTBmzA$xGK4tsMmyxSmWpQZUu7RAsJZEEb4Ehbd0/ifMGaM9co', 'Bob Wilson', '9876543215', 'student', TRUE, TRUE, 'en');

-- Seed initial AI inputs for all demo students so Roadmap has data to display
INSERT IGNORE INTO student_profiles (
  user_id,
  interest_areas,
  strengths,
  preferred_stream,
  education_level,
  budget_range,
  location_preference,
  created_at,
  updated_at
) VALUES 
((SELECT id FROM users WHERE email='student@example.com'), 'technology, coding, logic', 'problem-solving, mathematics', 'science', '12th Grade', '1-5 Lakhs', 'Bangalore, India', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
((SELECT id FROM users WHERE email='student2@example.com'), 'business, marketing, finance', 'leadership, communication', 'commerce', '12th Grade', '5-10 Lakhs', 'Mumbai, India', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
((SELECT id FROM users WHERE email='student3@example.com'), 'art, design, psychology', 'creativity, empathy', 'arts', '12th Grade', '10-15 Lakhs', 'Delhi, India', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Seed active AI roadmaps for the demo students so their dashboards look complete immediately
INSERT IGNORE INTO roadmaps (id, user_id, title, summary, career_path, recommended_stream, confidence_score, future_proof_score, ai_model_used, version, is_active, created_at, updated_at) VALUES 
(1, (SELECT id FROM users WHERE email='student@example.com'), 'Your Path to Becoming a Software Engineer', 'Based on your interests in technology and problem-solving strengths, we recommend pursuing a career as a Software Engineer. This roadmap will guide you through the next 12 weeks.', 'Software Engineer', 'science', 85, 78, 'gemini', 1, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, (SELECT id FROM users WHERE email='student2@example.com'), 'Your Path to Becoming a Product Manager', 'Based on your leadership strengths and business interests, Product Management is highly recommended.', 'Product Manager', 'commerce', 90, 85, 'gemini', 1, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, (SELECT id FROM users WHERE email='student3@example.com'), 'Your Path to Becoming a UX Designer', 'Your empathy and creativity align perfectly with UX Design.', 'UX Designer', 'arts', 88, 80, 'gemini', 1, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Seed realistic milestones for John Doe's Software Engineering roadmap
INSERT IGNORE INTO milestones (roadmap_id, week_number, title, description, category, priority, estimated_hours, is_completed) VALUES
(1, 1, 'Week 1: Foundation — Learn HTML/CSS', 'Focus on mastering basic web layout and styling.', 'learning', 'high', 10, 1),
(1, 2, 'Week 2: Foundation — JavaScript Basics', 'Learn variables, loops, functions, and DOM manipulation.', 'learning', 'high', 12, 1),
(1, 3, 'Week 3: Foundation — Git & GitHub', 'Understand version control and collaborate on code.', 'learning', 'high', 8, 1),
(1, 4, 'Week 4: Foundation — Responsive Design', 'Make your websites look great on all devices.', 'learning', 'medium', 10, 0),
(1, 5, 'Week 5: Building — React.js Fundamentals', 'Component architecture, state, and props.', 'project', 'high', 15, 0),
(1, 6, 'Week 6: Building — State Management', 'Learn Context API and Zustand for complex state.', 'project', 'medium', 12, 0),
(1, 7, 'Week 7: Building — API Integration', 'Fetch data from REST APIs using fetch and Axios.', 'project', 'high', 10, 0),
(1, 8, 'Week 8: Building — Database Basics', 'Introduction to SQL and relational databases.', 'project', 'medium', 10, 0),
(1, 9, 'Week 9: Advanced — Full Project Build', 'Combine everything into a full-stack application.', 'project', 'high', 20, 0),
(1, 10, 'Week 10: Advanced — Testing & QA', 'Write unit tests and ensure code quality.', 'learning', 'medium', 8, 0),
(1, 11, 'Week 11: Advanced — Deployment', 'Deploy your application to Vercel and Heroku.', 'project', 'medium', 8, 0),
(1, 12, 'Week 12: Advanced — Portfolio & Resume', 'Finalize your portfolio and prepare for interviews.', 'networking', 'high', 10, 0);

-- Seed milestones for Alice Johnson (Product Manager)
INSERT IGNORE INTO milestones (roadmap_id, week_number, title, description, category, priority, estimated_hours, is_completed) VALUES
(2, 1, 'Week 1: Intro to Product Management', 'Learn the product lifecycle and agile methodologies.', 'learning', 'high', 10, 1),
(2, 2, 'Week 2: Market Research', 'Conduct user interviews and competitor analysis.', 'learning', 'high', 12, 0);

-- Seed milestones for Bob Wilson (UX Designer)
INSERT IGNORE INTO milestones (roadmap_id, week_number, title, description, category, priority, estimated_hours, is_completed) VALUES
(3, 1, 'Week 1: Design Thinking Principles', 'Understand empathy maps and user personas.', 'learning', 'high', 10, 1),
(3, 2, 'Week 2: Wireframing & Prototyping', 'Master Figma and create your first wireframes.', 'project', 'high', 15, 0);
