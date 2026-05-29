# Spec: frontend-docente-views

## Overview
Separación del monolito `DocenteDashboard.jsx` en 5 páginas independientes por ruta más layout base con sidebar naranja cálido. Incluye calificaciones, tareas, entregas, licencias y perfil.

## ADDED Requirements

### Requirement: DocenteLayout with sidebar
The system SHALL render a layout at `/docente` with sidebar navigation: "Calificaciones", "Tareas", "Mis Licencias", "Mi Perfil". The `/docente` root SHALL redirect to `/docente/grades`.

#### Scenario: Docente sidebar shows navigation
- **WHEN** docente navigates to `/docente`
- **THEN** the sidebar SHALL show 4 navigation items and redirect to `/docente/grades`

### Requirement: GradesPage (`/docente/grades`)
The system SHALL render a grades page with subject selector (loaded from teacher_subject assignments), period selector (1er/2do/3er Trimestre, Recuperatorio), type selector (Examen/Trabajo/Tarea/Oral/Otro), and a GradesTable with student name + live input (0-10, step 0.01) + save button per row. A "Guardar todas" batch button SHALL be available.

#### Scenario: GradesPage loads teacher subjects
- **WHEN** docente navigates to `/docente/grades`
- **THEN** the subject selector SHALL load the teacher's assigned subjects via `GET /api/v1/teacher-subjects`

#### Scenario: GradesPage saves individual grade
- **WHEN** docente enters a grade and clicks the row save icon
- **THEN** POST/PUT `/api/v1/grades` is called and a checkmark icon SHALL appear

#### Scenario: GradesPage validates range
- **WHEN** docente enters a value outside 0-10
- **THEN** the input SHALL show a red border and prevent saving

#### Scenario: GradesPage empty state - no subjects
- **WHEN** docente has no subjects assigned
- **THEN** "No tiene materias asignadas. Contacte al administrador" SHALL display

### Requirement: TasksPage (`/docente/tasks`)
The system SHALL render a tasks page with subject filter, "Nueva Tarea" button, and TaskList (cards or table) showing title, subject badge, due date (color coded: green ≥7d, yellow ≤7d, red overdue), submission counter (e.g. "12 de 15 entregadas"), and actions (Ver entregas, Editar, Eliminar).

#### Scenario: TasksPage loads tasks
- **WHEN** docente navigates to `/docente/tasks`
- **THEN** tasks SHALL load via `GET /api/v1/subjects/:id/tasks` based on selected subject filter

#### Scenario: TasksPage creates new task
- **WHEN** docente clicks "Nueva Tarea" and submits the modal form
- **THEN** `POST /api/v1/tasks` is called with title, description, subject_id, and due_date

### Requirement: TaskSubmissionsPage (`/docente/tasks/:taskId/submissions`)
The system SHALL render a submissions page with task header (title, subject, due date, course) and a SubmissionTable showing each student with current status badge (Pendiente/red, Entregada/green, Tarde/orange) and a unidirectional state selector (Pendiente→Entregada/Tarde only, RN-15).

#### Scenario: TaskSubmissionsPage loads submissions
- **WHEN** docente navigates to `/docente/tasks/:taskId/submissions`
- **THEN** submissions SHALL load via `GET /api/v1/tasks/:id/submissions`

#### Scenario: TaskSubmissionsPage enforces unidirectional state
- **WHEN** docente tries to revert Entregada back to Pendiente
- **THEN** the system SHALL show an error toast "No se puede revertir el estado de entrega"

### Requirement: MyLeavesPage (`/docente/leaves`)
The system SHALL render a leaves page with a "Solicitar Licencia" card (tipo select, fecha inicio/fin, notas textarea, auto-calculated days, "Solicitar" button) and a DataTable history (Fechas, Tipo, Días, Estado badge). A summary "Días solicitados este año: X" SHALL display.

#### Scenario: MyLeavesPage submits leave
- **WHEN** docente fills the form and clicks "Solicitar"
- **THEN** `POST /api/v1/teacher-leaves` is called and a success toast appears

#### Scenario: MyLeavesPage validates dates
- **WHEN** end_date < start_date
- **THEN** an error "La fecha de fin debe ser posterior a la de inicio" SHALL display

### Requirement: ProfileSection (`/docente/profile`)
The system SHALL render a profile page showing docente data: Nombre, Apellido, Email, Rol, Teléfono, Materias asignadas. Data comes from `GET /api/v1/auth/me` and teacher-subjects endpoints.

#### Scenario: ProfileSection loads
- **WHEN** docente navigates to `/docente/profile`
- **THEN** profile data SHALL load and display in a card layout
