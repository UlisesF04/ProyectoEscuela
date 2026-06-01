## ADDED Requirements

### Requirement: /padre/evolution route registered
The system SHALL register a route `evolution` as a child of the `/padre` parent route in `AppRoutes.jsx`, mapping to the `ChildEvolutionPage` component, protected by `ProtectedRoute` with `requiredRoles=['padre']`.

#### Scenario: Padre navigates to evolution
- **WHEN** an authenticated padre navigates to `/padre/evolution`
- **THEN** the ChildEvolutionPage renders within the PadreLayout

### Requirement: /docente/evolution route registered
The system SHALL register a route `evolution` as a child of the `/docente` parent route in `AppRoutes.jsx`, mapping to the `StudentEvolutionPage` component, protected by `ProtectedRoute` with `requiredRoles=['docente']`.

#### Scenario: Docente navigates to evolution
- **WHEN** an authenticated docente navigates to `/docente/evolution`
- **THEN** the StudentEvolutionPage renders within the DocenteLayout
