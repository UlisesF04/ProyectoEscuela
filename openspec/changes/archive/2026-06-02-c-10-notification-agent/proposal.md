## Why

Las familias no tienen visibilidad en tiempo real sobre la situación académica de sus hijos (inasistencias críticas, notas bajas, tareas próximas a vencer). Actualmente, los padres deben ingresar manualmente al sistema para obtener esta información. Un agente automatizado que envíe alertas por email mantendrá a las familias informadas sin fricción, mejorando la comunicación escuela-hogar.

## What Changes

- **Agente Python con APScheduler**: Nuevo scheduler que ejecuta tareas diarias post-jornada escolar (18:00 hs, lunes a viernes)
- **5 alertas automáticas**: Ausencias críticas, riesgo de regularidad, calificación baja, tarea próxima a vencer, vencimiento de licencia docente
- **Envío de emails vía Resend API**: Reemplaza el plan original con Twilio (WhatsApp). Los usuarios ya tienen email en el sistema.
- **Configuración en `agent/`**: Refactor del esqueleto existente para implementar la lógica real
- **Modelo `NotificationLog`**: Ya existe en migración 003, solo verificar que esté completa
- **Endpoint interno**: `POST /api/v1/notifications/trigger` con `SERVICE_API_KEY` para trigger manual
- **Anti-spam**: Misma alerta no se reenvía al mismo padre para el mismo alumno en 24h (RN-16)
- **Logging obligatorio**: Cada intento de envío se registra en `notification_logs` (RN-17)
- **Fronend**: Vista `NotificationLogsPage.jsx` ya existe del C-13, conectarla con datos reales

## Capabilities

### New Capabilities
- `notification-alerts`: Evaluación de condiciones y generación de alertas automáticas (ausencias críticas, calificación baja, tarea próxima a vencer, riesgo de regularidad, vencimiento de licencia)
- `email-notifications`: Envío de notificaciones por email vía Resend API con logs de auditoría

### Modified Capabilities
- *(ninguna — es una capacidad nueva, no modifica specs existentes)*

## Impact

- **`agent/`**: Se reescribe `main.py`, `config.py`, `tasks/db_reader.py`, `tasks/notifier.py`, `tasks/alert_engine.py` con lógica real
- **`agent/requirements.txt`**: Cambia `twilio` por `resend`
- **`backend/`**: Se agrega endpoint `POST /api/v1/notifications/trigger` con `SERVICE_API_KEY`
- **`.env.example`**: Sección Twilio reemplazada por `RESEND_API_KEY` y `FROM_EMAIL` (ya hecho)
- **`frontend/`**: Se conecta `NotificationLogsPage.jsx` existente con datos reales
- **Modelo `NotificationLog`**: Verificar que migración 003 esté completa
