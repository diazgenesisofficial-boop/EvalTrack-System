-- Student Curriculum Evaluation System Database Schema
-- Jose Maria College Foundation, Inc.

SET FOREIGN_KEY_CHECKS = 0;

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS evaltrack_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE evaltrack_db;

-- Drop legacy tables
DROP TABLE IF EXISTS grades;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS prerequisites;
DROP TABLE IF EXISTS subjects;

-- Drop existing tables to start fresh
DROP TABLE IF EXISTS student_grades;
DROP TABLE IF EXISTS student_enrollments;
DROP TABLE IF EXISTS course_offerings;
DROP TABLE IF EXISTS curriculum_courses;
DROP TABLE IF EXISTS curricula;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS programs;
DROP TABLE IF EXISTS users;

-- Users table (extended for curriculum system)
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'dean', 'registrar', 'instructor', 'student') NOT NULL,
    program VARCHAR(50),
    student_type ENUM('regular', 'irregular', 'transferee'),
    must_change_password BOOLEAN DEFAULT 0,
    status ENUM('Active', 'Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Programs table
CREATE TABLE programs (
    code VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    total_units INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Students table (extended from users)
CREATE TABLE students (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    program_code VARCHAR(50) NOT NULL,
    student_type ENUM('regular', 'irregular', 'transferee') NOT NULL,
    year_level INT DEFAULT 1,
    enrollment_status ENUM('active', 'inactive', 'graduated', 'dropped') DEFAULT 'active',
    date_admitted DATE,
    expected_graduation DATE,
    gpa DECIMAL(3,2) DEFAULT 0.00,
    total_units_earned INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (program_code) REFERENCES programs(code) ON DELETE RESTRICT
);

-- Courses table
CREATE TABLE courses (
    code VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    units DECIMAL(3,1) NOT NULL,
    course_type ENUM('GE', 'IT', 'IT Elect', 'NSTP', 'PE', 'SF', 'CAP', 'SP', 'SWT', 'PRAC') NOT NULL,
    lec_hours INT DEFAULT 0,
    lab_hours INT DEFAULT 0,
    prerequisites TEXT, -- JSON array of course codes
    corequisites TEXT, -- JSON array of course codes
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Curricula table
CREATE TABLE curricula (
    id INT AUTO_INCREMENT PRIMARY KEY,
    program_code VARCHAR(50) NOT NULL,
    curriculum_name VARCHAR(255) NOT NULL,
    description TEXT,
    effective_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    total_units INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (program_code) REFERENCES programs(code) ON DELETE CASCADE
);

-- Curriculum courses table (many-to-many relationship)
CREATE TABLE curriculum_courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    curriculum_id INT NOT NULL,
    course_code VARCHAR(50) NOT NULL,
    year_level INT NOT NULL,
    semester ENUM('1st', '2nd', 'Summer') NOT NULL,
    is_elective BOOLEAN DEFAULT FALSE,
    sequence_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (curriculum_id) REFERENCES curricula(id) ON DELETE CASCADE,
    FOREIGN KEY (course_code) REFERENCES courses(code) ON DELETE CASCADE,
    UNIQUE KEY unique_curriculum_course (curriculum_id, course_code, year_level, semester)
);

-- Course offerings table (for specific terms/semesters)
CREATE TABLE course_offerings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_code VARCHAR(50) NOT NULL,
    term VARCHAR(50) NOT NULL, -- e.g., "2024-2025 1st Sem"
    section VARCHAR(50),
    instructor_id VARCHAR(50),
    schedule TEXT, -- JSON format for schedule details
    room VARCHAR(50),
    max_capacity INT DEFAULT 30,
    current_enrolled INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_code) REFERENCES courses(code) ON DELETE CASCADE,
    FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Student enrollments table
CREATE TABLE student_enrollments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,
    course_offering_id INT NOT NULL,
    enrollment_date DATE NOT NULL,
    status ENUM('enrolled', 'dropped', 'completed', 'failed', 'withdrawn') DEFAULT 'enrolled',
    final_grade DECIMAL(4,2),
    grade_status ENUM('passed', 'failed', 'incomplete'),
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (course_offering_id) REFERENCES course_offerings(id) ON DELETE CASCADE
);

-- Student grades table (detailed grade tracking)
CREATE TABLE student_grades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,
    course_code VARCHAR(50) NOT NULL,
    term VARCHAR(50) NOT NULL,
    preliminary_grade DECIMAL(4,2),
    midterm_grade DECIMAL(4,2),
    final_grade DECIMAL(4,2),
    average_grade DECIMAL(4,2),
    grade_status ENUM('passed', 'failed', 'incomplete', 'dropped') NOT NULL,
    attendance_rate DECIMAL(5,2),
    date_completed DATE,
    instructor_id VARCHAR(50),
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (course_code) REFERENCES courses(code) ON DELETE CASCADE,
    FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Insert default programs
INSERT INTO programs (code, name, description, total_units) VALUES
('BSIT', 'Bachelor of Science in Information Technology', '4-year degree program focusing on IT fundamentals and applications', 156),
('BSEMC', 'Bachelor of Science in Entertainment and Multimedia Computing', '4-year degree program focusing on multimedia and entertainment technologies', 166);

-- Insert default admin user
INSERT INTO users (id, name, email, password, role) VALUES
('ADMIN001', 'System Administrator', 'admin@jmc.edu.ph', 'admin123', 'admin');

-- Insert courses based on the curriculum document
INSERT INTO courses (code, title, units, course_type, prerequisites) VALUES
-- First Year First Semester
('GE 10', 'Environmental Science', 3.0, 'GE', NULL),
('GE 11', 'The Entrepreneurial Mind', 3.0, 'GE', NULL),
('GE 4', 'Readings in the Philippine History', 3.0, 'GE', NULL),
('GE 5', 'The Contemporary World', 3.0, 'GE', NULL),
('GE 9', 'Life and Works of Rizal', 3.0, 'GE', NULL),
('IT 101', 'Introduction to Computing', 3.0, 'IT', NULL),
('IT 102', 'Computer Programming 1', 3.0, 'IT', NULL),
('NSTP 1', 'National Service Training Program I', 3.0, 'NSTP', NULL),
('PE 1', 'Physical Education 1', 2.0, 'PE', NULL),
('SF 1', 'Student Formation 1', 1.0, 'SF', NULL),

-- First Year Second Semester
('GE 1', 'Understanding the Self', 3.0, 'GE', NULL),
('GE 2', 'Mathematics in the Modern World', 3.0, 'GE', NULL),
('GE 3', 'Purposive Communication', 3.0, 'GE', NULL),
('IT 103', 'Computer Programming 2', 3.0, 'IT', 'IT 102'),
('IT 104', 'Introduction to Human Computer Interaction', 3.0, 'IT', 'IT 101'),
('IT 105', 'Discrete Mathematics 1', 3.0, 'IT', 'IT 102'),
('NSTP 2', 'National Service Training Program II', 3.0, 'NSTP', 'NSTP 1'),
('PE 2', 'Physical Education 2', 2.0, 'PE', 'PE 1'),
('SF 2', 'Student Formation 2', 1.0, 'SF', 'SF 1'),

-- Second Year First Semester
('GE 6', 'Art Appreciation', 3.0, 'GE', NULL),
('GE 7', 'Science, Technology and Society', 3.0, 'GE', NULL),
('GE 8', 'Ethics', 3.0, 'GE', NULL),
('IT 201', 'Data Structures and Algorithms', 3.0, 'IT', 'IT 103'),
('IT 202', 'Networking 1', 3.0, 'IT', 'IT 101'),
('IT Elect 1', 'Object Oriented Programming', 3.0, 'IT Elect', 'IT 103'),
('IT Elect 2', 'Platform Technologies', 3.0, 'IT Elect', 'IT 101'),
('PE 3', 'Physical Education 3', 2.0, 'PE', 'PE 2'),
('SF 3', 'Student Formation 3', 1.0, 'SF', 'SF 1'),

-- Second Year Second Semester
('IT 203', 'Information Management', 3.0, 'IT', NULL),
('IT 204', 'Quantitative Methods (Incl. Modeling & Simulation)', 3.0, 'IT', NULL),
('IT 205', 'Integrative Programming & Technologies', 3.0, 'IT', NULL),
('IT 206', 'Networking 2', 3.0, 'IT', 'IT 103'),
('IT 207', 'Multimedia', 3.0, 'IT', 'IT 101'),
('IT Elect 3', 'Web Systems and Technologies 1', 3.0, 'IT Elect', 'IT 103'),
('PE 4', 'Physical Education 4', 3.0, 'PE', 'IT 101'),
('SF 4', 'Student Formation 4', 1.0, 'SF', NULL),

-- Third Year First Semester
('GE 12', 'Reading Visual Art', 3.0, 'GE', NULL),
('IT 301', 'Advance Database Systems', 3.0, 'IT', 'IT 203'),
('IT 302', 'System Integration and Architecture', 3.0, 'IT', 'IT 203'),
('IT 303', 'Event-Driven Programming', 3.0, 'IT', 'IT 203'),
('IT 304', 'Information Assurance and Security 1', 3.0, 'IT', 'IT 205'),
('IT 305', 'Mobile Application Development', 3.0, 'IT', 'IT 206'),
('IT 306', 'Game Development', 3.0, 'IT', 'IT 205'),
('IT 307', 'Web Systems and Technologies 2', 3.0, 'IT', NULL),
('SF 5', 'Student Formation 5', 1.0, 'SF', 'SF 1'),

-- Third Year Second Semester
('IT 308', 'Information Assurance and Security 2', 3.0, 'IT', 'IT 304'),
('IT 309', 'Application Development and Emerging Technologies', 3.0, 'IT', 'IT 303'),
('IT 310', 'Data Science and Analytics', 3.0, 'IT', 'IT 301'),
('IT 311', 'Technopreneurship', 3.0, 'IT', NULL),
('IT 312', 'Embedded Systems', 3.0, 'IT', 'IT 303'),
('IT Elect 4', 'System Integration and Architecture 2', 3.0, 'IT Elect', 'IT 302'),
('SF 6', 'Student Formation 6', 1.0, 'SF', 'SF 1'),

-- Summer
('CAP 101', 'Capstone Project and Research 1', 3.0, 'CAP', NULL),
('SP 101', 'Social and Professional Issues', 3.0, 'SP', NULL),

-- Fourth Year First Semester
('CAP 102', 'Capstone Project and Research 2', 3.0, 'CAP', 'CAP 101'),
('IT 401', 'Systems Administration and Maintenance', 3.0, 'IT', 'IT 308'),
('SWT 101', 'ICT Seminar & Workshop', 3.0, 'SWT', NULL),

-- Fourth Year Second Semester
('PRAC 101', 'PRACTICUM (486 HOURS)', 6.0, 'PRAC', NULL);

-- Create BSIT Curriculum
INSERT INTO curricula (program_code, curriculum_name, description, effective_date, total_units) VALUES
('BSIT', 'BSIT Curriculum 2024', 'Current BSIT curriculum effective 2024', '2024-06-01', 156);

-- Get the curriculum ID for BSIT
SET @bsit_curriculum_id = LAST_INSERT_ID();

-- Insert curriculum courses for BSIT
INSERT INTO curriculum_courses (curriculum_id, course_code, year_level, semester, sequence_order) VALUES
-- First Year First Semester
(@bsit_curriculum_id, 'GE 10', 1, '1st', 1),
(@bsit_curriculum_id, 'GE 11', 1, '1st', 2),
(@bsit_curriculum_id, 'GE 4', 1, '1st', 3),
(@bsit_curriculum_id, 'GE 5', 1, '1st', 4),
(@bsit_curriculum_id, 'GE 9', 1, '1st', 5),
(@bsit_curriculum_id, 'IT 101', 1, '1st', 6),
(@bsit_curriculum_id, 'IT 102', 1, '1st', 7),
(@bsit_curriculum_id, 'NSTP 1', 1, '1st', 8),
(@bsit_curriculum_id, 'PE 1', 1, '1st', 9),
(@bsit_curriculum_id, 'SF 1', 1, '1st', 10),

-- First Year Second Semester
(@bsit_curriculum_id, 'GE 1', 1, '2nd', 1),
(@bsit_curriculum_id, 'GE 2', 1, '2nd', 2),
(@bsit_curriculum_id, 'GE 3', 1, '2nd', 3),
(@bsit_curriculum_id, 'IT 103', 1, '2nd', 4),
(@bsit_curriculum_id, 'IT 104', 1, '2nd', 5),
(@bsit_curriculum_id, 'IT 105', 1, '2nd', 6),
(@bsit_curriculum_id, 'NSTP 2', 1, '2nd', 7),
(@bsit_curriculum_id, 'PE 2', 1, '2nd', 8),
(@bsit_curriculum_id, 'SF 2', 1, '2nd', 9),

-- Second Year First Semester
(@bsit_curriculum_id, 'GE 6', 2, '1st', 1),
(@bsit_curriculum_id, 'GE 7', 2, '1st', 2),
(@bsit_curriculum_id, 'GE 8', 2, '1st', 3),
(@bsit_curriculum_id, 'IT 201', 2, '1st', 4),
(@bsit_curriculum_id, 'IT 202', 2, '1st', 5),
(@bsit_curriculum_id, 'IT Elect 1', 2, '1st', 6),
(@bsit_curriculum_id, 'IT Elect 2', 2, '1st', 7),
(@bsit_curriculum_id, 'PE 3', 2, '1st', 8),
(@bsit_curriculum_id, 'SF 3', 2, '1st', 9),

-- Second Year Second Semester
(@bsit_curriculum_id, 'IT 203', 2, '2nd', 1),
(@bsit_curriculum_id, 'IT 204', 2, '2nd', 2),
(@bsit_curriculum_id, 'IT 205', 2, '2nd', 3),
(@bsit_curriculum_id, 'IT 206', 2, '2nd', 4),
(@bsit_curriculum_id, 'IT 207', 2, '2nd', 5),
(@bsit_curriculum_id, 'IT Elect 3', 2, '2nd', 6),
(@bsit_curriculum_id, 'PE 4', 2, '2nd', 7),
(@bsit_curriculum_id, 'SF 4', 2, '2nd', 8),

-- Third Year First Semester
(@bsit_curriculum_id, 'GE 12', 3, '1st', 1),
(@bsit_curriculum_id, 'IT 301', 3, '1st', 2),
(@bsit_curriculum_id, 'IT 302', 3, '1st', 3),
(@bsit_curriculum_id, 'IT 303', 3, '1st', 4),
(@bsit_curriculum_id, 'IT 304', 3, '1st', 5),
(@bsit_curriculum_id, 'IT 305', 3, '1st', 6),
(@bsit_curriculum_id, 'IT 306', 3, '1st', 7),
(@bsit_curriculum_id, 'IT 307', 3, '1st', 8),
(@bsit_curriculum_id, 'SF 5', 3, '1st', 9),

-- Third Year Second Semester
(@bsit_curriculum_id, 'IT 308', 3, '2nd', 1),
(@bsit_curriculum_id, 'IT 309', 3, '2nd', 2),
(@bsit_curriculum_id, 'IT 310', 3, '2nd', 3),
(@bsit_curriculum_id, 'IT 311', 3, '2nd', 4),
(@bsit_curriculum_id, 'IT 312', 3, '2nd', 5),
(@bsit_curriculum_id, 'IT Elect 4', 3, '2nd', 6),
(@bsit_curriculum_id, 'SF 6', 3, '2nd', 7),

-- Summer (Third Year)
(@bsit_curriculum_id, 'CAP 101', 3, 'Summer', 1),
(@bsit_curriculum_id, 'SP 101', 3, 'Summer', 2),

-- Fourth Year First Semester
(@bsit_curriculum_id, 'CAP 102', 4, '1st', 1),
(@bsit_curriculum_id, 'IT 401', 4, '1st', 2),
(@bsit_curriculum_id, 'SWT 101', 4, '1st', 3),

-- Fourth Year Second Semester
(@bsit_curriculum_id, 'PRAC 101', 4, '2nd', 1);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_students_user_id ON students(user_id);
CREATE INDEX idx_students_program ON students(program_code);
CREATE INDEX idx_curriculum_courses_curriculum ON curriculum_courses(curriculum_id);
CREATE INDEX idx_curriculum_courses_course ON curriculum_courses(course_code);
CREATE INDEX idx_student_grades_student ON student_grades(student_id);
CREATE INDEX idx_student_grades_course ON student_grades(course_code);
CREATE INDEX idx_student_enrollments_student ON student_enrollments(student_id);
CREATE INDEX idx_course_offerings_course ON course_offerings(course_code);
CREATE INDEX idx_course_offerings_instructor ON course_offerings(instructor_id);
