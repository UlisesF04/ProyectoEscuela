# admin-dashboard-stats Specification

## Purpose
TBD - created by archiving change c-11-admin-dashboard-and-polish. Update Purpose after archive.
## Requirements
### Requirement: Admin stats endpoint GET /api/v1/admin/stats
The system SHALL provide a `GET /api/v1/admin/stats` endpoint (admin-only) that returns aggregated data for the admin dashboard overview.

#### Scenario: Admin fetches dashboard stats
- **WHEN** an admin user sends `GET /api/v1/admin/stats`
- **THEN** the response SHALL contain:
  - `users`: total count of active users (`is_active = true`)
  - `courses`: total count of courses
  - `students`: total count of students
  - `pendingLeaves`: count of leaves with status 'pendiente'
  - `recentNotifications`: array of last 5 notification logs with `{ id, student_name, alert_type, status, sent_at }`
  - `studentsAtRisk`: count of students with attendance ≥ 20% absences

#### Scenario: Non-admin cannot access stats
- **WHEN** a non-admin user (preceptor/docente/padre) sends `GET /api/v1/admin/stats`
- **THEN** the endpoint SHALL return HTTP 403 Forbidden

