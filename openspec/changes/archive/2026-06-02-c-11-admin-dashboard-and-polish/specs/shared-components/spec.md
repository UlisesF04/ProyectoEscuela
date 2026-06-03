## MODIFIED Requirements

### Requirement: ErrorBoundary component
The system SHALL provide an `<ErrorBoundary>` component using React error boundary pattern (componentDidCatch). It SHALL catch render errors and display a fallback UI with "Algo salió mal" message, "Reintentar" button (that calls `window.location.reload()`), and "Volver al inicio" button (that navigates to a configurable `homePath` prop, defaulting to `/admin`).

The ErrorBoundary SHALL be integrated in `<AdminLayout>` wrapping the `<DashboardLayout>` component.

#### Scenario: ErrorBoundary catches error
- **WHEN** a child component throws during render
- **THEN** ErrorBoundary SHALL display the fallback UI instead of the crashed component

#### Scenario: ErrorBoundary integrated in admin layout
- **WHEN** any admin page throws an error during render
- **THEN** the ErrorBoundary SHALL catch it and display the fallback UI within the admin layout

### Requirement: ErrorAlert for API errors
The system SHALL provide an `<ErrorAlert>` component that accepts `error` (object with `status` and `message`) and optional `onRetry` callback. It SHALL display different messages based on HTTP status:
- 401: "Su sesión ha expirado. Inicie sesión nuevamente."
- 403: "No tiene permisos para realizar esta acción."
- 429: "Demasiadas solicitudes. Espere un momento e intente nuevamente."
- 500: "Error del servidor. Intente nuevamente más tarde."

The api.js interceptor SHALL log a console.warn for 429 responses.

#### Scenario: ErrorAlert shows 403 message
- **WHEN** `<ErrorAlert error={{ status: 403 }} />` renders
- **THEN** it SHALL display "No tiene permisos para realizar esta acción."

#### Scenario: ErrorAlert shows 429 message
- **WHEN** `<ErrorAlert error={{ status: 429, message: "Rate limit exceeded" }} />` renders
- **THEN** it SHALL display "Demasiadas solicitudes. Espere un momento e intente nuevamente."
