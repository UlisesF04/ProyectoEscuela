# CHANGES.md — ProyectoEscuela
## Mapa Completo de Cambios — Arquitectura SDD

> **Propósito**: Este documento define el roadmap completo de desarrollo del sistema
> de Gestión Académica y Comunicación Escolar, organizado en changes con dependencias
> explícitas, historias de usuario asociadas y archivos afectados.

---

## Estado General del Proyecto

```
FASE 0 — Fundaciones            [✅⬜⬜⬜⬜⬜⬜⬜⬜⬜]  10%
FASE 1 — Backend API            [⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜]   0%
FASE 2 — Frontend Completo      [⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜]   0%
FASE 3 — Agente + WhatsApp      [⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜]   0%
FASE 4 — Cierre                 [⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜]   0%
```

### Lo que ya existe (scaffolding inicial)

| Componente | Estado | Detalle |
|---|---|---|
| Backend `package.json` | ✅ Listo | express, sequelize, pg, bcryptjs, jsonwebtoken, cors, dotenv instalados |
| Backend `app.js` | ⚠️ Parcial | Express server + DB connect + health endpoint + error middleware. **Sin rutas de módulos** |
| Backend `config/database.js` | ✅ Listo | Conexión PostgreSQL vía Sequelize |
| Backend `.env.example` | ✅ Listo | Variables DB + JWT + Puerto |
| Frontend `package.json` | ✅ Listo | React 19 + Vite 8 + Chakra UI v3 + React Router v7 |
| Frontend `main.jsx` | ✅ Listo | ChakraProvider con `createSystem` |
| Frontend `App.jsx` | ⚠️ Parcial | Renderiza Login. **Sin routing** |
| Frontend `Login.jsx` | ⚠️ Parcial | Formulario estático. **Sin integración API** |
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
endpoint de historial por alumno con porcentaje calculado, y detección de alumnos
en riesgo de regularidad (>20% inasistencias, RN-02).

**HU asociadas:** HU-004, HU-005, HU-006

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

**Estado:** PROPUESTO

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

**Estado:** PROPUESTO

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

**Estado:** PROPUESTO

---

### CHANGE-007: backend-teachers-licenses

**Descripción:**
Módulo de gestión docente: endpoint de consulta de licencias (días disponibles vs
usados), lógica de alerta cuando quedan <=3 días (RN-07), y panel de inasistencias
acumuladas de los alumnos a cargo del docente (HU-011).

**HU asociadas:** HU-010, HU-011

**Archivos:**
```
CREAR:
  backend/modules/teachers/teacher.model.js
  backend/modules/teachers/teacher.controller.js
  backend/modules/teachers/teacher.routes.js
MODIFICAR:
  backend/app.js — montar rutas /api/teachers
```

**Depende de:** CHANGE-002, CHANGE-001, CHANGE-004 (datos de inasistencias)

**Estado:** PROPUESTO

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

**Estado:** PROPUESTO

---

### FASE 2 — FRONTEND COMPLETO

---

### CHANGE-009: frontend-absences-pages

**Descripción:**
Páginas de gestión de inasistencias: registro diario con selector de curso y tabla
de alumnos (checkboxes), historial por alumno con porcentaje y alerta visual de
riesgo, edición con registro de auditoría.

**HU asociadas:** HU-004, HU-005, HU-006

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
  │     │     └── CHANGE-013 (frontend-parent-portal)
  │     ├── CHANGE-004 (backend-absences) ───┘
  │     ├── CHANGE-005 (backend-grades) ──────┘
  │     ├── CHANGE-006 (backend-tasks) ───────┘
  │     └── CHANGE-007 (backend-teachers) ────┘
  │           └── CHANGE-008 (backend-tutors) ─┘
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

*Última actualización: 2026-05-15*
*Estado: MAPA COMPLETO - Pendiente de implementación*
