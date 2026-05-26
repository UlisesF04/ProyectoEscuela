# Core Models

> Modelos Sequelize para las entidades fundacionales del sistema, con migraciones, asociaciones, repositorios y seed data.

## ADDED Requirements

### Requirement: User model
The system SHALL have a `User` model mapping to the `users` table with columns: id (SERIAL PK), email (VARCHAR 255 UNIQUE NOT NULL), password_hash (VARCHAR 255 NOT NULL), role (ENUM: admin, preceptor, docente, padre), first_name (VARCHAR 100 NOT NULL), last_name (VARCHAR 100 NOT NULL), phone_whatsapp (VARCHAR 20 NULLABLE), is_active (BOOLEAN DEFAULT true), created_at, updated_at.

#### Scenario: User model has correct columns
- **WHEN** inspecting the User model definition
- **THEN** it SHALL have all specified columns with correct types and constraints

#### Scenario: Email is unique
- **WHEN** creating a second user with the same email
- **THEN** Sequelize SHALL throw a UniqueConstraintError

### Requirement: Student model
The system SHALL have a `Student` model mapping to the `students` table with columns: id (SERIAL PK), first_name, last_name, dni (UNIQUE NULLABLE), birth_date (DATE NULLABLE), course_id (FK to courses NOT NULL), is_active (BOOLEAN DEFAULT true), created_at, updated_at.

#### Scenario: Student model has correct columns
- **WHEN** inspecting the Student model definition
- **THEN** it SHALL have all specified columns with correct types and constraints

### Requirement: Course model
The system SHALL have a `Course` model mapping to the `courses` table with columns: id (SERIAL PK), name (VARCHAR 100 NOT NULL), year (INTEGER NOT NULL), division (VARCHAR 10 NULLABLE), level (VARCHAR 50 NULLABLE), created_at.

#### Scenario: Course model has correct columns
- **WHEN** inspecting the Course model definition
- **THEN** it SHALL have all specified columns with correct types and constraints

### Requirement: Subject model
The system SHALL have a `Subject` model mapping to the `subjects` table with columns: id (SERIAL PK), name (VARCHAR 100 NOT NULL), course_id (FK to courses NOT NULL), created_at.

#### Scenario: Subject model has correct columns
- **WHEN** inspecting the Subject model definition
- **THEN** it SHALL have all specified columns with correct types and constraints

### Requirement: TeacherSubject model
The system SHALL have a `TeacherSubject` model mapping to the `teacher_subject` table with columns: id (SERIAL PK), user_id (FK to users NOT NULL), subject_id (FK to subjects NOT NULL), with UNIQUE constraint on (user_id, subject_id).

#### Scenario: TeacherSubject has unique constraint
- **WHEN** creating a second TeacherSubject with the same user_id and subject_id
- **THEN** Sequelize SHALL throw a UniqueConstraintError

### Requirement: ParentStudent model
The system SHALL have a `ParentStudent` model mapping to the `parent_student` table with columns: id (SERIAL PK), user_id (FK to users NOT NULL), student_id (FK to students NOT NULL), relationship (VARCHAR 50 NULLABLE), with UNIQUE constraint on (user_id, student_id).

#### Scenario: ParentStudent has unique constraint
- **WHEN** creating a second ParentStudent with the same user_id and student_id
- **THEN** Sequelize SHALL throw a UniqueConstraintError

### Requirement: Model associations
The models SHALL define all associations as specified in the data model: User hasMany TeacherSubject, Student belongsTo Course, Subject belongsTo Course, TeacherSubject belongsTo User and Subject, ParentStudent belongsTo User and Student.

#### Scenario: Associations are correctly defined
- **WHEN** calling the association methods on model instances
- **THEN** they SHALL return the associated data correctly

### Requirement: Migrations
The system SHALL have migration 001 creating the `users` table and migration 002 creating `courses`, `subjects`, `teacher_subject`, `students`, and `parent_student` tables.

#### Scenario: Migration 001 creates users table
- **WHEN** running `npx sequelize-cli db:migrate`
- **THEN** the `users` table SHALL exist with all specified columns

#### Scenario: Migration 002 creates remaining tables
- **WHEN** running migration 002
- **THEN** the `courses`, `subjects`, `teacher_subject`, `students`, and `parent_student` tables SHALL exist

### Requirement: Seed data
The system SHALL have a seeder that creates: 1 admin user, 1 preceptor user, 1 docente user, 1 padre user, 1 course, 2 subjects, 1 student, 1 teacher_subject assignment, and 1 parent_student link.

#### Scenario: Seed data loads without errors
- **WHEN** running `npx sequelize-cli db:seed:all`
- **THEN** all seed records SHALL be created without errors

### Requirement: Repositories
The system SHALL have repository wrappers: userRepository (findById, findByEmail, findAll, create, update), studentRepository (findById, findByCourseId, findAll, create, update), courseRepository (findById, findAll, create), subjectRepository (findById, findByCourseId, findAll, create).

#### Scenario: User repository findByEmail works
- **WHEN** calling userRepository.findByEmail with a valid email
- **THEN** it SHALL return the matching user object
