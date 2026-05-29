# admin-views Specification

## Purpose
TBD - created by archiving change c-13-frontend-redesign. Update Purpose after archive.
## Requirements
### Requirement: AdminDashboardOverview page (`/admin`)
The system SHALL render a summary page at `/admin` with 5 summary cards in a responsive grid (2x2 desktop, 1 col mobile): Total Active Users (with +12% indicator), Active Courses (stable indicator), Registered Students (with +5% trend), Pending Leaves (with "Action Needed" badge), Notifications Sent Today. Each card SHALL use Chakra `Stat` component with warm shadow.

#### Scenario: Overview loads summary data
- **WHEN** admin navigates to `/admin`
- **THEN** the page SHALL fetch `GET /api/v1/users?is_active=true`, `GET /api/v1/courses`, `GET /api/v1/students`, `GET /api/v1/teacher-leaves?status=pending` and render summary cards

#### Scenario: Overview shows loading state
- **WHEN** data is being fetched
- **THEN** each card SHALL show a Chakra `Skeleton` placeholder

#### Scenario: Overview shows empty state
- **WHEN** all counts are zero
- **THEN** cards SHALL display "0" with subtitle "Aún no hay datos cargados"

### Requirement: AdminUsersPage (`/admin/users`)
The system SHALL render a users CRUD page with DataTable (columns: Estado/Badge, Nombre, Email, Rol/Badge, Teléfono, Acciones), search by email/nombre, filter by rol, Create User modal, Edit User modal, and AlertDialog for deactivate/delete.

#### Scenario: UsersPage lists users
- **WHEN** admin navigates to `/admin/users`
- **THEN** the DataTable SHALL display all users with role badges (Admin=red, Preceptor=orange, Docente=blue, Padre=green)

#### Scenario: UsersPage shows empty state
- **WHEN** no users exist
- **THEN** DataTable SHALL show EmptyState with "No hay usuarios registrados. Cree el primer usuario."

### Requirement: AdminCoursesPage (`/admin/courses`)
The system SHALL render a courses page with DataTable (Nombre, Año, División, Nivel, Acciones), Create/Edit modal, and expandable "Ver Materias" sub-modal for adding/removing subjects per course.

#### Scenario: CoursesPage shows subjects modal
- **WHEN** admin clicks "Ver Materias" on a course row
- **THEN** a modal SHALL open showing the course subjects list with add/remove controls

### Requirement: AdminStudentsPage (`/admin/students`)
The system SHALL render a students page with DataTable (Estado, Nombre, DNI, Curso, Acciones), filters by curso and estado, and "Ver Padres" modal for parent linking. It SHALL support soft-delete lifecycle: active→inactive→permanent delete.

#### Scenario: StudentsPage filters by course
- **WHEN** admin selects a curso in the filter
- **THEN** the DataTable SHALL show only students belonging to that course

### Requirement: AdminTeacherAssignmentsPage (`/admin/assignments`)
The system SHALL render a teacher assignments page with teacher list and "Ver Materias" modal that shows current subjects (with remove button) and assignment form (Select curso → Select materia → Assign button).

#### Scenario: AssignmentsPage shows teacher subjects
- **WHEN** admin clicks "Ver Materias" on a teacher row
- **THEN** the modal SHALL show current subjects and the assignment form

### Requirement: AdminParentLinksPage (`/admin/links`)
The system SHALL render a parent links page with students DataTable and "Ver Padres" modal for linking/unlinking parents with relation type (Madre/Padre/Tutor).

#### Scenario: ParentLinksPage links parent
- **WHEN** admin selects a padre from dropdown and clicks "Vincular"
- **THEN** POST `/api/v1/students/:id/parents` is called and the parent appears in the linked list

### Requirement: AdminLeavesPage (`/admin/leaves`)
The system SHALL render a leaves approval page with two tabs: "Pendientes" (cards with Aprobar/Rechazar buttons) and "Historial" (DataTable with filters by estado, fechas, docente).

#### Scenario: LeavesPage approves leave
- **WHEN** admin clicks "Aprobar" on a pending leave card
- **THEN** a confirmation dialog opens and on confirm PUT `/api/v1/teacher-leaves/:id/status` is called

### Requirement: AdminNotificationLogsPage (`/admin/notifications`)
The system SHALL render a notification logs page with DataTable (Fecha, Destinatario, Alumno, Tipo Alerta, Canal, Estado/Badge) and filters by alert type, status, and date range.

#### Scenario: NotificationLogsPage loads logs
- **WHEN** admin navigates to `/admin/notifications`
- **THEN** the DataTable SHALL fetch and display notification logs with "Enviado" (green) or "Fallido" (red) badges

### Requirement: AdminConfigurationPage (`/admin/config`)
The system SHALL render a configuration page with cards for "Umbral de Ausencias Críticas" (input numérico, default 10), "Horario de Notificaciones" (time input, default 18:00), and "Alertas habilitadas" (toggles per alert type).

#### Scenario: ConfigurationPage saves threshold
- **WHEN** admin changes the threshold value and clicks "Guardar"
- **THEN** a success toast SHALL appear confirming the change

