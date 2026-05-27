## ADDED Requirements

### Requirement: Register daily attendance
The system SHALL allow preceptors and administrators to register the daily attendance status for each student. The system MUST enforce exactly one attendance record per student per date (UNIQUE student_id + date constraint).

#### Scenario: Successful registration
- **WHEN** a preceptor sends POST /api/v1/attendances with valid `{ student_id, date, status }`
- **THEN** the system creates the record and returns HTTP 201 with the created attendance

#### Scenario: Duplicate registration rejected
- **WHEN** a preceptor sends POST /api/v1/attendances for a student+date that already has a record
- **THEN** the system returns HTTP 409 with message "Ya existe un registro para este alumno en esta fecha"

#### Scenario: Batch registration
- **WHEN** a preceptor sends POST /api/v1/attendances/batch with array of `{ student_id, date, status }` objects
- **THEN** the system creates all records and returns HTTP 201 with count of created records

#### Scenario: Invalid status value
- **WHEN** a preceptor sends POST /api/v1/attendances with status not in (presente, ausente, tarde)
- **THEN** the system returns HTTP 400 with validation error

### Requirement: Update attendance status
The system SHALL allow preceptors and administrators to update an existing attendance record's status.

#### Scenario: Successful update
- **WHEN** a preceptor sends PUT /api/v1/attendances/:id with `{ status: "presente" }`
- **THEN** the system updates the record and returns HTTP 200

#### Scenario: Non-existent record
- **WHEN** a preceptor sends PUT /api/v1/attendances/:id to a non-existent id
- **THEN** the system returns HTTP 404

### Requirement: Access control for attendance registration
The system SHALL restrict attendance registration to preceptors and administrators only.

#### Scenario: Docente cannot register attendance
- **WHEN** a docente sends POST /api/v1/attendances
- **THEN** the system returns HTTP 403

#### Scenario: Padre cannot register attendance
- **WHEN** a padre sends POST /api/v1/attendances
- **THEN** the system returns HTTP 403

#### Scenario: Unauthenticated request
- **WHEN** a request without JWT token is sent to POST /api/v1/attendances
- **THEN** the system returns HTTP 401
