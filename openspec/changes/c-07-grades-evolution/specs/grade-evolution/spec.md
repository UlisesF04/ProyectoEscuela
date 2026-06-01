# grade-evolution Specification

## Purpose
Define the capability to query and visualize the chronological evolution of a student's grades, grouped by subject, with role-based access control (RN-03 for parents, RN-04 for teachers, unrestricted for admins).

## Requirements

### Requirement: Backend endpoint returns grade evolution grouped by subject
The system SHALL provide a `GET /api/v1/students/:id/evolution` endpoint that returns the student's grades grouped by subject, ordered chronologically (ASC by date) within each subject, with a per-subject average and a general average. The response MUST conform to the shape: `{ student: { id, first_name, last_name }, subjects: [{ id, name, grades: [{ id, value, type, date, description }], average }] }`.

#### Scenario: Student has grades in multiple subjects
- **WHEN** an authenticated caller requests the evolution for a student with grades in 2+ subjects
- **THEN** the response includes a `subjects` array with one entry per subject, each containing the grades sorted by date ASC and a numeric `average`

#### Scenario: Student has no grades
- **WHEN** an authenticated caller requests the evolution for a student with zero grades
- **THEN** the response includes a `subjects` array with length 0 and the `student` object is still present

#### Scenario: Student does not exist
- **WHEN** an authenticated caller requests the evolution with a non-existent student id
- **THEN** the endpoint returns HTTP 404 with a message indicating the student was not found

### Requirement: Parent access is restricted to linked students
The system SHALL only allow a parent to access the evolution of a student that is explicitly linked to them in the `parent_student` table. Access to evolution data of any other student MUST be denied with HTTP 403.

#### Scenario: Parent accesses their linked child
- **WHEN** an authenticated parent (role=padre) requests the evolution of a student linked to them
- **THEN** the endpoint returns HTTP 200 with the student's evolution data

#### Scenario: Parent accesses an unlinked student
- **WHEN** an authenticated parent requests the evolution of a student with no link in `parent_student`
- **THEN** the endpoint returns HTTP 403 with a message indicating lack of permission

### Requirement: Teacher access is filtered by assigned subjects
The system SHALL only allow a teacher to see grades for subjects they are assigned to in the `teacher_subject` table. The query MUST filter by `subject_id IN (assigned subject ids)`. A teacher with no assignments MUST be denied with HTTP 403.

#### Scenario: Teacher accesses a student in their assigned subject
- **WHEN** an authenticated teacher (role=docente) requests the evolution of a student
- **THEN** the endpoint returns HTTP 200 containing only the subjects that the teacher is assigned to

#### Scenario: Teacher has no assigned subjects
- **WHEN** an authenticated teacher with no entries in `teacher_subject` requests any evolution
- **THEN** the endpoint returns HTTP 403 with a message indicating no subjects are assigned

### Requirement: Admin has unrestricted access
The system SHALL allow an admin (role=admin) to access the evolution of any student without filtering.

#### Scenario: Admin accesses any student
- **WHEN** an authenticated admin requests the evolution of any student
- **THEN** the endpoint returns HTTP 200 with all subjects and all grades for that student

### Requirement: Unauthenticated requests are rejected
The system SHALL reject any request to the evolution endpoint that does not include a valid JWT token with HTTP 401.

#### Scenario: Missing token
- **WHEN** a request to the evolution endpoint has no `Authorization` header
- **THEN** the endpoint returns HTTP 401 with a token-required message

#### Scenario: Invalid token
- **WHEN** a request to the evolution endpoint has an invalid or expired JWT
- **THEN** the endpoint returns HTTP 401 with a token-invalid message

### Requirement: Frontend reusable component renders evolution
The system SHALL provide a React component `GradeEvolutionView` that renders the evolution data: a header with student info and totals (number of subjects, total grades, general average), one card per subject with name, per-subject average, a mini line-chart showing the chronological grade progression, and a grid of badges with type/date/value for each grade. The component MUST handle loading, error, and empty states.

#### Scenario: Component receives evolution data with grades
- **WHEN** the component receives evolution data with at least one subject and at least one grade
- **THEN** it renders the summary header and one card per subject, each with chart and badges

#### Scenario: Component receives empty data
- **WHEN** the component receives evolution data with zero subjects
- **THEN** it renders an empty state message

#### Scenario: Component is in loading state
- **WHEN** the loading prop is true
- **THEN** it renders skeleton placeholders matching the final layout

#### Scenario: Component is in error state
- **WHEN** the error prop is set
- **THEN** it renders an error alert with a retry button

### Requirement: Animations respect reduced motion preference
The system SHALL respect the `prefers-reduced-motion` media query. When the user has reduced motion enabled, all entry animations and chart draw-in animations MUST be disabled (elements appear in their final state immediately, without motion).

#### Scenario: User has no motion preference
- **WHEN** the user has no `prefers-reduced-motion` setting
- **THEN** chart line draws in over ~1.1s and points pop in with stagger

#### Scenario: User has reduced motion preference
- **WHEN** the user has `prefers-reduced-motion: reduce` set
- **THEN** chart line and points appear in their final state without animation

### Requirement: General trend chart in summary header
The system SHALL render a single-line trend chart (at least 160px tall) in the summary header of `GradeEvolutionView`, showing the chronological general average of all grades across all subjects. For each date that has one or more grades, the chart plots the mean value of those grades and connects consecutive points with a line. The chart MUST respect `prefers-reduced-motion` (same draw-in animation as the per-subject chart, or no animation under reduced motion).

#### Scenario: Multiple grades across multiple dates
- **WHEN** the evolution data contains grades on 5+ different dates across 2+ subjects
- **THEN** the summary header shows a single line chart with one point per date (each point is the mean of grades on that date) connected chronologically

#### Scenario: Single date with multiple grades
- **WHEN** the evolution data contains grades on exactly 1 date
- **THEN** the chart renders a single point at the mean value of that date's grades

#### Scenario: No grades
- **WHEN** the evolution data has no subjects (empty)
- **THEN** the empty state is rendered and the summary header chart is not shown

### Requirement: Per-subject chart is visually prominent
The system SHALL render the per-subject line chart at a height of at least 160px (up from 100px in the prior layout) and place it visually as the primary visual element within each subject card, above the chronological badge grid.

#### Scenario: Subject card layout
- **WHEN** a subject card is rendered with grades
- **THEN** the chart (160px+) is rendered above the chronological badge grid, not below the header as a small detail
