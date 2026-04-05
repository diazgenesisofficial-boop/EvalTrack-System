USE evaltrack_db;
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE courses;
SET FOREIGN_KEY_CHECKS = 1;
INSERT INTO courses (code, title, units, course_type, prerequisites) VALUES 
('GE 10', 'Environmental Science', 3.0, 'GE', '-'),
('GE 11', 'The Entrepreneurial Mind', 3.0, 'GE', '-'),
('GE 4', 'Readings in Philippine History', 3.0, 'GE', '-'),
('GE 5', 'The Contemporary World', 3.0, 'GE', '-'),
('GE 9', 'Life and Works of Rizal', 3.0, 'GE', '-'),
('IT 101', 'Introduction to Computing', 3.0, 'IT', '-'),
('IT 102', 'Computer Programming 1', 3.0, 'IT', '-'),
('NSTP 1', 'National Service Training Program I', 3.0, 'NSTP', '-'),
('PE 1', 'Physical Education 1', 2.0, 'PE', '-'),
('SF 1', 'Student Formation 1', 1.0, 'SF', '-'),

('GE 1', 'Understanding the Self', 3.0, 'GE', '-'),
('GE 2', 'Mathematics in the Modern World', 3.0, 'GE', '-'),
('GE 3', 'Purposive Communication', 3.0, 'GE', '-'),
('IT 103', 'Computer Programming 2', 3.0, 'IT', 'IT 102'),
('IT 104', 'Introduction to Human Computer Interaction', 3.0, 'IT', 'IT 101'),
('IT 105', 'Discrete Mathematics 1', 3.0, 'IT', 'IT 102'),
('NSTP 2', 'National Service Training Program II', 3.0, 'NSTP', 'NSTP 1'),
('PE 2', 'Physical Education 2', 2.0, 'PE', 'PE 1'),
('SF 2', 'Student Formation 2', 1.0, 'SF', 'SF 1'),

('GE 6', 'Art Appreciation', 3.0, 'GE', '-'),
('GE 7', 'Science, Technology and Society', 3.0, 'GE', '-'),
('GE 8', 'Ethics', 3.0, 'GE', '-'),
('IT 201', 'Data Structures and Algorithms', 3.0, 'IT', 'IT 103'),
('IT 202', 'Networking 1', 3.0, 'IT', 'IT 101'),
('IT Elect 1', 'Object-Oriented Programming', 3.0, 'IT Elect', 'IT 103'),
('IT Elect 2', 'Platform Technologies', 3.0, 'IT Elect', 'IT 101'),
('PE 3', 'Physical Education 3', 2.0, 'PE', 'PE 2'),
('SF 3', 'Student Formation 3', 1.0, 'SF', 'SF 1'),

('IT 203', 'Information Management', 3.0, 'IT', '-'),
('IT 204', 'Quantitative Methods (Modeling & Simulation)', 3.0, 'IT', '-'),
('IT 205', 'Integrative Programming & Technologies', 3.0, 'IT', '-'),
('IT 206', 'Networking 2', 3.0, 'IT', 'IT 103'),
('IT 207', 'Multimedia', 3.0, 'IT', 'IT 101'),
('IT Elect 3', 'Web Systems and Technologies 1', 3.0, 'IT Elect', 'IT 103'),
('PE 4', 'Physical Education 4', 3.0, 'PE', 'IT 101'),
('SF 4', 'Student Formation 4', 1.0, 'SF', '-'),

('GE 12', 'Reading Visual Art', 3.0, 'GE', '-'),
('IT 301', 'Advanced Database Systems', 3.0, 'IT', 'IT 203'),
('IT 302', 'System Integration and Architecture', 3.0, 'IT', 'IT 203'),
('IT 303', 'Event-Driven Programming', 3.0, 'IT', 'IT 203'),
('IT 304', 'Information Assurance and Security 1', 3.0, 'IT', 'IT 205'),
('IT 305', 'Mobile Application Development', 3.0, 'IT', 'IT 206'),
('IT 306', 'Game Development', 3.0, 'IT', 'IT 205'),
('IT 307', 'Web Systems and Technologies 2', 3.0, 'IT', '-'),
('SF 5', 'Student Formation 5', 1.0, 'SF', 'SF 1'),

('IT 308', 'Information Assurance and Security 2', 3.0, 'IT', 'IT 304'),
('IT 309', 'Application Development & Emerging Technologies', 3.0, 'IT', 'IT 303'),
('IT 310', 'Data Science and Analytics', 3.0, 'IT', 'IT 301'),
('IT 311', 'Technopreneurship', 3.0, 'IT', '-'),
('IT 312', 'Embedded Systems', 3.0, 'IT', 'IT 303'),
('IT Elect 4', 'System Integration and Architecture 2', 3.0, 'IT Elect', 'IT 302'),
('SF 6', 'Student Formation 6', 1.0, 'SF', 'SF 1'),

('CAP 101', 'Capstone Project & Research 1', 3.0, 'CAP', 'Third Year Standing'),
('SP 101', 'Social and Professional Issues', 3.0, 'SP', 'Third Year Standing'),

('CAP 102', 'Capstone Project & Research 2', 3.0, 'CAP', 'CAP 101'),
('IT 401', 'Systems Administration and Maintenance', 3.0, 'IT', 'IT 308'),
('SWT 101', 'ICT Seminar & Workshop', 3.0, 'SWT', '-'),

('PRAC 101', 'Practicum (486 Hours)', 6.0, 'PRAC', 'CAP 101, IT 308');
