# padre-views Specification

## Purpose
TBD - created by archiving change c-13-frontend-redesign. Update Purpose after archive.
## Requirements
### Requirement: PadreLayout with sidebar
The system SHALL render a layout at `/padre` with sidebar navigation: "Calificaciones", "Asistencias", "Tareas", "Subir Certificado". The `/padre` root SHALL redirect to `/padre/grades`.

#### Scenario: Padre sidebar shows navigation
- **WHEN** padre navigates to `/padre`
- **THEN** the sidebar SHALL show 4 navigation items and redirect to `/padre/grades`

### Requirement: ChildGradesPage (`/padre/grades`)
The system SHALL render a read-only grades page with ChildSelector (if multiple children), period selector, and GradesTable showing Materia, Nota (color: green ≥7, yellow 4-6, red <4), Tipo, Descripción, Fecha. Promedio general por materia and visual alert if any grade <4 SHALL display.

#### Scenario: ChildGradesPage loads grades
- **WHEN** padre selects a child and period
- **THEN** grades SHALL load via `GET /api/v1/students/:id/grades`

#### Scenario: ChildGradesPage shows low grade alert
- **WHEN** any grade is below 4
- **THEN** a red indicator SHALL appear next to that grade and an alert banner SHALL display

#### Scenario: ChildGradesPage empty state
- **WHEN** no grades exist for the selected period
- **THEN** "No hay calificaciones registradas para este período" SHALL display

### Requirement: ChildAttendancesPage (`/padre/attendances`)
The system SHALL render a read-only attendances page with ChildSelector, AttendanceSummary cards, attendance table (Fecha, Estado badge, ¿Justificada?, Certificado link), and a red alert banner if attendance % is below configured threshold.

#### Scenario: ChildAttendancesPage loads attendances
- **WHEN** padre selects a child
- **THEN** attendance data SHALL load via `GET /api/v1/students/:id/attendances`

#### Scenario: ChildAttendancesPage shows critical alert
- **WHEN** attendance percentage is below threshold (default 80%)
- **THEN** a red banner SHALL display "Asistencia por debajo del umbral crítico"

### Requirement: ChildTasksPage (`/padre/tasks`)
The system SHALL render a read-only tasks page with ChildSelector, status filter (Todas/Pendientes/Entregadas/Tarde), and TaskList showing Materia badge, Título, Fecha de vencimiento (color coded), Estado badge, and urgency indicator if due ≤ 2 days.

#### Scenario: ChildTasksPage loads tasks
- **WHEN** padre selects a child
- **THEN** tasks SHALL load via `GET /api/v1/students/:id/tasks`

#### Scenario: ChildTasksPage shows urgency indicator
- **WHEN** a task is due within 2 days
- **THEN** it SHALL display a "Urgente" badge or icon

### Requirement: UploadCertificatePage (`/padre/upload-certificate`)
The system SHALL render a certificate upload page with ChildSelector, absence selector (dropdown of unjustified absences), drag-and-drop dropzone (JPG/PNG/PDF, ≤5MB) with preview, and upload button with progress bar.

#### Scenario: UploadCertificatePage loads absences
- **WHEN** padre selects a child
- **THEN** unjustified absences SHALL load via `GET /api/v1/students/:id/attendances?status=ausente&justified=false`

#### Scenario: UploadCertificatePage uploads file
- **WHEN** padre drops a valid file and clicks "Subir"
- **THEN** `POST /api/v1/certificates/upload` is called with progress tracking and success toast appears

#### Scenario: UploadCertificatePage validates file type
- **WHEN** padre drops a file that is not JPG/PNG/PDF
- **THEN** an error "Formato no válido. Solo JPG, PNG o PDF." SHALL display

#### Scenario: UploadCertificatePage no absences
- **WHEN** the child has no unjustified absences
- **THEN** "No hay inasistencias no justificadas para este alumno" SHALL display

