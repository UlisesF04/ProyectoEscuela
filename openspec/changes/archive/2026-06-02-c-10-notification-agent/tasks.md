## 1. Agent Configuration & Setup

- [x] 1.1 Update `agent/requirements.txt`: remove `twilio`, add `resend`
- [x] 1.2 Rewrite `agent/config.py`: replace Twilio env vars with `RESEND_API_KEY` and `FROM_EMAIL`, keep `DATABASE_URL` and `AUSENCIA_UMBRAL`
- [x] 1.3 Rewrite `agent/main.py`: APScheduler config with daily execution Mon-Fri at 18:00, proper logging, error handling

## 2. Database Reader (Queries)

- [x] 2.1 Implement `agent/tasks/db_reader.py` with SQL query for AUSENCIAS_CRITICAS: alumnos con >= X inasistencias no justificadas
- [x] 2.2 Implement query for RIESGO_REGULARIDAD: alumnos con >= 20% inasistencias sobre total de días del trimestre
- [x] 2.3 Implement query for CALIFICACION_BAJA: calificaciones < 4 registradas hoy
- [x] 2.4 Implement query for TAREA_PENDIENTE: tareas con vencimiento ≤ 2 días + no entregadas
- [x] 2.5 Implement query for LICENCIA_DOCENTE_VENCIMIENTO: licencias con fin ≤ 3 días
- [x] 2.6 Implement helper function to find parent emails for each student (via parent_student + users)

## 3. Email Notifier (Resend)

- [x] 3.1 Rewrite `agent/tasks/notifier.py`: implement send_email() using Resend Python SDK
- [x] 3.2 Implement email template builder with HTML inline styles (one template per alert type)
- [x] 3.3 Implement anti-spam check: consult notification_logs before sending (same type + student_id in last 24h)
- [x] 3.4 Implement notification_log INSERT after each send attempt (status: enviado/fallido)

## 4. Alert Engine (Orchestration)

- [x] 4.1 Rewrite `agent/tasks/alert_engine.py`: orchestrate all 5 alert evaluations in sequence
- [x] 4.2 Implement error handling per alert (one alert failure doesn't block others)
- [x] 4.3 Implement summary logging (total alerts sent, failed, skipped by anti-spam)

## 5. Backend: Manual Trigger Endpoint

- [x] 5.1 Create `backend/modules/notifications/` with routes, controller, service
- [x] 5.2 Implement `POST /api/v1/notifications/trigger` with SERVICE_API_KEY auth
- [x] 5.3 Mount routes in `backend/app.js`

## 6. Frontend: Notification Logs

- [x] 6.1 Create `frontend/src/services/notificationsService.js` with methods: getAll(), getFilters()
- [x] 6.2 Connect existing `pages/admin/NotificationLogsPage.jsx` to real API data
- [x] 6.3 Verify filters (type, status, date range) work with real data

## 7. Tests

- [x] 7.1 Write backend tests for `POST /api/v1/notifications/trigger` (success + 401 without key)
- [x] 7.2 Write agent tests: mock db_reader queries return expected data
- [x] 7.3 Write agent tests: mock Resend send, verify notification_log insert
- [x] 7.4 Write agent tests: anti-spam skips already-notified students
