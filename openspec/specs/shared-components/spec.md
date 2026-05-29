# shared-components Specification

## Purpose
TBD - created by archiving change c-13-frontend-redesign. Update Purpose after archive.
## Requirements
### Requirement: EmptyState component
The system SHALL provide an `<EmptyState>` component accepting `icon`, `title`, `description`, and optional `action` (ReactNode button). It SHALL render a centered layout with large icon, heading, description text, and optional action button.

#### Scenario: EmptyState renders with icon and message
- **WHEN** `<EmptyState icon={FiInbox} title="Sin datos" description="No hay registros" />` renders
- **THEN** it SHALL show the inbox icon, "Sin datos" heading, and "No hay registros" description

#### Scenario: EmptyState renders with action button
- **WHEN** `<EmptyState action={<Button>Crear</Button>} />` renders
- **THEN** a "Crear" button SHALL be visible below the description

### Requirement: LoadingSkeleton with variants
The system SHALL provide a `<LoadingSkeleton>` component with `variant` prop supporting `"table"`, `"card"`, and `"text"`. Each variant SHALL render Chakra `Skeleton` components in the appropriate layout.

#### Scenario: LoadingSkeleton variant table
- **WHEN** `<LoadingSkeleton variant="table" rows={3} />` renders
- **THEN** it SHALL render 3 rows of skeleton columns mimicking a table

### Requirement: ErrorBoundary component
The system SHALL provide an `<ErrorBoundary>` component using React error boundary pattern (componentDidCatch). It SHALL catch render errors and display a fallback UI with "Algo salió mal" message, "Reintentar" button, and "Volver al inicio" button.

#### Scenario: ErrorBoundary catches error
- **WHEN** a child component throws during render
- **THEN** ErrorBoundary SHALL display the fallback UI instead of the crashed component

### Requirement: ErrorAlert for API errors
The system SHALL provide an `<ErrorAlert>` component that accepts `error` (object with `status` and `message`) and optional `onRetry` callback. It SHALL display different messages based on HTTP status:
- 401: "Su sesión ha expirado. Inicie sesión nuevamente."
- 403: "No tiene permisos para realizar esta acción."
- 429: "Demasiadas solicitudes. Espere un momento e intente nuevamente."
- 500: "Error del servidor. Intente nuevamente más tarde."

#### Scenario: ErrorAlert shows 403 message
- **WHEN** `<ErrorAlert error={{ status: 403 }} />` renders
- **THEN** it SHALL display "No tiene permisos para realizar esta acción."

### Requirement: GradeForm input component
The system SHALL provide a `<GradeForm>` component with props `value`, `onChange`, `readOnly`, and optional `subject`/`period` labels. It SHALL validate input range 0-10 with step 0.01 and show visual feedback (red border on invalid).

#### Scenario: GradeForm validates range
- **WHEN** user types "11" in the GradeForm input
- **THEN** the input SHALL show a red border and a validation error "La nota debe estar entre 0 y 10"

### Requirement: AttendanceSummary cards
The system SHALL provide an `<AttendanceSummary>` component that accepts `totals` object (`{ present, absent, late, justified, totalDays }`) and renders summary cards with color coding: present (green), absent (red), late (amber), justified (blue).

#### Scenario: AttendanceSummary renders totals
- **WHEN** `<AttendanceSummary totals={{ present: 15, absent: 2, late: 1, totalDays: 18 }} />` renders
- **THEN** it SHALL show "Presentes: 15" (green), "Ausentes: 2" (red), "Tardes: 1" (amber)

### Requirement: ChildSelector component
The system SHALL provide a `<ChildSelector>` component that accepts `children` array, `selectedChild`, and `onChange`. It SHALL render as horizontal tabs if ≤3 children, or as a dropdown if >3 children.

#### Scenario: ChildSelector renders tabs for 2 children
- **WHEN** `<ChildSelector children={[child1, child2]} />` renders
- **THEN** it SHALL render horizontal tab buttons for each child

#### Scenario: ChildSelector renders dropdown for 4 children
- **WHEN** `<ChildSelector children={[c1, c2, c3, c4]} />` renders
- **THEN** it SHALL render a `<Select>` dropdown instead of tabs

### Requirement: DataTable refactored with Stitch design
The `<DataTable>` component SHALL be refactored to use Stitch design tokens (32px border radius on container, pill-style action buttons, warm shadows) and SHALL support `loading` (skeleton rows), `emptyMessage` (EmptyState), and `sortable` columns.

#### Scenario: DataTable in loading state
- **WHEN** `loading={true}` is passed to DataTable
- **THEN** it SHALL render LoadingSkeleton rows instead of data rows

#### Scenario: DataTable in empty state
- **WHEN** `data={[]}` and `emptyMessage="No hay usuarios"` are passed
- **THEN** it SHALL render EmptyState with the message "No hay usuarios"

### Requirement: DashboardLayout refactored with configurable sidebar
The `<DashboardLayout>` component SHALL accept a `sections` prop (array of `{id, label, icon, path}`) and render a sidebar with navigation items, header with avatar+logout, and `<Outlet />` for content.

#### Scenario: DashboardLayout renders sidebar sections
- **WHEN** `<DashboardLayout sections={[{id:'users', label:'Usuarios', icon: FiUsers, path:'/admin/users'}]} />` renders
- **THEN** the sidebar SHALL show a "Usuarios" navigation item with FiUsers icon

#### Scenario: DashboardLayout sidebar collapses
- **WHEN** the sidebar toggle button is clicked
- **THEN** the sidebar SHALL collapse to icon-only mode (64px width on tablet, hamburger drawer on mobile)

