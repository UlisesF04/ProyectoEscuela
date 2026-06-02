## ADDED Requirements

### Requirement: Envío de email vía Resend
El sistema SHALL enviar notificaciones por email utilizando la API de Resend. La configuración SHALL usar la variable de entorno `RESEND_API_KEY`.

#### Scenario: Envío exitoso
- **WHEN** el agente envía un email a una dirección válida
- **THEN** Resend SHALL devolver un ID de confirmación y el agente SHALL registrar el envío como 'enviado'

#### Scenario: Error de envío
- **WHEN** Resend devuelve un error (email inválido, cuota excedida, etc.)
- **THEN** el agente SHALL registrar la notificación como 'fallido' y logear el error

### Requirement: Destinatario del email
El sistema SHALL usar el campo `email` del modelo `User` como dirección de destino de las notificaciones.

#### Scenario: Padre sin email registrado
- **WHEN** un padre/tutor no tiene email configurado
- **THEN** el agente SHALL saltar ese destinatario y registrar un log informativo

### Requirement: Remitente configurable
El sistema SHALL usar la variable de entorno `FROM_EMAIL` como dirección remitente de los emails.

#### Scenario: Remitente personalizado
- **WHEN** `FROM_EMAIL` está configurado como `noreply@escuela.edu`
- **THEN** los emails SHALL enviarse desde esa dirección

### Requirement: Logging de notificaciones
Cada intento de notificación SHALL registrarse en la tabla `notification_logs` con: recipient_id, student_id (nullable), type, message, channel='email', status (enviado/fallido), sent_at.

#### Scenario: Registro exitoso en notification_logs
- **WHEN** el agente intenta enviar una notificación
- **THEN** SHALL crear un registro en notification_logs con todos los campos requeridos

### Requirement: Endpoint de trigger manual
El backend SHALL exponer `POST /api/v1/notifications/trigger` que permite ejecutar el agente bajo demanda. SHALL requerir autenticación via header `Authorization: Bearer <SERVICE_API_KEY>`.

#### Scenario: Trigger manual exitoso
- **WHEN** se envía POST a /api/v1/notifications/trigger con SERVICE_API_KEY válida
- **THEN** el backend SHALL ejecutar todas las evaluaciones de alertas y devolver 200 con resumen

#### Scenario: Trigger manual sin auth
- **WHEN** se envía POST sin SERVICE_API_KEY o con key inválida
- **THEN** el backend SHALL devolver 401

### Requirement: Vista de logs de notificaciones
El frontend SHALL tener una vista `NotificationLogsPage` (ya existe del C-13) que muestre el historial de notificaciones con filtros por tipo, estado y fecha.

#### Scenario: Admin ve logs de notificaciones
- **WHEN** un administrador accede a `/admin/notifications`
- **THEN** SHALL ver una tabla con todas las notificaciones, filtrable por tipo, estado y fecha
