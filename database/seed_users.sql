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
('parent@example.com', '$argon2id$v=19$m=65536,t=3,p=4$3xuDEOK8F8K4V2othTBmzA$xGK4tsMmyxSmWpQZUu7RAsJZEEb4Ehbd0/ifMGaM9co', 'Jane Doe', '9876543211', 'parent', TRUE, TRUE, 'en'),
('counsellor@example.com', '$argon2id$v=19$m=65536,t=3,p=4$3xuDEOK8F8K4V2othTBmzA$xGK4tsMmyxSmWpQZUu7RAsJZEEb4Ehbd0/ifMGaM9co', 'Dr. Smith', '9876543212', 'counsellor', TRUE, TRUE, 'en'),
('admin@example.com', '$argon2id$v=19$m=65536,t=3,p=4$3xuDEOK8F8K4V2othTBmzA$xGK4tsMmyxSmWpQZUu7RAsJZEEb4Ehbd0/ifMGaM9co', 'Admin User', '9876543213', 'admin', TRUE, TRUE, 'en'),
('student2@example.com', '$argon2id$v=19$m=65536,t=3,p=4$3xuDEOK8F8K4V2othTBmzA$xGK4tsMmyxSmWpQZUu7RAsJZEEb4Ehbd0/ifMGaM9co', 'Alice Johnson', '9876543214', 'student', TRUE, TRUE, 'en'),
('student3@example.com', '$argon2id$v=19$m=65536,t=3,p=4$3xuDEOK8F8K4V2othTBmzA$xGK4tsMmyxSmWpQZUu7RAsJZEEb4Ehbd0/ifMGaM9co', 'Bob Wilson', '9876543215', 'student', TRUE, TRUE, 'en');
