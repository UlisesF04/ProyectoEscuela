# CHANGES — Secuencia de Implementación

> Índice canónico de todos los changes del proyecto **Optimización de la Gestión Académica y Comunicación Escolar**.
> Cada change es atómico: un agente puede implementarlo en una sesión (~4-6 horas).
> **Leer este archivo antes de ejecutar cualquier `/opsx:propose`.**
> Actualizar los estados `[ ]` → `[x]` a medida que cada change se archiva con `/opsx:archive`.

---

## Cómo usar este documento

1. **Identificar** el change a implementar en la lista de fases. Leer su scope, dependencias y governance.
2. **Leer antes** los archivos de KB listados en cada change para tener contexto completo.
3. **Proponer** el change con `/opsx:propose C-NN-nombre-kebab`.
4. **Implementar** siguiendo el scope operacional (modelos, endpoints, migraciones, tests).
5. **Archivar** con `/opsx:archive C-NN` y marcar `[x]` en este documento.

---

## Árbol de dependencias

```
C-01 foundation-setup (done)
 └── C-02 core-models (done)
      └── C-03 auth-system
           └── C-04 admin-panel
                ├── C-05 attendance-module ──────┐
                ├── C-06 grades-module ──────────┤
                ├── C-07 tasks-module ───────────┤
                ├── C-09 teacher-leaves-module ──┘
                └── C-10 notification-agent ─── C-11 admin-dashboard-and-polish
```

C-12 devops-deployment es independiente y puede correr en paralelo desde GATE 2.

### Paralelismo por fase

**GATE 0**: C-01 ✓ — Base del monorepo lista
  → C-02 core-models                       [Agente A]

**GATE 1**: C-02 ✓ — Modelos core creados
  → C-03 auth-system                       [Agente A]

**GATE 2**: C-03 ✓ — Auth funcionando
  → C-04 admin-panel                       [Agente A]
  → C-12 devops-deployment                 [Agente B — paralelo, sin dep]

**GATE 3**: C-04 ✓ — Admin panel operativo ← **PRIMER FORK**
  → C-05 attendance-module                 [Agente A — Backend Core]
  → C-06 grades-module                     [Agente B — Backend Aux]
  → C-07 tasks-module                      [Agente C — Frontend]
  → C-09 teacher-leaves-module             [Agente B — si C-06 ✓]
  → C-10 notification-agent                [Agente A — si C-05 ✓]

**GATE 4**: C-05 + C-06 + C-07 ✓ — APIs académicas listas
  → C-08 parental-dashboard                [Agente C]

**GATE 5**: C-10 ✓ — Agente funcionando
  → C-11 admin-dashboard-and-polish        [Agente A]

### Camino crítico (6 changes — mínimo irreducible)

`C-01 → C-02 → C-03 → C-04 → C-10 → C-11`

Incluye el agente de notificaciones (diferenciador del proyecto). Sin él, el sistema es un CRUD escolar más.

### Plan óptimo con 3 agentes

| Paso | Agente A (Backend Core) | Agente B (Backend Aux)  | Agente C (Frontend)    |
|------|-------------------------|-------------------------|------------------------|
| 1    | C-01 foundation-setup   | —                       | —                      |
| 2    | C-02 core-models        | —                       | —                      |
| 3    | C-03 auth-system        | C-12 devops-deployment  | —                      |
| 4    | C-04 admin-panel        | —                       | —                      |
| 5    | C-05 attendance-module  | C-06 grades-module      | C-07 tasks-module      |
| 6    | C-10 notification-agent | C-09 teacher-leaves-mod | C-08 parental-dashbrd  |
| 7    | C-11 admin-dash-polish  | —                       | —                      |

---

## FASE 0 — Cimientos

> Base del monorepo: estructura de directorios, dependencias, configuración de BD, esqueleto de los 3 componentes.

### [C-01] `foundation-setup`
- **Estado**: `[x]` completado — 2026-05-26
- **Scope**:
  - Scaffolding de monorepo: `frontend/`, `backend/`, `agent/`, `openspec/`, `docs/`
  - `backend/package.json` con Express 4, Sequelize 6, jsonwebtoken, bcrypt, express-validator, express-rate-limit, cors, morgan
  - `frontend/package.json` con React 18, Vite, Chakra UI 2.x, React Router v6, axios
  - `agent/requirements.txt` con APScheduler, psycopg2-binary, twilio, pandas
  - `backend/config/database.js` — conexión PostgreSQL con Sequelize
  - `backend/app.js` — esqueleto Express con middlewares base (CORS, JSON parser, morgan, error handler)
  - `frontend/src/main.jsx` — esqueleto Vite + Chakra Provider + React Router
  - `agent/main.py` — esqueleto APScheduler con tarea placeholder
  - `.env.example` con todas las variables del proyecto
  - `vercel.json` para frontend SPA routing
  - Archivos `.gitignore` para cada componente
- **Dependencias**: ninguna
- **Governance**: BAJO
- **Leer antes**:
  - `knowledge-base/01_vision_y_objetivos.md`
  - `knowledge-base/08_arquitectura_propuesta.md` §Estructura de directorios
  - `knowledge-base/02_descripcion_general.md` §Stack tecnológico
  - `knowledge-base/11_despliegue_y_devops.md` §Variables de entorno

---

## FASE 1 — Núcleo del Sistema

> Modelos de datos, autenticación y panel administrativo. Sin esto nada más funciona.

### [C-02] `core-models`
- **Estado**: `[x]` completado — 2026-05-26
- **Scope**:
  - Modelos Sequelize: `User`, `Student`, `Course`, `Subject`, `TeacherSubject`, `ParentStudent` con todas las columnas del modelo de datos
  - Asociaciones: `User.hasMany(TeacherSubject)`, `Student.belongsTo(Course)`, etc.
  - Migración 001: tabla `users`
  - Migración 002: tablas `courses`, `subjects`, `teacher_subject`, `students`, `parent_student`
  - Repositorios: `userRepository`, `studentRepository`, `courseRepository`, `subjectRepository`
  - Seed data: 1 admin, 1 preceptor, 1 docente, 1 padre, 1 alumno, 1 curso, 2 materias, asignación docente, vínculo padre-alumno
  - Tests: conexión DB, creación de modelos, seed data
- **Dependencias**: `C-01`
- **Governance**: CRITICO (modelos core referenciados por todo el sistema)
- **Leer antes**:
  - `knowledge-base/04_modelo_de_datos.md` §Entidades (todas)
  - `knowledge-base/04_modelo_de_datos.md` §Seed data inicial
  - `knowledge-base/08_arquitectura_propuesta.md` §Repository Pattern, §Transaction Atomicity

### [C-03] `auth-system`
- **Estado**: `[x]` completado — 2026-05-26
- **Scope**:
  - Módulo backend `modules/auth/`: routes, controller, service
  - `POST /api/v1/auth/login` — autenticación con email+password, bcrypt verify, JWT (HS256, 8h exp)
  - `POST /api/v1/auth/logout` — invalidación cliente-side (elimina token del estado)
  - `GET /api/v1/auth/me` — devuelve usuario autenticado desde JWT payload
  - Middlewares: `authMiddleware` (extrae y valida JWT), `roleMiddleware(roles...)`, `validationMiddleware` (express-validator)
  - `errorMiddleware` — AppError personalizado con códigos HTTP
  - Rate limiting: 10 intentos/15min en `/auth/login`, 100/15min global
  - Frontend: `AuthContext` (Context API + useReducer), `authService.js` (axios), `AppRoutes.jsx`, `ProtectedRoute.jsx`
  - `LoginPage.jsx` — formulario con validación, mensajes de error, redirección por rol
  - Tests: login exitoso, credenciales inválidas, cuenta desactivada, rate limit, ruta protegida sin token
  - Reglas de negocio cubiertas: RN-01, RN-02
- **Dependencias**: `C-02`
- **Governance**: CRITICO (seguridad del sistema, todos los endpoints dependen de auth)
- **Leer antes**:
  - `knowledge-base/05_reglas_de_negocio.md` §Autenticación y Acceso (RN-AU)
  - `knowledge-base/07_flujos_principales.md` §Flujo 1: Inicio de sesión
  - `knowledge-base/08_arquitectura_propuesta.md` §Seguridad, §Middleware Chain, §Context + Provider
  - `knowledge-base/03_actores_y_roles.md` §Matriz RBAC

### [C-04] `admin-panel`
- **Estado**: `[x]` completado — 2026-05-27
- **Scope**:
  - Módulo backend `modules/users/`: CRUD de usuarios con soft-delete (is_active) — ✅ IMPLEMENTADO
  - Módulo backend `modules/courses/`: CRUD de cursos y materias, asignación de materias a cursos
  - Módulo backend `modules/students/`: CRUD de alumnos, vinculación padre-alumno (`parent_student`)
  - Módulo backend `modules/subjects/`: asignación docente a materia (`teacher_subject`)
  - `POST /api/v1/users`, `GET /api/v1/users` con filtro por rol, `PUT /api/v1/users/:id`, `DELETE /api/v1/users/:id` (soft) — ✅ IMPLEMENTADO
  - `POST /api/v1/courses`, `GET /api/v1/courses`
  - `POST /api/v1/courses/:id/subjects`, `GET /api/v1/courses/:id/subjects`
  - `POST /api/v1/subjects/:id/teachers`, `GET /api/v1/subjects/:id/teachers`
  - `POST /api/v1/students`, `GET /api/v1/students`, `PUT /api/v1/students/:id`
  - `POST /api/v1/students/:id/parents`, `GET /api/v1/students/:id/parents`
  - Frontend: `AdminDashboard.jsx` con tabs/pages para Users, Courses, Students
  - Componentes: `DataTable.jsx` reutilizable, formularios CRUD con Chakra UI
  - Validación: express-validator en todos los endpoints POST/PUT
  - Tests: CRUD usuarios, cursos, alumnos; duplicado de email; vínculo padre-alumno
  - Reglas de negocio: RN-01, RN-03
- **Dependencias**: `C-03`
- **Governance**: CRITICO (base de datos maestra del sistema, define usuarios y estructura académica)
- **Leer antes**:
  - `knowledge-base/06_funcionalidades.md` §Épica 2: Gestión de Usuarios y Configuración
  - `knowledge-base/03_actores_y_roles.md` §Matriz RBAC
  - `knowledge-base/04_modelo_de_datos.md` §Entidades users, students, parent_student, courses, subjects, teacher_subject
  - `knowledge-base/08_arquitectura_propuesta.md` §Frontend: AdminDashboard

---

## FASE 2 — Gestión Académica

> Asistencias, calificaciones y tareas. El corazón operativo del sistema.

### [C-05] `attendance-module`
- **Estado**: `[ ]` pendiente
- **Scope**:
  - Módulo backend `modules/attendances/`: CRUD asistencias + justificación + subida de certificados
  - Modelo Sequelize `Attendance` con índices UNIQUE(student_id, date)
  - `POST /api/v1/attendances` — registro por alumno+fecha (rechaza duplicados con 409)
  - `PUT /api/v1/attendances/:id` — editar estado (presente/ausente/tarde)
  - `PUT /api/v1/attendances/:id/justify` — justificar inasistencia (irreversible, RN-07)
  - `GET /api/v1/students/:id/attendances` — historial con resumen de totales (RN-09)
  - `POST /api/v1/certificates/upload` — subida de archivo JPG/PNG/PDF ≤ 5MB
  - Endpoint batch opcional para registro masivo por curso
  - Frontend: `PreceptorDashboard.jsx` con `AttendanceGrid.jsx` — selector de curso+fecha, grilla de alumnos con estados, resumen de totales
  - Resumen de asistencia: total días, ausencias, justificadas, no justificadas
  - Tests: registro, duplicado, justificación irreversible, subida certificado, permisos preceptor/docente/padre
  - Reglas de negocio: RN-05, RN-06, RN-07, RN-08, RN-09
- **Dependencias**: `C-04`
- **Governance**: MEDIO (flujo con estado, subida de archivos)
- **Leer antes**:
  - `knowledge-base/07_flujos_principales.md` §Flujo 2: Registro de asistencia diaria, §Flujo 5: Justificación
  - `knowledge-base/06_funcionalidades.md` §Épica 3: Gestión de Asistencias
  - `knowledge-base/05_reglas_de_negocio.md` §Asistencias (RN-AS)
  - `knowledge-base/04_modelo_de_datos.md` §attendances
  - `knowledge-base/10_preguntas_abiertas.md` IN-01 (almacenamiento certificados)

### [C-06] `grades-module`
- **Estado**: `[ ]` pendiente
- **Scope**:
  - Módulo backend `modules/grades/`: CRUD calificaciones
  - Modelo Sequelize `Grade` con CHECK(1.00 ≤ value ≤ 10.00)
  - `POST /api/v1/grades` — carga de nota con verificación de asignación docente (RN-04)
  - `PUT /api/v1/grades/:id`, `DELETE /api/v1/grades/:id` — solo docente propietario (RN-12)
  - `GET /api/v1/students/:id/grades` — historial por materia y período (con filtros)
  - Validaciones: rango 1-10 (RN-10), período válido (RN-11), materia asignada (RN-04)
  - Frontend: `DocenteDashboard.jsx` sección calificaciones — selector de materia, alumno, período; `GradeForm.jsx` con validación cliente
  - Tests: carga exitosa, fuera de rango, materia no asignada, período inválido, edición por otro docente 403
  - Reglas de negocio: RN-04, RN-10, RN-11, RN-12
- **Dependencias**: `C-04`
- **Governance**: MEDIO (datos académicos sensibles, pero solo CRUD con validación)
- **Leer antes**:
  - `knowledge-base/07_flujos_principales.md` §Flujo 3: Carga de calificación
  - `knowledge-base/06_funcionalidades.md` §Épica 4: Calificaciones
  - `knowledge-base/05_reglas_de_negocio.md` §Calificaciones (RN-CA)
  - `knowledge-base/04_modelo_de_datos.md` §grades

### [C-07] `tasks-module`
- **Estado**: `[ ]` pendiente
- **Scope**:
  - Módulo backend `modules/tasks/`: CRUD tareas + submissions
  - Modelos Sequelize: `Task`, `TaskSubmission` con UNIQUE(task_id, student_id)
  - `POST /api/v1/tasks` — creación con transacción atómica: crea tarea + submissions para todos los alumnos del curso (RN-14)
  - `PUT /api/v1/tasks/:id`, `DELETE /api/v1/tasks/:id` — solo docente propietario
  - `GET /api/v1/subjects/:id/tasks` — tareas de una materia
  - `PUT /api/v1/tasks/:taskId/submissions/:studentId` — cambiar estado (pendiente→entregada/tarde, unidireccional RN-15)
  - `GET /api/v1/students/:id/tasks` — tareas de un alumno con estado de entrega
  - Validaciones: due_date >= today (RN-13), materia asignada al docente (RN-04)
  - Frontend: `DocenteDashboard.jsx` sección tareas — formulario creación, listado con estados, selector de estado de entrega
  - Tests: creación atómica con transacción, rollback en fallo, máquina de estados unidireccional, permisos
  - Reglas de negocio: RN-04, RN-13, RN-14, RN-15
- **Dependencias**: `C-04`
- **Governance**: MEDIO (transacción atómica, máquina de estados)
- **Leer antes**:
  - `knowledge-base/07_flujos_principales.md` §Flujo 6: Creación de tarea con generación automática de submissions
  - `knowledge-base/06_funcionalidades.md` §Épica 5: Tareas y Entregas
  - `knowledge-base/05_reglas_de_negocio.md` §Tareas (RN-TA)
  - `knowledge-base/04_modelo_de_datos.md` §tasks, §task_submissions
  - `knowledge-base/08_arquitectura_propuesta.md` §Transaction Atomicity

---

## FASE 3 — Portal Parental

> Dashboard para padres con consulta de datos de sus hijos y subida de certificados.

### [C-08] `parental-dashboard`
- **Estado**: `[ ]` pendiente
- **Scope**:
  - Frontend: `PadreDashboard.jsx` con tabs/secciones para Notas, Asistencias, Tareas, Subir Certificado
  - Sección `ChildGrades` — tabla de calificaciones por materia y período con promedio (consume `GET /api/v1/students/:id/grades`)
  - Sección `ChildAttendances` — historial de asistencias por fecha con resumen de totales (consume `GET /api/v1/students/:id/attendances`)
  - Sección `ChildTasks` — listado de tareas con estado de entrega y fecha de vencimiento, filtro por pendientes (consume `GET /api/v1/students/:id/tasks`)
  - Sección `UploadCertificate` — formulario de subida de certificado para inasistencia no justificada (consume `POST /api/v1/certificates/upload`)
  - Filtro por hijo si el padre tiene múltiples alumnos vinculados
  - Guardias RN-03: cada vista verifica que el alumno esté vinculado al padre (backend 403 + frontend oculta)
  - Tests: visualización de datos del hijo vinculado, 403 para alumno no vinculado, subida de certificado
- **Dependencias**: `C-05`, `C-06`, `C-07`
- **Governance**: BAJO (solo lectura + subida de archivos, sin lógica de negocio crítica)
- **Leer antes**:
  - `knowledge-base/06_funcionalidades.md` §Épica 6: Consulta Parental
  - `knowledge-base/03_actores_y_roles.md` §Matriz RBAC (rol Padre), §Restricciones por actor
  - `knowledge-base/05_reglas_de_negocio.md` RN-03, RN-08
  - `knowledge-base/08_arquitectura_propuesta.md` §Frontend: PadreDashboard

---

## FASE 4 — Recursos Humanos

> Gestión de licencias docentes: solicitud, aprobación/rechazo y consulta.

### [C-09] `teacher-leaves-module`
- **Estado**: `[ ]` pendiente
- **Scope**:
  - Módulo backend `modules/teacher-leaves/`: CRUD licencias docentes
  - Modelo Sequelize `TeacherLeave` con CHECK(end_date >= start_date), cálculo automático de days_used
  - `POST /api/v1/teacher-leaves` — solicitud de licencia (docente), estado inicial 'pendiente'
  - `PUT /api/v1/teacher-leaves/:id/status` — aprobar/rechazar (solo admin, RN-19)
  - `GET /api/v1/teacher-leaves/me` — historial del docente autenticado con resumen de días
  - `GET /api/v1/teacher-leaves` — todas las licencias (admin)
  - Validaciones: end_date >= start_date (RN-20), solo admin puede cambiar status, solo docente puede crear
  - Frontend: formulario de solicitud en `DocenteDashboard.jsx`, panel de aprobación en `AdminDashboard.jsx`
  - Tests: solicitud exitosa, fechas inválidas, aprobación por no-admin 403, licencia ya procesada 409
  - Reglas de negocio: RN-19, RN-20
- **Dependencias**: `C-04`
- **Governance**: BAJO (CRUD simple con estados, sin integraciones externas)
- **Leer antes**:
  - `knowledge-base/06_funcionalidades.md` §Épica 8: Licencias Docentes
  - `knowledge-base/07_flujos_principales.md` §Flujo 7: Ciclo de vida de una licencia docente
  - `knowledge-base/05_reglas_de_negocio.md` §Licencias Docentes (RN-LI)
  - `knowledge-base/04_modelo_de_datos.md` §teacher_leaves

---

## FASE 5 — Automatización Inteligente

> Agente Python de notificaciones vía WhatsApp. Diferenciador clave del proyecto.

### [C-10] `notification-agent`
- **Estado**: `[ ]` pendiente
- **Scope**:
  - `agent/main.py` — scheduler APScheduler con ejecución diaria (18:00 hs, lunes a viernes)
  - `agent/config.py` — variables de entorno: DATABASE_URL, TWILIO_*, AUSENCIA_UMBRAL
  - `agent/tasks/db_reader.py` — consultas SQL directas a PostgreSQL con psycopg2:
    - Alumnos con ≥ X inasistencias no justificadas (excluye ya notificados hoy RN-16)
    - Alumnos con ≥ 20% inasistencias sobre total del trimestre
    - Calificaciones < 4 registradas hoy
    - Tareas con vencimiento ≤ 2 días + no entregadas
    - Licencias aprobadas con vencimiento ≤ 3 días
  - `agent/tasks/notifier.py` — envío de WhatsApp vía Twilio SDK, registro en notification_logs
  - `agent/tasks/alert_engine.py` — evaluación de condiciones y orquestación de las 5 alertas
  - Endpoint interno `POST /api/v1/notifications/trigger` (backend) para trigger manual con SERVICE_API_KEY
  - Modelo Sequelize `NotificationLog` con índices para consultas del agente
  - Migración 003: tabla `notification_logs`
  - `requirements.txt` actualizado con psycopg2-binary, twilio, apscheduler, pandas
  - Tests: consultas SQL, envío mockeado de Twilio, anti-spam (misma alerta no se reenvía en 24h)
  - Reglas de negocio: RN-16, RN-17, RN-18
  - Archivo `agent/scheduler/README.md` con instrucciones de ejecución y monitoreo
- **Dependencias**: `C-04` (necesita datos de usuarios, estudiantes y vínculos parentales)
- **Governance**: ALTO (integración externa Twilio, comunicación con familias, datos sensibles)
- **Leer antes**:
  - `knowledge-base/07_flujos_principales.md` §Flujo 4: Notificación automática de inasistencias críticas
  - `knowledge-base/06_funcionalidades.md` §Épica 7: Notificaciones Automáticas
  - `knowledge-base/05_reglas_de_negocio.md` §Notificaciones (RN-NO)
  - `knowledge-base/08_arquitectura_propuesta.md` §Lógica del agente automatizado, §DD-06
  - `knowledge-base/11_despliegue_y_devops.md` §Componente 3: Agente Python
  - `knowledge-base/10_preguntas_abiertas.md` Riesgo: aprobación Twilio WhatsApp Business

---

## FASE 6 — Cierre y Calidad

> Dashboard admin, infraestructura DevOps y pulido final de la UI.

### [C-11] `admin-dashboard-and-polish`
- **Estado**: `[ ]` pendiente
- **Scope**:
  - `AdminDashboard.jsx` — vista general con cards de resumen (usuarios activos, cursos, alertas)
  - Panel de logs de notificaciones: tabla con filtros por tipo, estado, fecha, destinatario
  - Configuración de umbral de ausencias críticas (RN-18) — persistencia en BD o env var
  - Error boundaries en frontend para cada dashboard
  - Estados vacíos (empty states) para tablas sin datos
  - Loading skeletons para componentes con carga asíncrona
  - Responsive: verificar que todos los dashboards funcionen en mobile (Chakra UI responsive props)
  - Ruta `/unauthorized` con mensaje claro por rol
  - Manejo de error 429 (rate limit) en frontend con mensaje amigable
  - Tests: integración de dashboard admin, visualización de logs
- **Dependencias**: `C-10` (para logs de notificaciones)
- **Governance**: BAJO (solo lectura + UI)
- **Leer antes**:
  - `knowledge-base/08_arquitectura_propuesta.md` §Frontend: AdminDashboard
  - `knowledge-base/06_funcionalidades.md` US-017–019 (notificaciones)
  - `knowledge-base/05_reglas_de_negocio.md` RN-18

### [C-12] `devops-deployment`
- **Estado**: `[ ]` pendiente
- **Scope**:
  - `.github/workflows/ci.yml` — tests backend + frontend lint+test en cada push y PR
  - `.github/workflows/agent-notifications.yml` — CRON schedule para agente Python (alternativa a Railway Worker)
  - Configuración Vercel: `vercel.json` con rewrites para SPA
  - Configuración Railway: `railway.json` para backend y worker
  - Script de migración automática: `npx sequelize-cli db:migrate` en deploy
  - `.env.production.example` con variables de producción
  - `README.md` raíz con instrucciones de deploy, vars de entorno requeridas, arquitectura general
  - Estrategia de ramas documentada: feature → develop → main
- **Dependencias**: `C-01` (necesita estructura del proyecto)
- **Governance**: BAJO (infraestructura, sin lógica de negocio)
- **Leer antes**:
  - `knowledge-base/11_despliegue_y_devops.md` completo
  - `knowledge-base/02_descripcion_general.md` §Integraciones externas
  - `knowledge-base/08_arquitectura_propuesta.md` §Estructura de directorios
