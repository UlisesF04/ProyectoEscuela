# CHANGES.md — ProyectoEscuela
## Mapa Completo de Cambios — Arquitectura SDD

> **Propósito**: Este documento define el roadmap completo de desarrollo del sistema
> de Gestión Académica y Comunicación Escolar, organizado en changes con dependencias
> explícitas, historias de usuario asociadas y archivos afectados.

---

## Estado General del Proyecto

```
FASE 0 — Fundaciones            [✅✅✅✅✅✅✅✅✅✅] 100% (3/3)
FASE 1 — Backend API Core       [✅✅✅✅✅✅✅✅✅✅] 100% (5/5 completos ✅)
FASE 1B — Backend Nuevos Mód.   [✅✅✅✅✅✅✅✅✅✅]  100% (3/3: 019 ✅, 021 ✅, 023 ✅)
FASE 2 — Frontend Core          [⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜]   0% (5 pendientes: 009,010,011,012,013)
FASE 2B — Frontend Nuevos Mód.  [⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜]   0% (3 pendientes: 020,022,024)
FASE 3 — Agente + WhatsApp      [⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜]   0% (3 pendientes: 014,015,016)
FASE 4 — Cierre                 [⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜]   0% (2 pendientes: 017,018)
```

### Lo que ya existe (scaffolding inicial)

| Componente | Estado | Detalle |
|---|---|---|
| Backend `package.json` | ✅ Listo | express, sequelize, pg, bcryptjs, jsonwebtoken, cors, dotenv instalados |
| Backend `app.js` | ⚠️ Parcial | Express server + DB connect + health endpoint + error middleware + ruta `/api/auth`. **Sin rutas de otros módulos** |
| Backend `config/database.js` | ✅ Listo | Conexión PostgreSQL vía Sequelize |
| Backend `.env.example` | ✅ Listo | Variables DB + JWT + Puerto |
| Backend `modules/auth/` | ✅ Listo | auth.model, auth.controller, auth.routes, auth.middleware — JWT + bcrypt + roles |
| Backend `modules/absences/` | ✅ Listo | CRUD completo + RN-03 (ventana 2 días hábiles) + RN-02 (riesgo) + justificación |
| Backend `modules/grades/` | ✅ Listo | CRUD completo + RN-04 (nota crítica) + RN-05 (promedio bajo) |
| Backend `modules/tasks/` | ✅ Listo | CRUD tareas + entregas + RN-06 (2 tareas consecutivas) |
| Backend `modules/teachers/` | ✅ Listo | Licencias docente + RN-07 (≤3 alerta) + panel inasistencias alumnos |
| Backend `modules/analytics/` | ✅ Listo | Dashboard analítico: evolución ausencias mensual + evolución calificaciones por materia + alertas RN-01/02/04/05 + acceso segmentado RN-16 |
| Backend `modules/communication/` | ✅ Listo | Mensajería interna: enviar, listar conversaciones, leer hilo, marcar leído. RN-14 (bloqueo tutor↔tutor) |
| Backend `modules/certificates/` | ✅ Listo | Certificados digitales: upload (docente/tutor), aprobar/rechazar (admin), listar pendientes. RN-09 tutor solo hijos. RN-13 justifica ausencia al aprobar |
| Frontend `package.json` | ✅ Listo | React 19 + Vite 8 + Chakra UI v3 + React Router v7 + Axios |
| Frontend `main.jsx` | ✅ Listo | ChakraProvider con `createSystem` |
| Frontend `App.jsx` | ✅ Listo | Router con login + dashboard protegido |
| Frontend `Login.jsx` | ✅ Listo | Integrado con `/api/auth/login` |
| Frontend `Dashboard.jsx` | ✅ Listo | Página base post-login |
| Frontend `AuthContext.jsx` | ✅ Listo | Manejo de sesión con JWT en localStorage |
| Frontend `ProtectedRoute.jsx` | ✅ Listo | Guard de rutas según auth |
| Frontend `services/api.js` | ✅ Listo | Axios con interceptor JWT |
| Agent `main.py` | ⬜ Skeleton | Solo punto de entrada (2 líneas) |
| Agent `tasks/db_reader.py` | ⬜ Skeleton | Pendiente de implementar con PostgreSQL |
| Agent `tasks/notifier.py` | ⬜ Skeleton | Pendiente de implementar (provider WhatsApp TBD) |
| OpenSpec `config.yaml` | ⚠️ Parcial | Configuración base sin spec de agente |
| `docs/` | ✅ Listo | Integrador.txt, Descripcion.txt, Historias de usuario.txt, CHANGES.md |
| `requirements.txt` | ⬜ No existe | Pendiente de crear |
| Migraciones DB / Seed | ✅ Listo | 13 modelos + migración única + 8 seeders |
| Root `.gitignore` | ⬜ No existe | Pendiente de crear (venv/, etc.) |

---

## Historias de Usuario — Mapa Completo

### MÓDULO 1: Autenticación y Acceso

| ID | Historia | Prioridad | Change |
|---|---|---|---|
| HU-001 | Inicio de sesión con JWT | Alta | CHANGE-002, CHANGE-003 |
| HU-002 | Cierre de sesión | Alta | CHANGE-002, CHANGE-003 |
| HU-003 | Recuperación de contraseña | Media | *Pospuesto* (requiere email service) |

### MÓDULO 2: Gestión de Inasistencias

| ID | Historia | Prioridad | Change |
|---|---|---|---|
| HU-004 | Registro de inasistencias diarias | Alta | CHANGE-004, CHANGE-009 |
| HU-005 | Visualización historial de inasistencias | Alta | CHANGE-004, CHANGE-009 |
| HU-006 | Edición de inasistencias | Media | CHANGE-004, CHANGE-009 |
| HU-019 | Justificación de inasistencias (RN-13) | Alta | CHANGE-004, CHANGE-023, CHANGE-009 |

### MÓDULO 3: Gestión de Calificaciones y Tareas

| ID | Historia | Prioridad | Change |
|---|---|---|---|
| HU-007 | Carga de calificaciones | Alta | CHANGE-005, CHANGE-010 |
| HU-008 | Visualización de promedios | Media | CHANGE-005, CHANGE-010 |
| HU-009 | Registro de tareas y estado de entrega | Media | CHANGE-006, CHANGE-011 |

### MÓDULO 4: Gestión Docente

| ID | Historia | Prioridad | Change |
|---|---|---|---|
| HU-010 | Consulta de licencias docentes | Media | CHANGE-007, CHANGE-012 |
| HU-011 | Panel de inasistencias del docente | Media | CHANGE-007, CHANGE-012 |

### MÓDULO 5: Notificaciones Automáticas

| ID | Historia | Prioridad | Change |
|---|---|---|---|
| HU-012 | Notificación por inasistencias reiteradas (RN-01) | Alta | CHANGE-015, CHANGE-016 |
| HU-013 | Notificación por riesgo de regularidad (RN-02) | Alta | CHANGE-015, CHANGE-016 |
| HU-014 | Notificación por calificación baja (RN-04) | Alta | CHANGE-015, CHANGE-016 |
| HU-015 | Notificación por tareas no entregadas (RN-06) | Media | CHANGE-015, CHANGE-016 |
| HU-016 | Notificación de vencimiento de licencias (RN-07) | Media | CHANGE-015, CHANGE-016 |
| HU-017 | Registro y trazabilidad de notificaciones (RN-11) | Alta | CHANGE-014, CHANGE-015 |

### MÓDULO 6: Portal de Padres

| ID | Historia | Prioridad | Change |
|---|---|---|---|
| HU-018 | Consulta web del estado académico (padre) | Alta | CHANGE-008, CHANGE-013 |

### MÓDULO 7: Analítica y Tablero de Evolución

| ID | Historia | Prioridad | Change |
|---|---|---|---|
| HU-020 | Tablero analítica de asistencias (RN-12, RN-16) | Alta | CHANGE-019, CHANGE-020 |
| HU-021 | Tablero analítica de calificaciones (RN-12, RN-16) | Alta | CHANGE-019, CHANGE-020 |

### MÓDULO 8: Comunicación Interna

| ID | Historia | Prioridad | Change |
|---|---|---|---|
| HU-022 | Envío de mensajes a personal (RN-14) | Alta | CHANGE-021, CHANGE-022 |
| HU-023 | Bandeja de mensajes para personal (RN-14) | Alta | CHANGE-021, CHANGE-022 |

### MÓDULO 9: Certificados Digitales

| ID | Historia | Prioridad | Change |
|---|---|---|---|
| HU-024 | Carga de certificado de justificación (RN-15) | Alta | CHANGE-023, CHANGE-024 |
| HU-025 | Validación de certificados por personal (RN-15, RN-13) | Alta | CHANGE-023, CHANGE-024 |

---

## CHANGES — Mapa Completo

### FASE 0 — FUNDACIONES

---

### CHANGE-001: database-schema

**Descripción:**
Crear el esquema completo de base de datos con migraciones Sequelize y datos de prueba.
Define todas las tablas, relaciones, índices y constraints necesarios para soportar
los módulos de autenticación, gestión académica y notificaciones.

**HU asociadas:** Ninguna directa (base de todas las funcionalidades)

**Archivos:**
```
CREAR:
  backend/models/Usuario.js
  backend/models/Docente.js
  backend/models/Estudiante.js
  backend/models/Curso.js
  backend/models/Tutor.js
  backend/models/EstudianteTutor.js
  backend/models/Inasistencia.js
  backend/models/Calificacion.js
  backend/models/Tarea.js
  backend/models/EntregaTarea.js
  backend/models/NotificacionLog.js
  backend/models/Materia.js
  backend/models/DocenteMateria.js
  backend/migrations/001-create-usuarios.js
  backend/migrations/002-create-cursos.js
  backend/migrations/003-create-docentes.js
  backend/migrations/004-create-estudiantes.js
  backend/migrations/005-create-tutores.js
  backend/migrations/006-create-estudiante-tutor.js
  backend/migrations/007-create-inasistencias.js
  backend/migrations/008-create-materias.js
  backend/migrations/009-create-docente-materia.js
  backend/migrations/010-create-calificaciones.js
  backend/migrations/011-create-tareas.js
  backend/migrations/012-create-entrega-tareas.js
  backend/migrations/013-create-notificaciones-log.js
  backend/seeders/001-usuarios.js
  backend/seeders/002-cursos.js
  backend/seeders/003-docentes.js
  backend/seeders/004-estudiantes.js
  backend/seeders/005-tutores.js
  backend/seeders/006-estudiante-tutor.js
  backend/seeders/007-materias.js
  backend/seeders/008-docente-materia.js
MODIFICAR:
  .gitignore (raíz) — agregar venv/
```

**Depende de:** Nada (es la base del proyecto)

**Estado:** COMPLETADO

---

### CHANGE-002: backend-auth-jwt

**Descripción:**
Implementar el módulo de autenticación JWT en el backend: modelo Usuario, controlador
de login/logout con bcrypt, middleware de validación de token, gestión de roles
(admin, docente, tutor) embebida en el payload. Rutas protegidas devuelven 401 sin token.

**HU asociadas:** HU-001, HU-002

**Archivos:**
```
CREAR:
  backend/modules/auth/auth.model.js
  backend/modules/auth/auth.controller.js
  backend/modules/auth/auth.routes.js
  backend/modules/auth/auth.middleware.js
MODIFICAR:
  backend/app.js — montar rutas /api/auth
```

**Depende de:** CHANGE-001 (necesita tabla `usuarios`)

**Estado:** COMPLETADO — 2026-05-15

---

### CHANGE-003: frontend-auth-complete

**Descripción:**
Conectar el Login.jsx existente con el backend via Axios, crear AuthContext para
gestión global de sesión (JWT en localStorage), implementar servicio API con
interceptor que adjunta token automáticamente, y sistema de rutas protegidas
según rol usando React Router v7.

**HU asociadas:** HU-001, HU-002

**Archivos:**
```
CREAR:
  frontend/src/services/api.js
  frontend/src/context/AuthContext.jsx
  frontend/src/components/ProtectedRoute.jsx
  frontend/src/components/Layout.jsx
  frontend/src/pages/Dashboard.jsx
MODIFICAR:
  frontend/src/main.jsx — envolver con AuthProvider
  frontend/src/App.jsx — agregar Router y rutas protegidas
  frontend/src/pages/Login.jsx — conectar a /api/auth/login
```

**Depende de:** CHANGE-002 (backend auth listo)

**Estado:** COMPLETADO — 2026-05-15

---

### FASE 1 — BACKEND API COMPLETA

---

### CHANGE-004: backend-absences

**Descripción:**
Módulo CRUD de inasistencias con validación RN-03 (máximo 2 días hábiles de atraso),
endpoint de historial por alumno con porcentaje calculado, detección de alumnos
en riesgo de regularidad (>20% inasistencias, RN-02), y endpoint para marcar
inasistencia como justificada (asociada a certificado, RN-13). El modelo Inasistencia
incluye campo `justificada` (boolean) y `certificado_id` (FK opcional).

**HU asociadas:** HU-004, HU-005, HU-006, HU-019

**Archivos:**
```
CREAR:
  backend/modules/absences/absence.model.js
  backend/modules/absences/absence.controller.js
  backend/modules/absences/absence.routes.js
MODIFICAR:
  backend/app.js — montar rutas /api/absences
```

**Depende de:** CHANGE-002 (middleware auth), CHANGE-001 (tabla `inasistencias`)

**Estado:** COMPLETADO — 2026-05-18

---

### CHANGE-005: backend-grades

**Descripción:**
Módulo CRUD de calificaciones con cálculo de promedio por alumno/materia, flag
automático de nota crítica (<=4, RN-04) para alertas, y detección de promedio
general <6 (RN-05).

**HU asociadas:** HU-007, HU-008

**Archivos:**
```
CREAR:
  backend/modules/grades/grade.model.js
  backend/modules/grades/grade.controller.js
  backend/modules/grades/grade.routes.js
MODIFICAR:
  backend/app.js — montar rutas /api/grades
```

**Depende de:** CHANGE-002, CHANGE-001

**Estado:** COMPLETADO — 2026-05-18

---

### CHANGE-006: backend-tasks

**Descripción:**
Módulo CRUD de tareas y registro de entregas por alumno. Incluye lógica de
detección de 2 tareas consecutivas no entregadas en la misma materia (RN-06)
para alimentar el sistema de alertas.

**HU asociadas:** HU-009

**Archivos:**
```
CREAR:
  backend/modules/tasks/task.model.js
  backend/modules/tasks/task.controller.js
  backend/modules/tasks/task.routes.js
  backend/modules/tasks/student_task.model.js
MODIFICAR:
  backend/app.js — montar rutas /api/tasks
```

**Depende de:** CHANGE-002, CHANGE-001

**Estado:** COMPLETADO — 2026-05-18

---

### CHANGE-008: backend-tutors-portal

**Descripción:**
Endpoints para el portal de padres/tutores: consulta de datos de hijos registrados
(solo los propios — RN-09), resumen consolidado con inasistencias, calificaciones
por materia y tareas pendientes.

**HU asociadas:** HU-018

**Archivos:**
```
CREAR:
  backend/modules/tutors/tutor.model.js
  backend/modules/tutors/tutor.controller.js
  backend/modules/tutors/tutor.routes.js
MODIFICAR:
  backend/app.js — montar rutas /api/tutors
```

**Depende de:** CHANGE-002, CHANGE-001, CHANGE-004 (datos de inasistencias)

**Estado:** COMPLETADO — 2026-05-18

**Estado:** COMPLETADO — 2026-05-18

---

### CHANGE-008: backend-tutors-portal

**Descripción:**
Endpoints para el portal de padres/tutores: consulta de datos de hijos registrados
(solo los propios — RN-09), resumen consolidado con inasistencias, calificaciones
por materia y tareas pendientes.

**HU asociadas:** HU-018

**Archivos:**
```
CREAR:
  backend/modules/tutors/tutor.model.js
  backend/modules/tutors/tutor.controller.js
  backend/modules/tutors/tutor.routes.js
MODIFICAR:
  backend/app.js — montar rutas /api/tutors
```

**Depende de:** CHANGE-002, CHANGE-001, CHANGE-004, CHANGE-005, CHANGE-006

**Estado:** COMPLETADO — 2026-05-18

---

### FASE 1B — BACKEND NUEVOS MÓDULOS

---

### CHANGE-019: backend-analytics

**Descripción:**
Tablero de analítica con endpoint `/api/analytics/student/:id` que retorna evolución
de inasistencias (desglose mensual justificadas/no justificadas, alertas RN-01 y RN-02)
y evolución de calificaciones (por materia, por trimestre, promedio general, alertas
RN-04 y RN-05). Acceso segmentado por rol según RN-16.

**HU asociadas:** HU-020, HU-021

**Archivos:**
```
CREAR:
  backend/modules/analytics/analytics.controller.js
  backend/modules/analytics/analytics.routes.js
MODIFICAR:
  backend/app.js — montar rutas /api/analytics
```

**Depende de:** CHANGE-002 (auth), CHANGE-004 (absences), CHANGE-005 (grades)

**Estado:** COMPLETADO — 2026-05-18

---

### CHANGE-021: backend-communication

**Descripción:**
Módulo de comunicación interna. Endpoints para crear mensajes, listar conversaciones
por usuario, marcar como leído. Tabla `mensajes` con: id, emisor_id, receptor_id,
receptor_tipo (docente/preceptor/secretaria), asunto, cuerpo, leido, created_at.
Valida RN-14 (destinatarios permitidos, no conversaciones entre familias).

**HU asociadas:** HU-022, HU-023

**Archivos:**
```
CREAR:
  backend/modules/communication/message.model.js
  backend/modules/communication/message.controller.js
  backend/modules/communication/message.routes.js
MODIFICAR:
  backend/app.js — montar rutas /api/communication
```

**Depende de:** CHANGE-002 (auth)

**Estado:** COMPLETADO — 2026-05-18

---

### CHANGE-023: backend-certificates

**Descripción:**
Módulo de certificados digitales. Endpoint de upload (multer + Cloudinary, máx 5MB),
listado de certificados pendientes por alumno, aceptar/rechazar con comentario.
Tabla `certificados`. Al aceptar, marca automáticamente la inasistencia asociada
como justificada (RN-13). Extiende modelo `Inasistencia` con campo `justificada` y
FK `certificado_id`.

**HU asociadas:** HU-024, HU-025, HU-019

**Archivos:**
```
CREAR:
  backend/modules/certificates/certificate.model.js
  backend/modules/certificates/certificate.controller.js
  backend/modules/certificates/certificate.routes.js
MODIFICAR:
  backend/app.js — montar rutas /api/certificates
  backend/models/Inasistencia.js — agregar justificada, certificado_id
```

**Depende de:** CHANGE-002 (auth), CHANGE-004 (tabla inasistencias)

**Estado:** COMPLETADO — 2026-05-18

---

### FASE 2 — FRONTEND COMPLETO

---

### CHANGE-009: frontend-absences-pages

**Descripción:**
Páginas de gestión de inasistencias: registro diario con selector de curso y tabla
de alumnos (checkboxes), historial por alumno con porcentaje y alerta visual de
riesgo, edición con registro de auditoría, y panel de justificación con toggle
justificada/no justificada y referencia a certificado.

**HU asociadas:** HU-004, HU-005, HU-006, HU-019

**Archivos:**
```
CREAR:
  frontend/src/pages/AbsenceRegister.jsx
  frontend/src/pages/AbsenceHistory.jsx
  frontend/src/components/StudentTable.jsx
  frontend/src/components/CourseSelector.jsx
MODIFICAR:
  frontend/src/App.jsx — agregar rutas
```

**Depende de:** CHANGE-003 (auth), CHANGE-004 (backend absences)

**Estado:** PROPUESTO

---

### CHANGE-010: frontend-grades-pages

**Descripción:**
Páginas de calificaciones: carga de notas por materia y período (solo materias
asignadas al docente), vista de promedios con resaltado visual para alumnos
con promedio <6.

**HU asociadas:** HU-007, HU-008

**Archivos:**
```
CREAR:
  frontend/src/pages/GradeEntry.jsx
  frontend/src/pages/GradeOverview.jsx
  frontend/src/components/GradeTable.jsx
  frontend/src/components/GradeChart.jsx
MODIFICAR:
  frontend/src/App.jsx — agregar rutas
```

**Depende de:** CHANGE-003, CHANGE-005

**Estado:** PROPUESTO

---

### CHANGE-011: frontend-tasks-pages

**Descripción:**
Páginas de gestión de tareas: creación con nombre y fechas, listado por materia,
marcado individual de entrega por alumno, indicador de 2 tareas consecutivas
no entregadas.

**HU asociadas:** HU-009

**Archivos:**
```
CREAR:
  frontend/src/pages/TaskManager.jsx
  frontend/src/pages/TaskTracking.jsx
  frontend/src/components/TaskCard.jsx
  frontend/src/components/StudentTaskStatus.jsx
MODIFICAR:
  frontend/src/App.jsx — agregar rutas
```

**Depende de:** CHANGE-003, CHANGE-006

**Estado:** PROPUESTO

---

### CHANGE-012: frontend-teacher-dashboard

**Descripción:**
Dashboard del docente con panel de inasistencias de alumnos a cargo (filtro por
curso y alumnos críticos), y consulta de licencias disponibles con alerta visual
cuando quedan <=3 días.

**HU asociadas:** HU-010, HU-011

**Archivos:**
```
CREAR:
  frontend/src/pages/TeacherDashboard.jsx
  frontend/src/components/AbsencePanel.jsx
  frontend/src/components/LicenseStatus.jsx
  frontend/src/components/RiskBadge.jsx
MODIFICAR:
  frontend/src/App.jsx — agregar ruta
```

**Depende de:** CHANGE-003, CHANGE-007

**Estado:** PROPUESTO

---

### CHANGE-013: frontend-parent-portal

**Descripción:**
Portal del padre/tutor con login, vista de resumen académico del hijo: inasistencias,
calificaciones por materia, tareas pendientes. Solo muestra datos de los hijos
registrados (RN-09).

**HU asociadas:** HU-018

**Archivos:**
```
CREAR:
  frontend/src/pages/ParentDashboard.jsx
  frontend/src/components/AcademicSummary.jsx
  frontend/src/components/ChildSelector.jsx
  frontend/src/components/AbsenceGauge.jsx
MODIFICAR:
  frontend/src/App.jsx — agregar ruta
```

**Depende de:** CHANGE-003, CHANGE-008

**Estado:** PROPUESTO

---

### FASE 2B — FRONTEND NUEVOS MÓDULOS

---

### CHANGE-020: frontend-analytics

**Descripción:**
Tablero de analítica con gráficos (Recharts): evolución de inasistencias (barras
apiladas justificadas/no justificadas, alertas RN-01 y RN-02), evolución de notas
(líneas por materia, filtros por materia y trimestre, alertas RN-04 y RN-05).
Acceso por rol (RN-16): padre ve solo sus hijos, docente sus alumnos, etc.
Respeta DESIGN.md (vibrant_scholastic) y las skills de frontend (taste, impeccable,
EmilKowalski animations con Framer Motion).

**HU asociadas:** HU-020, HU-021

**Archivos:**
```
CREAR:
  frontend/src/pages/AnalyticsDashboard.jsx
  frontend/src/components/Analytics/AbsenceChart.jsx
  frontend/src/components/Analytics/GradeChart.jsx
  frontend/src/components/Analytics/AlertBanner.jsx
  frontend/src/components/Analytics/FilterBar.jsx
MODIFICAR:
  frontend/src/App.jsx — agregar ruta /analytics
```

**Depende de:** CHANGE-003 (auth), CHANGE-019 (backend analytics)

**Estado:** PROPUESTO

---

### CHANGE-022: frontend-communication

**Descripción:**
Bandeja de entrada para personal con contador de no leídos, formulario de nuevo
mensaje para padres con selector de destinatario (docente/preceptor/secretaria),
hilo de conversación con timestamps. Animaciones EmilKowalski style con Framer
Motion (entrada/salida de mensajes, transiciones de estado leído/no leído).
Respeta DESIGN.md (vibrant_scholastic).

**HU asociadas:** HU-022, HU-023

**Archivos:**
```
CREAR:
  frontend/src/pages/Inbox.jsx
  frontend/src/pages/NewMessage.jsx
  frontend/src/components/ConversationThread.jsx
  frontend/src/components/MessageBubble.jsx
  frontend/src/components/RecipientSelector.jsx
MODIFICAR:
  frontend/src/App.jsx — agregar rutas /inbox, /messages/new
```

**Depende de:** CHANGE-003 (auth), CHANGE-021 (backend communication)

**Estado:** PROPUESTO

---

### CHANGE-024: frontend-certificates

**Descripción:**
Portal de certificados: formulario de carga con preview del archivo (padre/tutor),
lista de certificados enviados con pill de estado (pendiente/aceptado/rechazado),
panel de revisión para preceptor/admin con previsualización inline. Al aceptar,
la inasistencia se marca como justificada (RN-13). Respeta DESIGN.md y skills
de frontend.

**HU asociadas:** HU-024, HU-025

**Archivos:**
```
CREAR:
  frontend/src/pages/CertificateUpload.jsx
  frontend/src/pages/CertificateReview.jsx
  frontend/src/components/CertificateCard.jsx
  frontend/src/components/CertificatePreview.jsx
  frontend/src/components/StatusBadge.jsx
MODIFICAR:
  frontend/src/App.jsx — agregar rutas /certificates, /certificates/review
```

**Depende de:** CHANGE-003 (auth), CHANGE-023 (backend certificates)

**Estado:** PROPUESTO

---

### FASE 3 — AGENTE PYTHON + WHATSAPP

---

### CHANGE-014: agent-db-reader

**Descripción:**
Implementar el lector de base de datos del agente Python con psycopg2. Funciones
de consulta para cada condición de alerta: inasistencias del mes (RN-01),
porcentaje anual (RN-02), notas críticas (RN-04), promedio bajo (RN-05),
tareas consecutivas no entregadas (RN-06), licencias por vencer (RN-07). Pool
de conexiones PostgreSQL reutilizable.

**HU asociadas:** HU-017 (base para todas las notificaciones)

**Archivos:**
```
CREAR:
  agent/db.py — pool de conexiones PostgreSQL
MODIFICAR:
  agent/tasks/db_reader.py — reescribir con consultas reales PostgreSQL
  requirements.txt (raíz) — agregar psycopg2-binary, pandas, python-dotenv
```

**Depende de:** CHANGE-001 (schema DB confirmado)

**Estado:** PROPUESTO

---

### CHANGE-015: agent-notifier

**Descripción:**
Implementar el módulo de notificaciones WhatsApp del agente: templates de mensajes
por tipo de alerta (inasistencias, notas, tareas, licencias), verificación de
unicidad contra `notificaciones_log` antes de enviar (RN-11), registro de cada
notificación con estado y timestamp.

> **Provider WhatsApp:** Pendiente de definición. Opciones: Twilio (SDK `twilio`) o
> Meta WhatsApp Business API (vía `requests` HTTP directo). Definir cuando se
> implemente este change.

**HU asociadas:** HU-012, HU-013, HU-014, HU-015, HU-016, HU-017

**Archivos:**
```
CREAR:
  agent/whatsapp_client.py — cliente WhatsApp (provider por definir)
MODIFICAR:
  agent/tasks/notifier.py — reescribir con templates y registro
  requirements.txt (raíz) — agregar dependencia según provider elegido
```

**Depende de:** CHANGE-014 (datos de alerta), CHANGE-001 (tabla `notificaciones_log`)

> ⚠️ **Nota:** Este change depende de una decisión técnica externa (provider WhatsApp).
> Mientras tanto, CHANGE-016 puede avanzar independientemente — el scheduler
> evalúa reglas y delega el envío al notifier, que queda como hook sin implementar.

**Estado:** PROPUESTO

---

### CHANGE-016: agent-scheduler-openspec

**Descripción:**
Implementar el scheduler del agente (lunes-viernes 07-20hs, ciclo cada 1h, RN-10),
wrapper que evalúa todas las condiciones RN-01 a RN-07 en cada ciclo, y spec
OpenSpec en `openspec/specs/agent-notifier/spec.md` declarando tools del agente
(consultar_inasistencias, consultar_calificaciones_criticas, etc.) con mapeo
a las funciones Python implementadas.

**HU asociadas:** HU-012 a HU-017 (todas las notificaciones)

**Archivos:**
```
CREAR:
  agent/main.py — reescribir con scheduler y evaluación de reglas
  agent/scheduler/scheduler.py — programación y control de ventana horaria
  agent/openspec_wrapper.py — parser de spec YAML + ejecutor de tools
  openspec/specs/agent-notifier/spec.md — spec declarativo del agente
MODIFICAR:
  openspec/config.yaml — enriquecer con reglas de negocio
  requirements.txt (raíz) — agregar schedule
```

**Depende de:** CHANGE-014 (lectura DB). CHANGE-015 es dependencia blanda — el scheduler puede implementarse con el notifier como hook pendiente.

**Estado:** PROPUESTO

---

### FASE 4 — CIERRE

---

### CHANGE-017: testing-validation

**Descripción:**
Pruebas de todas las capas: tests unitarios y de integración del backend con
Jest/supertest (auth, CRUD, reglas RN-01 a RN-07, permisos por rol, RN-11),
tests del agente Python con pytest (mock DB y notifier mock), y validación de
seguridad (inputs, JWT, CORS). Corrección de bugs encontrados.

**HU asociadas:** Todas (validación de cumplimiento)

**Archivos:**
```
CREAR:
  backend/tests/auth.test.js
  backend/tests/absences.test.js
  backend/tests/grades.test.js
  backend/tests/tasks.test.js
  backend/tests/teachers.test.js
  backend/tests/tutors.test.js
  agent/tests/test_db_reader.py
  agent/tests/test_notifier.py
  agent/tests/test_scheduler.py
  frontend/src/__tests__/Login.test.jsx
  frontend/src/__tests__/AuthContext.test.jsx
```

**Depende de:** CHANGE-002 a CHANGE-016 (sistema completo)

**Estado:** PROPUESTO

---

### CHANGE-018: deployment-production

**Descripción:**
Despliegue en infraestructura cloud: frontend en Vercel, backend en Railway/Render,
base de datos PostgreSQL cloud, agente Python como worker (Railway Worker o cron),
variables de entorno configuradas, verificación end-to-end: registro de inasistencia
→ alerta → notificación WhatsApp real.

**HU asociadas:** Todas (puesta en producción)

**Archivos:**
```
CREAR:
  frontend/vercel.json
  backend/Procfile
```

**Depende de:** CHANGE-017 (sistema probado)

**Estado:** PROPUESTO

---

## Diagrama de Dependencias

```
CHANGE-001 (database-schema)
  ├── CHANGE-002 (backend-auth-jwt)
  │     ├── CHANGE-003 (frontend-auth-complete)
  │     │     ├── CHANGE-009 (frontend-absences-pages)
  │     │     ├── CHANGE-010 (frontend-grades-pages)
  │     │     ├── CHANGE-011 (frontend-tasks-pages)
  │     │     ├── CHANGE-012 (frontend-teacher-dashboard)
  │     │     ├── CHANGE-013 (frontend-parent-portal)
  │     │     ├── CHANGE-020 (frontend-analytics)
  │     │     ├── CHANGE-022 (frontend-communication)
  │     │     └── CHANGE-024 (frontend-certificates)
  │     │
  │     ├── CHANGE-004 (backend-absences) ───┘
  │     │     └── CHANGE-023 (backend-certificates) ───┘
  │     │           └── CHANGE-024 (frontend-certificates)
  │     ├── CHANGE-005 (backend-grades) ──────┘
  │     │     └── CHANGE-019 (backend-analytics)
  │     │           └── CHANGE-020 (frontend-analytics)
  │     ├── CHANGE-006 (backend-tasks) ───────┘
  │     ├── CHANGE-007 (backend-teachers) ────┘
  │     │     └── CHANGE-008 (backend-tutors) ─┘
  │     ├── CHANGE-021 (backend-communication)
  │     │     └── CHANGE-022 (frontend-communication)
  │     ├── CHANGE-019 (backend-analytics) ───┘
  │     └── CHANGE-023 (backend-certificates) ─┘
  │
  ├── CHANGE-014 (agent-db-reader)
  │     └── CHANGE-015 (agent-notifier) ⚠️ provider TBD
  │           └── CHANGE-016 (agent-scheduler-openspec)
  │
  └── (todos confluyen en)
        └── CHANGE-017 (testing-validation)
              └── CHANGE-018 (deployment-production)
```

---

## Reglas de Negocio — Mapeo a Changes

| Regla | Descripción | Change |
|---|---|---|
| RN-01 | 3 inasistencias/mes → notificar | CHANGE-014, CHANGE-015 |
| RN-02 | >20% inasistencias → alerta regularidad | CHANGE-004, CHANGE-014, CHANGE-015 |
| RN-03 | Máx 2 días hábiles atrás para cargar | CHANGE-004 |
| RN-04 | Nota <=4 → notificar | CHANGE-005, CHANGE-014, CHANGE-015 |
| RN-05 | Promedio <6 → alerta crítica | CHANGE-005, CHANGE-014, CHANGE-015 |
| RN-06 | 2 tareas consecutivas no entregadas → alerta | CHANGE-006, CHANGE-014, CHANGE-015 |
| RN-07 | Licencias <=3 días → alertar docente | CHANGE-007, CHANGE-014, CHANGE-015 |
| RN-08 | Autenticación JWT + roles | CHANGE-002, CHANGE-003 |
| RN-09 | Datos confidenciales por tutor | CHANGE-008, CHANGE-013 |
| RN-10 | Agente solo lun-vie 07-20hs | CHANGE-016 |
| RN-11 | Una notificación por evento/día | CHANGE-015, CHANGE-016 |
| RN-12 | Analítica: evolución asistencias/calificaciones | CHANGE-019, CHANGE-020 |
| RN-13 | Inasistencias justificadas con certificado | CHANGE-004, CHANGE-023, CHANGE-009, CHANGE-024 |
| RN-14 | Comunicación interna con registro | CHANGE-021, CHANGE-022 |
| RN-15 | Certificados digitales con upload y validación | CHANGE-023, CHANGE-024 |
| RN-16 | Analítica: acceso segmentado por rol | CHANGE-019, CHANGE-020 |

---

## Stack Tecnológico Definitivo

| Capa | Tecnología | Versión |
|---|---|---|
| Frontend | React + Vite + Chakra UI | React 19, Vite 8, Chakra UI v3 |
| Backend | Node.js + Express + Sequelize | Node 18+, Express 4, Sequelize 6 |
| Base de datos | PostgreSQL | 15+ |
| Agente | Python + psycopg2 + schedule | Python 3.10+ |
| Notificaciones | WhatsApp API (provider TBD) | — |
| Autenticación | JWT + bcryptjs | — |
| Agentes IA | OpenSpec (wrapper manual) | — |
| Deploy frontend | Vercel | — |
| Deploy backend | Railway / Render | — |
| Control versiones | GitHub (main/develop/feature/*) | — |

---

## Notas sobre la Arquitectura OpenSpec

La integración con OpenSpec es **manual** (no SDK Python). El agente Python:
1. Lee el spec YAML en `openspec/specs/agent-notifier/spec.md`
2. Mapea tools declaradas a funciones Python concretas (db_reader, notifier)
3. El scheduler ejecuta el ciclo de evaluación cada 1h en ventana hábil

El spec YAML es la fuente de verdad para el comportamiento del agente,
separando el QUÉ (declarativo) del CÓMO (implementación Python).

**Patrón de componentes:** Atomic Design (átomos → moléculas → organismos → páginas)
en todos los módulos frontend.

**ESM:** Backend usa `"type": "module"` en package.json (import/export).

---

*Última actualización: 2026-05-18*
*Estado: FASE 1 COMPLETA ✅ — CHANGE-004,005,006,007,008 completados y probados (57/57 tests)*

> **Nota:** CHANGE-019 a CHANGE-024 añadidos para cubrir Módulo 7 (Analítica, HU-020/021),
> Módulo 8 (Comunicación Interna, HU-022/023) y Módulo 9 (Certificados Digitales,
> HU-024/025). HU-019 (Justificación) integrada en CHANGE-004 + CHANGE-023.
> Total: 24 changes planificados.
