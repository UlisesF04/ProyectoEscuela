## ADDED Requirements

### Requirement: DocenteLayout sidebar includes Evolution link
The system SHALL render an "Evolución del alumno" item in the DocenteLayout sidebar, after "Calificaciones" and before "Mis Licencias", with path `/docente/evolution` and a trending-up icon.

#### Scenario: Docente sees Evolution in sidebar
- **WHEN** an authenticated docente navigates to any `/docente/*` page
- **THEN** the sidebar shows an "Evolución del alumno" link between "Calificaciones" and "Mis Licencias"

### Requirement: StudentEvolutionPage at /docente/evolution
The system SHALL render a page at `/docente/evolution` showing the evolution of grades for a selected student in a selected course. The page MUST use course and student selectors (loaded from `GET /api/v1/subjects/my/courses`) and the `GradeEvolutionView` component to render the data fetched from `GET /api/v1/students/:id/evolution`.

#### Scenario: Docente opens evolution page
- **WHEN** a docente navigates to `/docente/evolution`
- **THEN** the page loads their first course and first student and renders the evolution view

#### Scenario: Docente switches course
- **WHEN** a docente selects a different course in the course selector
- **THEN** the student selector repopulates with the new course's students and the first student is auto-selected

#### Scenario: Docente switches student
- **WHEN** a docente selects a different student in the student selector
- **THEN** the page re-fetches evolution data for the new student (filtered to the docente's assigned subjects by the backend)
