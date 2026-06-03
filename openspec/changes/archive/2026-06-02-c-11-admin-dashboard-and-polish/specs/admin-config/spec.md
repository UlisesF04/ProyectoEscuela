## ADDED Requirements

### Requirement: Config endpoint GET /api/v1/config
The system SHALL provide a `GET /api/v1/config` endpoint (admin-only) that returns the current system configuration merged with defaults.

#### Scenario: Admin fetches configuration
- **WHEN** an admin sends `GET /api/v1/config`
- **THEN** the response SHALL contain `{ data: { absence_threshold, notification_time, alerts_enabled } }` with defaults applied for any missing keys

### Requirement: Config endpoint PUT /api/v1/config
The system SHALL provide a `PUT /api/v1/config` endpoint (admin-only) that accepts a partial or full configuration object and persists it.

#### Scenario: Admin updates absence threshold
- **WHEN** an admin sends `PUT /api/v1/config` with `{ absence_threshold: 15 }`
- **THEN** the setting SHALL be persisted in the `settings` table and the response SHALL return the merged config

#### Scenario: Admin updates notification time
- **WHEN** an admin sends `PUT /api/v1/config` with `{ notification_time: "17:30" }`
- **THEN** the setting SHALL be persisted and the agent SHALL use the new time on next execution

#### Scenario: Admin disables an alert type
- **WHEN** an admin sends `PUT /api/v1/config` with `{ alerts_enabled: { absence: false, low_grade: true, overdue_task: true } }`
- **THEN** the absence alert SHALL be disabled and the agent SHALL NOT send absence alerts

### Requirement: Config validates absence_threshold range
The system SHALL validate that `absence_threshold` is between 1 and 50 inclusive.

#### Scenario: Threshold out of range
- **WHEN** an admin sends `PUT /api/v1/config` with `{ absence_threshold: 0 }`
- **THEN** the endpoint SHALL return HTTP 400 with a validation error message
