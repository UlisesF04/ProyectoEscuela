## ADDED Requirements

### Requirement: Justify absence with certificate
The system SHALL allow preceptors and administrators to mark an absence as justified. Once justified, the operation MUST be irreversible (RN-07).

#### Scenario: Successful justification
- **WHEN** a preceptor sends PUT /api/v1/attendances/:id/justify with `{ justification_note: "Certificado médico presentado" }`
- **THEN** the system sets `is_justified = true`, records the justification note, and returns HTTP 200

#### Scenario: Justification irreversible
- **WHEN** a preceptor sends PUT /api/v1/attendances/:id/justify to an already justified record
- **THEN** the system returns HTTP 409 with message "Esta inasistencia ya fue justificada"

#### Scenario: Justification of non-absence record
- **WHEN** a preceptor sends PUT /api/v1/attendances/:id/justify for a record with status "presente"
- **THEN** the system returns HTTP 400 with message "Solo se pueden justificar inasistencias"

### Requirement: Access control for justification
The system SHALL restrict justification operations to preceptors and administrators.

#### Scenario: Padre cannot justify
- **WHEN** a padre sends PUT /api/v1/attendances/:id/justify
- **THEN** the system returns HTTP 403
