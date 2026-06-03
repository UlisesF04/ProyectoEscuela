## MODIFIED Requirements

### Requirement: AdminDashboardOverview page (`/admin`)
The system SHALL render a summary page at `/admin` with 5 summary cards in a responsive grid (5 cols desktop, 2 cols tablet, 1 col mobile): Total Active Users, Active Courses, Registered Students, Pending Leaves (with "Action Needed" badge), and Notifications Sent Today. Each card SHALL use Chakra `Stat` component with warm shadow, be clickable (navigating to the corresponding section), and have a colored top border that follows the card's border radius.

Below the summary cards, the page SHALL render a "Recent Activity" section showing the last 5 notifications sent and pending leaves that need action.

The page SHALL fetch data from `GET /api/v1/admin/stats` instead of individual endpoints.

#### Scenario: Overview loads from aggregated endpoint
- **WHEN** admin navigates to `/admin`
- **THEN** the page SHALL fetch `GET /api/v1/admin/stats` and render 5 summary cards + recent activity section

#### Scenario: Overview shows loading state
- **WHEN** data is being fetched
- **THEN** each card SHALL show a Chakra `Skeleton` placeholder

#### Scenario: Overview shows empty state
- **WHEN** all counts are zero
- **THEN** cards SHALL display "0" with subtitle "Aún no hay datos cargados"

## ADDED Requirements

### Requirement: AdminLayout with ErrorBoundary
The `<AdminLayout>` component SHALL wrap its `<Outlet />` with `<ErrorBoundary>` to catch render errors in any admin sub-page.

#### Scenario: ErrorBoundary catches render crash
- **WHEN** a child admin page throws during render
- **THEN** ErrorBoundary SHALL display the fallback UI with "Algo salió mal" message, "Reintentar" button that reloads the page, and "Volver al inicio" link to `/admin`

### Requirement: Admin views responsive layout
All admin pages SHALL function correctly on mobile viewports (< 768px): sidebar SHALL collapse to hamburger drawer, data tables SHALL support horizontal scroll or card layout, modals SHALL become full-screen on mobile, and touch targets SHALL be minimum 44px.

#### Scenario: Admin sidebar on mobile
- **WHEN** viewport is < 768px
- **THEN** the sidebar SHALL be hidden and replaced by a hamburger menu button that opens a drawer overlay

#### Scenario: DataTable on mobile
- **WHEN** viewport is < 768px and DataTable has many columns
- **THEN** the table SHALL allow horizontal scrolling or show stacked card layout
