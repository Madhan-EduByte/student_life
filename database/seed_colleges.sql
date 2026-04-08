-- =============================================
-- DestinAI — College Seed Data (Sample: 20 colleges)
-- =============================================

USE destinai_db;

INSERT IGNORE INTO colleges (name, slug, university, type, city, state, country, established_year, accreditation, nirf_rank, placement_rate, average_package, highest_package, fee_range_min, fee_range_max) VALUES
('Indian Institute of Technology Bombay', 'iit-bombay', 'IIT Bombay', 'government', 'Mumbai', 'Maharashtra', 'India', 1958, 'NAAC A++', 3, 95.0, 18.0, 80.0, 200000, 250000),
('Indian Institute of Technology Delhi', 'iit-delhi', 'IIT Delhi', 'government', 'New Delhi', 'Delhi', 'India', 1961, 'NAAC A++', 2, 96.0, 20.0, 90.0, 200000, 250000),
('Indian Institute of Science', 'iisc-bangalore', 'IISc', 'government', 'Bangalore', 'Karnataka', 'India', 1909, 'NAAC A++', 1, 90.0, 15.0, 60.0, 100000, 200000),
('IIT Madras', 'iit-madras', 'IIT Madras', 'government', 'Chennai', 'Tamil Nadu', 'India', 1959, 'NAAC A++', 4, 94.0, 17.5, 75.0, 200000, 250000),
('IIT Kanpur', 'iit-kanpur', 'IIT Kanpur', 'government', 'Kanpur', 'Uttar Pradesh', 'India', 1959, 'NAAC A++', 5, 93.0, 16.0, 70.0, 200000, 250000),
('BITS Pilani', 'bits-pilani', 'BITS', 'deemed', 'Pilani', 'Rajasthan', 'India', 1964, 'NAAC A', 25, 92.0, 14.0, 65.0, 400000, 500000),
('NIT Karnataka Surathkal', 'nitk-surathkal', 'NIT Karnataka', 'government', 'Mangalore', 'Karnataka', 'India', 1960, 'NAAC A+', 12, 88.0, 12.0, 45.0, 150000, 200000),
('VIT Vellore', 'vit-vellore', 'VIT University', 'deemed', 'Vellore', 'Tamil Nadu', 'India', 1984, 'NAAC A++', 15, 85.0, 10.0, 40.0, 300000, 400000),
('SRM Institute of Science and Technology', 'srm-chennai', 'SRM University', 'deemed', 'Chennai', 'Tamil Nadu', 'India', 1985, 'NAAC A++', 30, 82.0, 8.0, 35.0, 250000, 400000),
('Christ University', 'christ-bangalore', 'Christ University', 'deemed', 'Bangalore', 'Karnataka', 'India', 1969, 'NAAC A+', 50, 75.0, 6.0, 20.0, 100000, 300000),
('Manipal Institute of Technology', 'mit-manipal', 'MAHE', 'deemed', 'Manipal', 'Karnataka', 'India', 1957, 'NAAC A++', 20, 88.0, 11.0, 42.0, 350000, 500000),
('NIT Trichy', 'nit-trichy', 'NIT Trichy', 'government', 'Tiruchirappalli', 'Tamil Nadu', 'India', 1964, 'NAAC A+', 10, 90.0, 13.0, 50.0, 150000, 200000),
('Delhi University', 'delhi-university', 'Delhi University', 'government', 'New Delhi', 'Delhi', 'India', 1922, 'NAAC A+', 18, 78.0, 7.0, 25.0, 50000, 150000),
('Amity University', 'amity-noida', 'Amity University', 'private', 'Noida', 'Uttar Pradesh', 'India', 2005, 'NAAC A', 60, 72.0, 5.5, 18.0, 200000, 400000),
('Symbiosis International', 'symbiosis-pune', 'Symbiosis', 'deemed', 'Pune', 'Maharashtra', 'India', 1971, 'NAAC A+', 35, 80.0, 9.0, 30.0, 200000, 350000),
('PES University', 'pes-bangalore', 'PES University', 'deemed', 'Bangalore', 'Karnataka', 'India', 1972, 'NAAC A', 40, 82.0, 8.5, 32.0, 250000, 400000),
('RV College of Engineering', 'rvce-bangalore', 'VTU', 'private', 'Bangalore', 'Karnataka', 'India', 1963, 'NAAC A+', 45, 85.0, 9.5, 38.0, 200000, 300000),
('BMS College of Engineering', 'bmsce-bangalore', 'VTU', 'private', 'Bangalore', 'Karnataka', 'India', 1946, 'NAAC A', 55, 80.0, 7.5, 28.0, 150000, 250000),
('Jadavpur University', 'jadavpur-kolkata', 'Jadavpur University', 'government', 'Kolkata', 'West Bengal', 'India', 1955, 'NAAC A', 22, 86.0, 8.0, 35.0, 50000, 100000),
('APS College of Arts and Science', 'aps-college', 'Bangalore University', 'private', 'Bangalore', 'Karnataka', 'India', 1995, 'NAAC B+', NULL, 70.0, 4.0, 12.0, 50000, 100000);

-- Sample courses for first few colleges
INSERT IGNORE INTO college_courses (college_id, course_name, degree_type, duration_years, stream, annual_fee) VALUES
(1, 'B.Tech Computer Science', 'UG', 4, 'science', 220000),
(1, 'B.Tech Electrical Engineering', 'UG', 4, 'science', 220000),
(1, 'M.Tech AI & ML', 'PG', 2, 'science', 220000),
(2, 'B.Tech Computer Science', 'UG', 4, 'science', 225000),
(2, 'B.Tech Mechanical Engineering', 'UG', 4, 'science', 225000),
(3, 'B.Sc Research', 'UG', 4, 'science', 150000),
(3, 'M.Tech Computer Science', 'PG', 2, 'science', 180000),
(6, 'B.E. Computer Science', 'UG', 4, 'science', 450000),
(6, 'B.E. Electronics', 'UG', 4, 'science', 450000),
(8, 'B.Tech Computer Science', 'UG', 4, 'science', 350000),
(8, 'BCA', 'UG', 3, 'science', 200000),
(8, 'B.Com', 'UG', 3, 'commerce', 150000),
(10, 'BCA', 'UG', 3, 'science', 150000),
(10, 'BBA', 'UG', 3, 'commerce', 120000),
(10, 'B.A. Psychology', 'UG', 3, 'arts', 100000),
(20, 'BCA', 'UG', 3, 'science', 75000),
(20, 'B.Com', 'UG', 3, 'commerce', 60000),
(20, 'BBA', 'UG', 3, 'commerce', 70000);

-- College scores
INSERT IGNORE INTO college_scores (college_id, academic_score, placement_score, overall_score) VALUES
(1, 95, 95, 95), (2, 96, 96, 96), (3, 97, 90, 94),
(4, 94, 94, 94), (5, 93, 93, 93), (6, 88, 92, 90),
(7, 85, 88, 86), (8, 82, 85, 83), (9, 78, 82, 80),
(10, 75, 75, 75), (11, 86, 88, 87), (12, 88, 90, 89),
(13, 80, 78, 79), (14, 70, 72, 71), (15, 78, 80, 79),
(16, 80, 82, 81), (17, 82, 85, 83), (18, 78, 80, 79),
(19, 84, 86, 85), (20, 65, 70, 67);
