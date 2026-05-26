## 1. Models

- [x] 1.1 Create `backend/models/User.js` with all columns, validations, and indexes
- [x] 1.2 Create `backend/models/Course.js` with all columns
- [x] 1.3 Create `backend/models/Subject.js` with all columns
- [x] 1.4 Create `backend/models/TeacherSubject.js` with all columns and UNIQUE constraint
- [x] 1.5 Create `backend/models/Student.js` with all columns
- [x] 1.6 Create `backend/models/ParentStudent.js` with all columns and UNIQUE constraint
- [x] 1.7 Create `backend/models/index.js` with all associations centralized

## 2. Migrations

- [x] 2.1 Create migration 001: `users` table with all columns, ENUM role, indexes
- [x] 2.2 Create migration 002: `courses`, `subjects`, `teacher_subject`, `students`, `parent_student` tables with FKs and constraints
- [x] 2.3 Run migrations and verify all tables exist in the database

## 3. Repositories

- [x] 3.1 Create `backend/repositories/userRepository.js` (findById, findByEmail, findAll, create, update)
- [x] 3.2 Create `backend/repositories/studentRepository.js` (findById, findByCourseId, findAll, create, update)
- [x] 3.3 Create `backend/repositories/courseRepository.js` (findById, findAll, create)
- [x] 3.4 Create `backend/repositories/subjectRepository.js` (findById, findByCourseId, findAll, create)

## 4. Seed Data

- [x] 4.1 Create seeder with 1 admin, 1 preceptor, 1 docente, 1 padre (bcrypt-hashed passwords)
- [x] 4.2 Create seeder with 1 course, 2 subjects, 1 student, 1 teacher_subject, 1 parent_student
- [x] 4.3 Run seeders and verify data integrity

## 5. Verification

- [x] 5.1 Write and run tests for model creation and constraints
- [x] 5.2 Write and run tests for associations
- [x] 5.3 Write and run tests for repositories
- [x] 5.4 Write and run tests for seed data
