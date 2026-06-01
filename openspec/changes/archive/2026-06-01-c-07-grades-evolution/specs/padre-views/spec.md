## ADDED Requirements

### Requirement: PadreLayout sidebar includes Evolution link
The system SHALL render an "Evolución" item in the PadreLayout sidebar, after "Calificaciones" and before "Asistencias", with path `/padre/evolution` and a trending-up icon.

#### Scenario: Padre sees Evolution in sidebar
- **WHEN** an authenticated padre navigates to any `/padre/*` page
- **THEN** the sidebar shows an "Evolución" link between "Calificaciones" and "Asistencias"

### Requirement: ChildEvolutionPage at /padre/evolution
The system SHALL render a page at `/padre/evolution` showing the evolution of grades for a selected child. The page MUST use the existing `ChildSelector` for switching between children and the `GradeEvolutionView` component to render the data fetched from `GET /api/v1/students/:id/evolution`.

#### Scenario: Padre opens evolution page
- **WHEN** a padre navigates to `/padre/evolution`
- **THEN** the page loads their first child's evolution via the backend endpoint and renders the GradeEvolutionView

#### Scenario: Padre switches between children
- **WHEN** a padre selects a different child in the ChildSelector
- **THEN** the page re-fetches evolution data for the new child and re-renders the view

### Requirement: ChildGradesPage filter bar (materia, tipo, periodo)
The system SHALL render a filter bar in `ChildGradesPage` with three controls applied client-side to the already-loaded grades list:
- A "Materia" select populated dynamically from the set of distinct subject names in the loaded grades, plus an "Todas" default option.
- A "Tipo" select with the fixed options "Todos", "Examen", "Trabajo Práctico", "Tarea", "Oral", "Otro" (mapping to the `type` enum on the backend).
- A "Periodo" select with "Todos" plus the three academic terms derived from each grade's `date` field (1er trimestre = Mar-May, 2do trimestre = Jun-Ago, 3ro trimestre = Sep-Dic).
The per-subject averages card, the table, and the low-grade alert MUST all reflect the active filter combination. When the filtered list is empty, the table SHALL display an empty state with the message "No hay calificaciones con esos filtros".

#### Scenario: Padre filters by a single subject
- **WHEN** a padre selects a specific subject from the "Materia" filter
- **THEN** the per-subject averages card, the table, and the low-grade alert show only grades matching that subject

#### Scenario: Padre filters by type
- **WHEN** a padre selects "Tarea" from the "Tipo" filter
- **THEN** the table shows only grades whose `type` is `tarea`

#### Scenario: Padre filters by period
- **WHEN** a padre selects "1er trimestre" from the "Periodo" filter
- **THEN** only grades whose `date` falls in March, April, or May are shown

#### Scenario: Filters combined
- **WHEN** a padre has a subject, a type, and a period filter active
- **THEN** the displayed grades match ALL three filter criteria (logical AND)

#### Scenario: No matches with active filters
- **WHEN** the active filters produce zero matching grades
- **THEN** the table shows "No hay calificaciones con esos filtros" and the per-subject averages card is hidden

#### Scenario: Subject list grows with new grades
- **WHEN** new grades for a previously unseen subject arrive in the loaded list
- **THEN** the "Materia" select includes that subject as a new option without requiring a page reload

#### Scenario: All filters reset to "Todos"
- **WHEN** all three filters are set to "Todos"
- **THEN** the page displays the unfiltered grades list, the full per-subject averages, and the low-grade alert behaves as in the original requirement
