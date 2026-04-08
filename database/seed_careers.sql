-- =============================================
-- DestinAI — Career Seed Data
-- =============================================

USE destinai_db;

INSERT IGNORE INTO streams (name, slug, description, icon) VALUES
('Science', 'science', 'Science and technology stream including engineering, medicine, and research.', '🔬'),
('Commerce', 'commerce', 'Commerce and business stream including finance, accounting, and management.', '📊'),
('Arts', 'arts', 'Arts and humanities stream including design, media, and social sciences.', '🎨'),
('Vocational', 'vocational', 'Vocational and skill-based courses including technology, trades, and services.', '🛠️');

INSERT IGNORE INTO careers (title, slug, stream, category, description, average_salary_entry, average_salary_mid, average_salary_senior, growth_rate, demand_level, work_environment, icon) VALUES
('Software Engineer', 'software-engineer', 'science', 'Technology', 'Design, develop, and maintain software applications.', 600000, 1500000, 3500000, 15.0, 'high', 'hybrid', '💻'),
('Data Scientist', 'data-scientist', 'science', 'Technology', 'Analyze complex data to help organizations make better decisions.', 700000, 1800000, 4000000, 20.0, 'high', 'hybrid', '📊'),
('Doctor (MBBS)', 'doctor-mbbs', 'science', 'Healthcare', 'Diagnose and treat medical conditions in patients.', 500000, 1200000, 3000000, 8.0, 'high', 'office', '🩺'),
('Chartered Accountant', 'chartered-accountant', 'commerce', 'Finance', 'Manage financial records, auditing, and tax compliance.', 700000, 1500000, 3000000, 10.0, 'high', 'office', '📋'),
('UX Designer', 'ux-designer', 'arts', 'Design', 'Design user experiences for digital products.', 500000, 1200000, 2500000, 18.0, 'high', 'hybrid', '🎨'),
('Mechanical Engineer', 'mechanical-engineer', 'science', 'Engineering', 'Design and manufacture mechanical systems and machines.', 400000, 1000000, 2000000, 6.0, 'medium', 'field', '⚙️'),
('Business Analyst', 'business-analyst', 'commerce', 'Business', 'Analyze business processes and recommend improvements.', 500000, 1200000, 2500000, 12.0, 'high', 'office', '📈'),
('Graphic Designer', 'graphic-designer', 'arts', 'Design', 'Create visual content for print and digital media.', 300000, 800000, 1500000, 10.0, 'medium', 'hybrid', '🖌️'),
('Civil Engineer', 'civil-engineer', 'science', 'Engineering', 'Design and oversee construction of infrastructure projects.', 400000, 1000000, 2200000, 7.0, 'medium', 'field', '🏗️'),
('Product Manager', 'product-manager', 'commerce', 'Technology', 'Lead product development from ideation to launch.', 800000, 2000000, 4500000, 16.0, 'high', 'hybrid', '🚀'),
('Full Stack Developer', 'full-stack-developer', 'vocational', 'Technology', 'Build both frontend and backend of web applications.', 500000, 1400000, 3000000, 17.0, 'high', 'remote', '🌐'),
('Content Strategist', 'content-strategist', 'arts', 'Marketing', 'Plan and manage content across digital platforms.', 400000, 900000, 1800000, 12.0, 'medium', 'remote', '✍️'),
('Financial Analyst', 'financial-analyst', 'commerce', 'Finance', 'Analyze financial data and provide investment recommendations.', 600000, 1300000, 2800000, 11.0, 'high', 'office', '💹'),
('Research Scientist', 'research-scientist', 'science', 'Research', 'Conduct scientific research and experiments.', 500000, 1200000, 2500000, 9.0, 'medium', 'office', '🔬'),
('Cybersecurity Analyst', 'cybersecurity-analyst', 'science', 'Technology', 'Protect organizations from cyber threats and attacks.', 600000, 1500000, 3200000, 22.0, 'high', 'hybrid', '🛡️'),
('AI/ML Engineer', 'ai-ml-engineer', 'science', 'Technology', 'Build and deploy machine learning models and AI systems.', 800000, 2000000, 4500000, 25.0, 'high', 'hybrid', '🤖'),
('Digital Marketing Manager', 'digital-marketing-manager', 'commerce', 'Marketing', 'Plan and execute digital marketing campaigns across channels.', 400000, 1000000, 2200000, 14.0, 'high', 'hybrid', '📱'),
('Architect', 'architect', 'arts', 'Design', 'Design buildings and structures combining aesthetics with functionality.', 400000, 1100000, 2500000, 8.0, 'medium', 'hybrid', '🏛️'),
('Pharmacist', 'pharmacist', 'science', 'Healthcare', 'Dispense medications and advise patients on proper drug usage.', 350000, 800000, 1500000, 6.0, 'medium', 'office', '💊'),
('Cloud Solutions Architect', 'cloud-solutions-architect', 'science', 'Technology', 'Design and manage cloud infrastructure and services.', 900000, 2200000, 5000000, 24.0, 'high', 'remote', '☁️');

-- Career Scores
INSERT IGNORE INTO career_scores (career_id, automation_risk, future_proof_score, market_demand_score, skill_transferability) VALUES
(1, 25, 82, 95, 85), (2, 20, 88, 95, 80), (3, 15, 85, 90, 60),
(4, 45, 55, 80, 70), (5, 18, 85, 90, 80), (6, 50, 45, 60, 65),
(7, 35, 65, 85, 75), (8, 40, 55, 65, 70), (9, 55, 40, 60, 60),
(10, 15, 85, 90, 85), (11, 22, 80, 92, 85), (12, 30, 65, 70, 75),
(13, 40, 60, 80, 70), (14, 20, 75, 70, 65), (15, 12, 90, 95, 80),
(16, 10, 92, 95, 80), (17, 35, 70, 85, 75), (18, 30, 60, 65, 60),
(19, 45, 50, 65, 55), (20, 15, 90, 95, 85);
