# preceptor-views Specification

## Purpose
TBD - created by archiving change c-13-frontend-redesign. Update Purpose after archive.
## Requirements
### Requirement: PreceptorLayout with sidebar
The system SHALL render a layout at `/preceptor` with sidebar navigation items: "Registrar Asistencia", "Historial de Asistencias", "Justificaciones Pendientes". The `/preceptor` root SHALL redirect to `/preceptor/attendance/register`.

#### Scenario: Preceptor sidebar shows navigation
- **WHEN** preceptor navigates to `/preceptor`
- **THEN** the sidebar SHALL show 3 navigation items and redirect to `/preceptor/attendance/register`

### Requirement: AttendanceRegisterPage (`/preceptor/attendance/register`)
The system SHALL render an attendance registration page with course selector dropdown, date picker (default today), and AttendanceGrid showing students with 3-state toggle (Presente/Ausente/Tarde) with color coding (green/red/amber). A summary bar SHALL show totals and a "Guardar" button SHALL persist changes.

#### Scenario: Register page loads course students
- **WHEN** preceptor selects a course
- **THEN** the grid SHALL load students via `GET /api/v1/students?course_id=X` and existing attendance via `GET /api/v1/attendances?course_id=X&date=YYYY-MM-DD`

#### Scenario: Register page saves attendance
- **WHEN** preceptor clicks "Guardar" after toggling states
- **THEN** POST/PUT requests SHALL be sent for each changed row and a success toast SHALL appear

#### Scenario: Register page shows loading state
- **WHEN** course data is loading
- **THEN** the course selector SHALL be disabled with spinner and grid SHALL show skeleton rows

#### Scenario: Register page shows empty state
- **WHEN** selected course has no students
- **THEN** "Este curso no tiene alumnos registrados" SHALL display

### Requirement: AttendanceHistoryPage (`/preceptor/attendance/history`)
The system SHALL render an attendance history page with student selector (filtered by course), AttendanceSummary cards (Total días, Presentes, Ausentes, Tardes, Justificadas, % asistencia), and a DataTable with date, status badge, justified indicator, certificate link, and registered-by column.

#### Scenario: History page shows summary
- **WHEN** preceptor selects a student
- **THEN** the summary cards and table SHALL load via `GET /api/v1/students/:id/attendances`

#### Scenario: History page shows no selection state
- **WHEN** no student is selected yet
- **THEN** "Seleccione un alumno para ver su historial" SHALL display

### Requirement: PendingCertificatesPage (`/preceptor/justify`)
The system SHALL render a certificates page with two tabs: "Pendientes" (list of unjustified absences with certificate links and "Justificar" button) and "Historial de Justificadas" (DataTable). The justify action SHALL show an irreversible confirmation dialog.

#### Scenario: PendingCertificatesPage justifies absence
- **WHEN** preceptor clicks "Justificar" and confirms the irreversible dialog
- **THEN** `PUT /api/v1/attendances/:id/justify` is called and a success toast appears

#### Scenario: PendingCertificatesPage shows irreversible warning
- **WHEN** the justify confirmation dialog opens
- **THEN** it SHALL display "Esta acción es irreversible. ¿Está seguro?" with explicit wording based on RN-07

#### Scenario: PendingCertificatesPage empty state
- **WHEN** no pending certificates exist
- **THEN** "No hay certificados pendientes de revisión" SHALL display

