## Context

El sistema ya cuenta con datos académicos completos (asistencias, calificaciones, tareas, licencias) y un modelo `NotificationLog` (migración 003). El esqueleto del agente Python existe en `agent/` pero solo tiene un placeholder. Se necesita implementar la lógica real de evaluación de condiciones y envío de notificaciones por email.

Las familias están vinculadas a los alumnos via `parent_student`. Cada usuario ya tiene `email` en el modelo `User`. No se requieren cambios de modelo.

## Goals / Non-Goals

**Goals:**
- Agente Python autónomo que evalúa 5 condiciones diariamente (post-jornada escolar)
- Envío de emails vía Resend API a padres/tutores
- Logging de cada notificación en `notification_logs` para auditoría (RN-17)
- Anti-spam: misma alerta no se reenvía al mismo padre+alumno en 24h (RN-16)
- Endpoint backend para trigger manual con SERVICE_API_KEY
- Vista frontend NotificationLogsPage conectada con datos reales

**Non-Goals:**
- No hay UI de configuración de umbrales (se usa variable de entorno AUSENCIA_UMBRAL por ahora)
- No hay autenticación de usuarios en el agente (consulta BD directamente)
- No hay templates HTML complejos de email (se usa texto plano o HTML simple inline)
- No hay cola de mensajes ni reintentos programados (solo un intento por ciclo)

## Decisions

### DD-C10-01: Python independiente vs tarea CRON en Node.js
- **Decisión**: Mantener el agente como proceso Python independiente con APScheduler
- **Alternativa**: node-cron dentro del backend Express
- **Por qué**: Python tiene mejor ecosistema para scripting de datos (psycopg2 directo, sin ORM). Separar el agente evita que tareas pesadas bloqueen el event loop de Node.js. Además, el esqueleto ya existe en Python.

### DD-C10-02: Resend API vs SMTP directo
- **Decisión**: Usar Resend SDK Python (`resend`) en lugar de SMTP directo
- **Alternativas**: smtplib (Python estándar), SendGrid, Mailgun
- **Por qué**: Resend tiene SDK Python simple, free tier generoso (100 emails/día), buena deliverability, y no requiere configurar servidor SMTP. La API key es la única configuración necesaria.

### DD-C10-03: SQL directo vs API REST del backend
- **Decisión**: El agente consulta PostgreSQL directamente con psycopg2 (SQL crudo)
- **Alternativa**: Llamar a la API REST del backend para obtener datos
- **Por qué**: El agente ya tiene acceso a la misma BD. SQL directo evita latencia de red, autenticación extra, y acoplamiento a la API. Las consultas son read-only y no afectan la consistencia.

### DD-C10-04: Anti-spam por BD vs en memoria
- **Decisión**: El anti-spam se implementa consultando `notification_logs` (¿existe un registro del mismo tipo para el mismo alumno en las últimas 24h?)
- **Alternativa**: Mantener estado en memoria o archivo
- **Por qué**: Usar la BD garantiza persistencia ante reinicios del agente y permite auditoría. La query es simple y eficiente con el índice compuesto `(student_id, type, sent_at)`.

### DD-C10-05: Notificaciones vía email en lugar de WhatsApp (Twilio)
- **Decisión**: Usar Resend (email) en lugar de Twilio (WhatsApp)
- **Alternativa**: Twilio WhatsApp Business (plan original)
- **Por qué**: Elimina el riesgo de aprobación de Meta, simplifica la configuración, los usuarios ya tienen email, y Resend tiene free tier. **Decisión reevaluada durante C-09 — ver knowledge-base/09_decisiones_y_supuestos.md DD-06.**

## Architecture

```
                    ┌──────────────────────────┐
                    │    main.py (APScheduler)  │
                    │  Ejecuta cada 24h (18hs)  │
                    └──────────┬───────────────┘
                               │
                    ┌──────────▼───────────────┐
                    │    alert_engine.py        │
                    │  Orquesta las 5 alertas   │
                    └──────────┬───────────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
    ┌─────────────────┐ ┌──────────────┐ ┌──────────────┐
    │  db_reader.py   │ │ notifier.py  │ │ notification │
    │ Consultas SQL   │ │ Resend API   │ │ _logs (BD)   │
    │ a PostgreSQL    │ │ Envío email  │ │ Registro     │
    └─────────────────┘ └──────────────┘ └──────────────┘
```

## 5 Alertas

| Alerta | Condición | Destinatario | Query clave |
|--------|-----------|--------------|-------------|
| AUSENCIAS_CRITICAS | ≥ X inasistencias no justificadas (X configurable, defecto: 10) | Padre/tutor | `COUNT(*) WHERE status='ausente' AND is_justified=false GROUP BY student_id` |
| RIESGO_REGULARIDAD | ≥ 20% inasistencias sobre total de días del trimestre | Padre/tutor | `(ausencias / total_dias) >= 0.20` |
| CALIFICACION_BAJA | Calificación < 4 registrada hoy | Padre/tutor | `SELECT ... WHERE value < 4 AND DATE(created_at) = CURRENT_DATE` |
| TAREA_PENDIENTE | Tarea vence en ≤ 2 días + no entregada | Padre/tutor | `SELECT ... WHERE due_date BETWEEN TODAY AND TODAY+2 AND status='pendiente'` |
| LICENCIA_DOCENTE_VENCIMIENTO | Licencia aprobada vence en ≤ 3 días | Docente + Admin | `SELECT ... WHERE end_date BETWEEN TODAY AND TODAY+3` |

## Data Flow (por alerta)

```
1. db_reader.alertaX() → list[dict] de alumnos que cumplen condición
2. Para cada alumno:
   a. Buscar padres vinculados en parent_student
   b. Verificar anti-spam: ¿ya se notificó este tipo + alumno en últimas 24h?
   c. Si no: notifier.send_email(parent_email, template_data)
   d. Insertar en notification_logs: { recipient_id, student_id, type, message, channel='email', status }
3. Si error de Resend → status='fallido', se logea el error
```

## Risks / Trade-offs

| Riesgo | Mitigación |
|--------|------------|
| Email cae en spam | Configurar SPF/DKIM en el dominio. Resend maneja deliverability. Incluir nota en onboarding. |
| Agente falla y no se ejecuta un día | El scheduler de APScheduler reintenta. Además, se puede agregar un healthcheck. |
| Consultas SQL lentas con muchos alumnos | Las queries están indexadas (student_id, type, sent_at). Para una escuela secundaria típica (~500 alumnos) es más que suficiente. |
| Sin autenticación en endpoint trigger | El endpoint interno usa SERVICE_API_KEY como bearer token. Solo el agente conoce esta key. |
