## ADDED Requirements

### Requirement: Query attendance history
The system SHALL allow preceptors, administrators, teachers, and parents to query attendance history for a student. Each role's access MUST be scoped according to their permissions (RN-03, RN-04, RN-06).

#### Scenario: Preceptor queries history
- **WHEN** a preceptor sends GET /api/v1/students/:id/attendances
- **THEN** the system returns all attendance records for that student with a summary of totals

#### Scenario: History includes summary
- **WHEN** a preceptor queries attendance history
- **THEN** the response includes `summary` object with `total_days`, `total_absences`, `justified_absences`, `unjustified_absences`

#### Scenario: Filter by date range
- **WHEN** a preceptor queries with `?from=2026-03-01&to=2026-03-31`
- **THEN** the system returns only records within that date range

#### Scenario: Filter by status
- **WHEN** a preceptor queries with `?status=ausente`
- **THEN** the system returns only records matching that status

### Requirement: Scoped access for teachers
The system SHALL allow teachers to view attendance history only for students enrolled in subjects they teach (RN-04).

#### Scenario: Teacher sees assigned students
- **WHEN** a docente queries GET /api/v1/students/:id/attendances for a student in their subject
- **THEN** the system returns the attendance history

#### Scenario: Teacher cannot see unassigned students
- **WHEN** a docente queries for a student NOT in any of their assigned subjects
- **THEN** the system returns HTTP 403

### Requirement: Scoped access for parents
The system SHALL allow parents to view attendance history only for their own children (RN-03).

#### Scenario: Parent sees child's history
- **WHEN** a padre queries GET /api/v1/students/:id/attendances for their linked child
- **THEN** the system returns the attendance history

#### Scenario: Parent cannot see other students
- **WHEN** a padre queries for a student NOT linked to them
- **THEN** the system returns HTTP 403
