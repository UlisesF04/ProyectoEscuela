# CHANGES — Secuencia de Implementación

> Índice canónico de todos los changes del proyecto **Optimización de la Gestión Académica y Comunicación Escolar**.
> Cada change es atómico: un agente puede implementarlo en una sesión (~4-6 horas).
> **Leer este archivo antes de ejecutar cualquier `/opsx:propose`.**
> Actualizar los estados `[ ]` → `[x]` a medida que cada change se archiva con `/opsx:archive`.
>
> ⚠️ **Post-rediseño C-13 (OBLIGATORIO)**: Todos los changes nuevos que toquen frontend DEBEN revisar que las vistas y rutas se ajusten al diseño de C-13 (paleta Cozy Chocolate Cream, componentes compartidos, layout con DashboardLayout, routing por rol). Validar con el checklist de impeccable antes de dar por terminada cualquier tarea de UI.

---

## Cómo usar este documento

1. **Identificar** el change a implementar en la lista de fases. Leer su scope, dependencias y governance.
2. **Leer antes** los archivos de KB listados en cada change para tener contexto completo.
3. **Proponer** el change con `/opsx:propose C-NN-nombre-kebab`.
4. **Implementar** siguiendo el scope operacional (modelos, endpoints, migraciones, tests).
5. **Verificar diseño post-rediseño**: si el change toca frontend, revisar que las vistas y rutas sigan el diseño de C-13 (paleta Cozy Chocolate Cream, componentes compartidos, layout DashboardLayout). Ver con el checklist de impeccable.
6. **Archivar** con `/opsx:archive C-NN` y marcar `[x]` en este documento.

---

## Árbol de dependencias

```
C-01 foundation-setup (done)
 └── C-02 core-models (done)
      └── C-03 auth-system (done)
           └── C-04 admin-panel (done)
                ├── C-05 attendance-module (done)
                ├── C-06 grades-module (done)
                │    └── C-07 grades-evolution
                ├── C-08 parental-dashboard (done)
                ├── C-09 teacher-leaves-module
                 ├── C-10 notification-agent ─── C-11 admin-dashboard-and-polish (done)
                 ├── C-13 frontend-redesign (done)
                 └── C-14 production-audit-remediation (done)

C-12 devops-deployment es independiente y puede correr en paralelo desde GATE 2.
C-13 frontend-redesign es paralelo a toda la Fase 2-6 y depende solo de C-04.
C-14 production-audit-remediation COMPLETADO ✅. El proyecto está listo para producción.

### Paralelismo por fase

**GATE 0**: C-01 ✓ — Base del monorepo lista
  → C-02 core-models                       [Agente A]

**GATE 1**: C-02 ✓ — Modelos core creados
  → C-03 auth-system                       [Agente A]

**GATE 2**: C-03 ✓ — Auth funcionando
  → C-04 admin-panel                       [Agente A]
  → C-12 devops-deployment                 [Agente B — paralelo, sin dep]

**GATE 3**: C-04 ✓ — Admin panel operativo ← **PRIMER FORK**
  → C-05 attendance-module ✓              [Agente A — Backend Core]
  → C-06 grades-module ✓                   [Agente B — Backend Aux]
  → C-08 parental-dashboard ✓              [Agente C — si C-05 + C-06]
  → C-09 teacher-leaves-module             [Agente B — si C-06 ✓]
  → C-10 notification-agent                [Agente A — si C-05 ✓]
   → C-13 frontend-redesign ✓               [Agente D — Frontend UI]

**GATE 4**: C-06 ✓ — Módulo de calificaciones listo
  → C-07 grades-evolution                 [Agente C — sin bloqueo de otros changes]

**GATE 5**: C-10 — Agente funcionando
  → C-11 admin-dashboard-and-polish        [Agente A]

**GATE 6**: C-01..C-13 ✓ — Sistema completo
  → C-14 production-audit-remediation ✅   [Agente A — Seguridad]

### Camino crítico (7 changes — mínimo irreducible)

`C-01 → C-02 → C-03 → C-04 → C-10 → C-11 → C-14`

Incluye el agente de notificaciones automatizadas. Sin él, el sistema es un CRUD escolar más.

> C-13 frontend-redesign está fuera del camino crítico y corre en paralelo desde GATE 3.

### Plan óptimo con 4 agentes

| Paso | Agente A (Backend Core) | Agente B (Backend Aux)  | Agente C (Frontend)    | Agente D (Frontend UI)     |
|------|-------------------------|-------------------------|------------------------|----------------------------|
| 1    | C-01 foundation-setup ✓ | —                       | —                      | —                          |
| 2    | C-02 core-models ✓      | —                       | —                      | —                          |
| 3    | C-03 auth-system ✓      | C-12 devops-deployment  | —                      | —                          |
| 4    | C-04 admin-panel ✓      | —                       | —                      | —                          |
| 5    | C-05 attendance-module ✓| C-06 grades-module ✓    | C-08 parental-dashbrd ✓| C-13.0 theme ✓ + C-13.1 admin ✓|
| 6    | C-10 notification-agent | C-09 teacher-leaves-mod | C-07 grades-evolution  | C-13.2 preceptor ✓          |
| 7    | C-11 admin-dash-polish  | —                       | —                       | C-13.3 docente ✓ + C-13.4 padre ✓|
| 8    | —                       | —                       | —                       | C-13.5 shared ✓ + C-13.6 responsive ✓ + C-13.7 missing ✓|
| 9    | C-14.0 blockers ✅       | C-14.1 preventivos ✅    | C-14.2 perf-integridad ✅| —                        |

---

## FASE 0 — Cimientos

> Base del monorepo: estructura de directorios, dependencias, configuración de BD, esqueleto de los 3 componentes.

### [C-01] `foundation-setup`
- **Estado**: `[x]` completado — 2026-05-26
- **Scope**:
  - Scaffolding de monorepo: `frontend/`, `backend/`, `agent/`, `openspec/`, `docs/`
  - `backend/package.json` con Express 4, Sequelize 6, jsonwebtoken, bcrypt, express-validator, express-rate-limit, cors, morgan
  - `frontend/package.json` con React 18, Vite, Chakra UI 2.x, React Router v6, axios
  - `agent/requirements.txt` con APScheduler, psycopg2-binary, resend, pandas
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

> Asistencias, calificaciones y evolución académica. El corazón operativo del sistema.

### [C-05] `attendance-module`
- **Estado**: `[x]` completado — 2026-05-27
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
- **Estado**: `[x]` completado — 2026-05-29
- **Scope**:
  - Módulo backend `modules/grades/`: CRUD calificaciones
  - Modelo Sequelize `Grade` con DECIMAL(5,2)
  - `POST /api/v1/grades` — carga de nota con verificación de asignación docente (RN-04)
  - `PUT /api/v1/grades/:id`, `DELETE /api/v1/grades/:id` — solo docente propietario (RN-12)
  - `GET /api/v1/students/:id/grades` — historial por materia y período (con filtros)
  - `GET /api/v1/grades/subjects/:subjectId` — notas por materia
  - Validaciones: rango 0-10 (RN-10), período válido (RN-11), materia asignada (RN-04)
  - Frontend: `DocenteDashboard.jsx` sección calificaciones, `gradesService.js`
  - Migración 004: tabla `grades`
  - Reglas de negocio: RN-04, RN-10, RN-11, RN-12
- **Dependencias**: `C-04`
- **Governance**: MEDIO (datos académicos sensibles, pero solo CRUD con validación)
- **Leer antes**:
  - `knowledge-base/07_flujos_principales.md` §Flujo 3: Carga de calificación
  - `knowledge-base/06_funcionalidades.md` §Épica 4: Calificaciones
  - `knowledge-base/05_reglas_de_negocio.md` §Calificaciones (RN-CA)
  - `knowledge-base/04_modelo_de_datos.md` §grades
- **Leer antes**:
  - `knowledge-base/07_flujos_principales.md` §Flujo 3: Carga de calificación
  - `knowledge-base/06_funcionalidades.md` §Épica 4: Calificaciones
  - `knowledge-base/05_reglas_de_negocio.md` §Calificaciones (RN-CA)
  - `knowledge-base/04_modelo_de_datos.md` §grades

### [C-07] `grades-evolution`
- **Estado**: `[x]` completado — 2026-06-01 (archivado en openspec)
- **Scope**:
  - Módulo backend `modules/grades/`: nuevo endpoint `GET /api/v1/students/:id/evolution`
  - Query que agrupa calificaciones por materia y período (trimestre), ordenadas cronológicamente
  - Estructura de respuesta: `{ subjects: [{ id, name, grades: [{ period, value, date }] }] }`
  - Validaciones: solo el padre de ese alumno (RN-03) o el docente de la materia pueden acceder
  - Frontend: nuevo componente `GradeEvolutionView` — tabla evolutiva con materias como filas y períodos como columnas, más un mini line-chart por materia (opcional, puede ser solo tabla)
  - Integración en `PadreDashboard` como nueva sección "Evolución" por hijo
  - Integración en `DocenteDashboard` como nueva sección "Evolución del alumno" (selector de alumno)
  - Tests: query agrupada, permisos por rol, formato de respuesta, materia sin calificaciones
  - Sin modelos nuevos — solo consulta sobre `Grade` existente
- **Dependencias**: `C-06` (necesita el módulo de calificaciones)
- **Governance**: BAJO (solo consulta, sin mutación de datos)
- **Leer antes**:
  - `knowledge-base/07_flujos_principales.md` §Flujo 3: Carga de calificación
  - `knowledge-base/06_funcionalidades.md` §Épica 4: Calificaciones
  - `knowledge-base/05_reglas_de_negocio.md` §Calificaciones (RN-CA)
  - `knowledge-base/04_modelo_de_datos.md` §grades

---

## FASE 3 — Portal Parental

> Dashboard para padres con consulta de datos de sus hijos y subida de certificados.

### [C-08] `parental-dashboard`
- **Estado**: `[x]` completado — 2026-05-29
- **Scope**:
  - Frontend: `PadreDashboard.jsx` con secciones Mis Hijos y Mi Perfil
  - Sección `ChildrenSection` — cards de hijos con botones para Ver Notas y Ver Asistencias
  - `GET /api/v1/students/me/children` — endpoint backend que devuelve hijos del padre autenticado
  - Modal de notas: tabla con materia, nota, tipo, descripción, fecha (consume `GET /api/v1/students/:id/grades`)
  - Modal de asistencias: historial con resumen de totales (consume `GET /api/v1/students/:id/attendances`)
  - `DashboardLayout.jsx` — layout reutilizable con sidebar colapsable, avatar, navegación por secciones
  - Guardias RN-03: roleMiddleware('padre') en endpoint de hijos
  - Perfil del padre con datos personales
- **Dependencias**: `C-05`, `C-06`
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
- **Estado**: `[x]` completado — 2026-06-01
- **Scope**:
  - Module backend `modules/licences/`: CRUD de licencias (título + archivo adjunto)
  - Modelo Sequelize `Licence` con campos: title, file_data, file_name, file_mime, file_size (sin fechas ni estados de aprobación)
  - `POST /api/v1/licences` — crear licencia con título + archivo opcional (docente, preceptor, padre)
  - `GET /api/v1/licences/me` — historial del usuario autenticado
  - `GET /api/v1/licences/admin` — todas las licencias (admin)
  - `GET /api/v1/licences/from-parents` — justificaciones de padres (preceptor)
  - `GET /api/v1/licences/:id/download` — descargar archivo adjunto
  - Configuración Multer para subida de archivos (JPG/PNG/PDF, ≤ 5MB)
  - Frontend: `pages/docente/MyLeavesPage.jsx`, `pages/admin/LeavesPage.jsx`, `pages/preceptor/MyLeavesPage.jsx`, `pages/preceptor/JustificacionesPage.jsx` conectados con datos reales
  - Sin migración formal (usa sync({ alter: true }))
  - Sin flujo de aprobación (el docente registra, no necesita aprobación)
  - 🔴 **Post-rediseño C-13**: Las vistas frontend ya existen (MyLeavesPage, LeavesPage, JustificacionesPage). NO crear nuevas páginas — conectar endpoints a las existentes y respetar paleta Cozy Chocolate Cream, componentes compartidos, y layout DashboardLayout.
- **Dependencias**: `C-04`
- **Governance**: BAJO (solo subida de archivos con título, sin lógica de negocio compleja)
- **Leer antes**:
  - `knowledge-base/07_flujos_principales.md` §Flujo 7: Registro de licencia docente
  - `knowledge-base/05_reglas_de_negocio.md` §Licencias Docentes (RN-LI)
  - `knowledge-base/04_modelo_de_datos.md` §licences

---

## FASE 5 — Automatización Inteligente

> Agente Python de notificaciones vía email.

### [C-10] `notification-agent`
- **Estado**: `[x]` completado — 2026-06-02
- **Scope**:
  - `agent/main.py` — scheduler APScheduler con ejecución diaria (18:00 hs, lunes a viernes)
  - `agent/config.py` — variables de entorno: DATABASE_URL, RESEND_API_KEY, AUSENCIA_UMBRAL
  - `agent/tasks/db_reader.py` — consultas SQL directas a PostgreSQL con psycopg2:
    - Alumnos con ≥ X inasistencias no justificadas (excluye ya notificados hoy RN-16)
    - Alumnos con ≥ 20% inasistencias sobre total del trimestre
    - Calificaciones < 4 registradas hoy
    - Tareas con vencimiento ≤ 2 días + no entregadas
    - Licencias aprobadas con vencimiento ≤ 3 días
  - `agent/tasks/notifier.py` — envío de email vía Resend SDK (templates HTML), registro en notification_logs
  - `agent/templates/` — templates HTML para notificaciones por email
  - Verificación de email del padre como canal de contacto obligatorio (en lugar de WhatsApp)
  - `agent/tasks/alert_engine.py` — evaluación de condiciones y orquestación de las 5 alertas
  - Endpoint interno `POST /api/v1/notifications/trigger` (backend) para trigger manual con SERVICE_API_KEY
  - Modelo Sequelize `NotificationLog` con índices para consultas del agente
  - Migración 003: tabla `notification_logs`
  - `requirements.txt` actualizado con psycopg2-binary, resend, apscheduler, pandas
  - Tests: consultas SQL, envío mockeado de Resend, anti-spam (misma alerta no se reenvía en 24h)
  - Reglas de negocio: RN-16, RN-17, RN-18
  - Archivo `agent/scheduler/README.md` con instrucciones de ejecución y monitoreo
  - 🔴 **Post-rediseño C-13**: Si se agregan vistas frontend para logs/notificaciones, deben usar `pages/admin/NotificationLogsPage.jsx` (ya existe del C-13), paleta Cozy Chocolate Cream, componentes compartidos, y layout DashboardLayout.
- **Dependencias**: `C-04` (necesita datos de usuarios, estudiantes y vínculos parentales)
- **Governance**: MEDIO (integración email vía Resend, comunicación con familias)
- **Leer antes**:
  - `knowledge-base/07_flujos_principales.md` §Flujo 4: Notificación automática de inasistencias críticas
  - `knowledge-base/06_funcionalidades.md` §Épica 7: Notificaciones Automáticas
  - `knowledge-base/05_reglas_de_negocio.md` §Notificaciones (RN-NO)
  - `knowledge-base/08_arquitectura_propuesta.md` §Lógica del agente automatizado, §DD-06
  - `knowledge-base/11_despliegue_y_devops.md` §Componente 3: Agente Python
  - `knowledge-base/10_preguntas_abiertas.md` Configuración de API key de Resend

---

## FASE 6 — Cierre y Calidad

> Dashboard admin, infraestructura DevOps y pulido final de la UI.

### [C-11] `admin-dashboard-and-polish`
- **Estado**: `[x]` completado — 2026-06-02 (archivado en openspec)
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
  - 🔴 **Post-rediseño C-13**: Las vistas ya existen (DashboardOverview, NotificationLogsPage, ConfigurationPage). Conectar con datos reales y respetar paleta Cozy Chocolate Cream, componentes compartidos, y layout DashboardLayout.
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

---

## FASE 7 — Rediseño Frontend

> Refactor completo del frontend aplicando el design system de Google Stitch sobre Chakra UI.
> Dividido en sub-fases para poder iterar por rol sin bloquear el resto del desarrollo.

### [C-13] `frontend-redesign`
- **Estado**: `[x]` archivado — 2026-05-29
- **Scope general**: Adaptar el diseño premium generado por Google Stitch (Tailwind v4) a nuestro stack Chakra UI + JSX + React Router v6. Separar los dashboards monolíticos actuales en vistas por ruta, con componentización y estados completos.
- **Dependencias**: `C-04` (necesita los dashboards actuales como base)
- **Governance**: MEDIO (solo UI, sin impacto en lógica de negocio)
- **Leer antes**:
  - `VISTAS.md` completo
  - `Diseño Front/CANONICAL_SYS_VISTAS.md` — design system tokens
  - `frontend/src/theme.js` — theme de Chakra con tokens adaptados
  - `knowledge-base/08_arquitectura_propuesta.md` §Frontend

---

#### Sub-fase C-13.0 `theme-tokens`
- **Estado**: `[x]` completado
- **Scope**:
  - Crear `frontend/src/theme.js` con `extendTheme` de Chakra UI
  - Mapear colores Stitch: warm-amber (#FF6B35), terracota (#2D1B08), surface creams
  - Configurar tipografía: Montserrat (headings) + Inter (body)
  - Radios: 32px cards, pill buttons (full), 12px inputs
  - Sombras: warm shadow tokens (`rgba(124, 45, 18, 0.08)`)
  - Tintes por rol: admin( violeta), preceptor(teal), docente(naranja), padre(rosa)
  - Glassmorphism: `.glass-panel` con backdrop-filter
  - Degradado animado para LoginPage
  - Sin cambios en páginas existentes
- **Dependencias**: ninguna (tarea de configuración)

#### Sub-fase C-13.1 `admin-views-refactor`
- **Estado**: `[x]` completado
- **Scope**:
  - Refactor `AdminDashboard.jsx` → separar en páginas por ruta:
    - `pages/admin/DashboardOverview.jsx` — cards de resumen + actividad reciente
    - `pages/admin/UsersPage.jsx` — CRUD usuarios + tabla con roles
    - `pages/admin/CoursesPage.jsx` — cursos + materias expandibles
    - `pages/admin/StudentsPage.jsx` — alumnos + vinculación padres
    - `pages/admin/AssignmentsPage.jsx` — asignación docente a materias
    - `pages/admin/LinksPage.jsx` — vínculos padre-alumno
    - `pages/admin/LeavesPage.jsx` — aprobar/rechazar licencias
  - Crear `AdminSidebar.jsx` con items de navegación
  - Aplicar theme tokens (fondos violeta suave, cards 32px, pill buttons)
  - Estados: loading (skeleton), empty (mensaje+icono), error (toast)
  - Layout responsivo: sidebar colapsable en tablet, drawer en mobile
  - Conectar cada página a su service correspondiente (adminService, api.js)
- **Dependencias**: `C-13.0`

#### Sub-fase C-13.2 `preceptor-views-refactor`
- **Estado**: `[x]` completado
- **Scope**:
  - Refactor `PreceptorDashboard.jsx` → separar en páginas:
    - `pages/preceptor/AttendanceRegisterPage.jsx` — grilla con 3 estados toggle
    - `pages/preceptor/AttendanceHistoryPage.jsx` — historial + resumen cards
    - `pages/preceptor/PendingCertificatesPage.jsx` — justificación + certificados
  - Componentes: `AttendanceGrid.jsx` mejorado (color coding, estados)
  - Aplicar theme tokens (fondos teal suave)
  - Estados completos: loading, empty, error, duplicado, irreversible
- **Dependencias**: `C-13.0`

#### Sub-fase C-13.3 `docente-views-refactor`
- **Estado**: `[x]` completado
- **Scope**:
  - Refactor `DocenteDashboard.jsx` → separar en páginas:
    - `pages/docente/GradesPage.jsx` — tabla de notas con inputs 0-10
    - `pages/docente/TasksPage.jsx` — lista de tareas + modal creación
    - `pages/docente/TaskSubmissionsPage.jsx` — entregas unidireccionales
    - `pages/docente/MyLeavesPage.jsx` — solicitud + historial
    - `pages/docente/ProfileSection.jsx` — datos personales
  - Componentes: `GradeForm.jsx`, `TaskCard.jsx`
  - Aplicar theme tokens (fondos naranja suave)
  - Estados: loading, empty, error, validación en tiempo real
- **Dependencias**: `C-13.0`

#### Sub-fase C-13.4 `padre-views-refactor`
- **Estado**: `[x]` completado
- **Scope**:
  - Refactor `PadreDashboard.jsx` → separar en páginas:
    - `pages/padre/ChildGradesPage.jsx` — notas del hijo con color coding
    - `pages/padre/ChildAttendancesPage.jsx` — asistencias + alerta visual
    - `pages/padre/ChildTasksPage.jsx` — tareas con urgencia ≤2 días
    - `pages/padre/UploadCertificatePage.jsx` — dropzone drag & drop
  - Componente: `ChildSelector.jsx` — tabs (≤3 hijos) / dropdown (>3)
  - Aplicar theme tokens (fondos rosa suave)
  - Estados: loading, empty, error, alerta umbral crítico
- **Dependencias**: `C-13.0`

#### Sub-fase C-13.5 `shared-components`
- **Estado**: `[x]` completado
- **Scope**:
  - Crear componentes compartidos faltantes:
    - `EmptyState.jsx` — icono + título + descripción + acción opcional
    - `LoadingSkeleton.jsx` — variantes: tabla, card, texto
    - `ErrorBoundary.jsx` — captura errores de render + reintentar
    - `ErrorAlert.jsx` — toast para 401, 403, 429, 500 con mensajes amigables
    - `GradeForm.jsx` — input numérico 0-10 con validación
    - `AttendanceSummary.jsx` — cards de resumen (totales, %)
  - Refactor `DataTable.jsx` con diseño Stitch (bordes 32px, skeleton, empty state)
  - Refactor `DashboardLayout.jsx` con sidebar colapsable + responsive
- **Dependencias**: `C-13.0`

#### Sub-fase C-13.6 `responsive`
- **Estado**: `[x]` completado
- **Scope**:
  - Verificar todos los dashboards en mobile (<768px):
    - Sidebar → drawer hamburguer
    - Grids 4 cols → 1 col
    - Tablas → scroll horizontal o cards apiladas
    - Modales → full screen en mobile
  - Verificar tablet (768-1023px):
    - Sidebar → rail de 64px solo iconos
    - Grids → 2 columnas
  - Header adaptativo con breadcrumb responsivo
  - Touch targets mínimos 44px en botones mobile
- **Dependencias**: `C-13.1`, `C-13.2`, `C-13.3`, `C-13.4`

#### Sub-fase C-13.7 `missing-views`
- **Estado**: `[x]` completado
- **Scope**:
  - Construir vistas que aún no existen en el frontend actual:
    - `AdminLeavesPage.jsx` — si C-09 está implementado
    - `AdminNotificationLogsPage.jsx` — si C-10 está implementado
    - `AdminConfigurationPage.jsx` — si C-11 está implementado
    - `AdminNotFoundPage.jsx` (404 real, no redirect)
    - `AdminUnauthorizedPage.jsx` (componente extraído, no inline)
  - Verificar integración con endpoints reales
- **Dependencias**: `C-13.0`, más C-09, C-10, C-11 según corresponda

---

## FASE 8 — Auditoría y Seguridad Pre-Producción

> Auditoría integral, endurecimiento de seguridad y remediación de vulnerabilidades antes del deploy a producción.
> Basado en auditoría automatizada del 2026-06-02 (71 hallazgos: 11 críticos, 20 altos, 26 medios, 14 bajos).
> ✅ **C-14 COMPLETADO** — El proyecto está listo para producción.

### [C-14] `production-audit-remediation`
- **Estado**: `[x]` completado ✅ 2026-06-03
- **Scope general**: Corregir las 71 vulnerabilidades encontradas en la auditoría pre-producción, organizadas en 3 sub-fases por criticidad.
- **Dependencias**: C-01, C-02, C-03, C-04, C-05, C-06, C-07, C-08, C-09, C-10, C-11, C-12, C-13 (audita el sistema completo)
- **Governance**: CRITICO (seguridad del sistema en producción)
- **Leer antes**:
  - `knowledge-base/05_reglas_de_negocio.md` §Autenticación y Acceso
  - `knowledge-base/08_arquitectura_propuesta.md` §Seguridad
  - `knowledge-base/11_despliegue_y_devops.md` completo
  - `backend/middlewares/authMiddleware.js`
  - `backend/modules/auth/auth.service.js`
  - `backend/modules/grades/grades.service.js`
  - Auditoría completa: hallazagos detallados en sesión de auditoría 2026-06-02

---

#### Sub-fase C-14.0 `blockers` — Críticos (bloquean producción)

> 12 hallazgos CRÍTICOS que deben resolverse antes del deploy. Sin esto, NO hacer deploy.

| # | Hallazgo | Archivo | Acción |
|---|----------|---------|--------|
| C14.0-1 | JWT fallback hardcodeado | `auth.service.js:6`, `authMiddleware.js:14` | Eliminar fallback `'secret-dev-key'`, agregar startup guard que crash si JWT_SECRET no está seteado |
| C14.0-2 | Sin verificación teacher→subject al crear notas | `grades.service.js:7-27` | Agregar verificación de asignación docente via TeacherSubject antes de createGrade |
| C14.0-3 | Sin ownership check al actualizar notas | `grades.service.js:59-64` | Verificar que el docente es el creador de la nota o está asignado a la materia |
| C14.0-4 | IDOR: cualquier teacher/padre ve notas de cualquier alumno | `grades.service.js:30-44` | Agregar role-based authorization: docente→solo materias asignadas, padre→solo hijos vinculados |
| C14.0-5 | IDOR: cualquier rol descarga cualquier licencia | `licences.service.js:63-67`, `licences.routes.js:36-39` | Verificar ownership (user_id === req.user.id) o role admin |
| C14.0-6 | IDOR: cualquier teacher ve asistencias de cualquier curso | `attendances.service.js:111-138` | Verificar asignación docente al curso via TeacherSubject |
| C14.0-7 | `sync({ alter: true })` en producción | `app.js:114` | Reemplazar con condicional `if (NODE_ENV !== 'production')` o migraciones |
| C14.0-8 | Mass assignment en updates | `users.service.js:120`, `students.service.js:71`, `courses.service.js:65`, `grades.service.js:63`, `attendances.service.js:73` | Implementar whitelist de campos permitidos en todos los update service methods |
| C14.0-9 | JWT en localStorage (XSS-vulnerable) | `AuthContext.jsx:65,86,98,113` | Migrar token a httpOnly cookie. Backend setea cookie en login. Frontend usa `withCredentials`. |
| C14.0-10 | Sin helmet/CSP/security headers | `app.js` (todo el middleware) | Instalar `helmet`, configurar CSP + HSTS + X-Frame-Options + X-Content-Type-Options |
| C14.0-11 | `VITE_API_URL` sin configurar en prod | `api.js:10`, `JustificacionesPage.jsx:12`, `JustificativosPage.jsx:136` | Setear en Vercel env, quitar fallbacks `http://localhost:5000`, validar en build |
| C14.0-12 | Sin CI/CD pipeline | `no .github/workflows/` | Crear `.github/workflows/ci.yml` con tests backend + frontend lint+build |

---

#### Sub-fase C-14.1 `preventivos` — Altos (resolver antes de prod)

> 20 hallazgos HIGH que deben corregirse antes de producción.

| # | Hallazgo | Archivo | Acción |
|---|----------|---------|--------|
| C14.1-1 | Sin validación MIME en upload licencias | `multerLicences.js:1-9` | Agregar fileFilter con MIME types permitidos (image/jpeg, image/png, application/pdf) |
| C14.1-2 | Sin auth por curso en batch attendance | `attendances.service.js:34-65` | Verificar que el preceptor/admin tiene permiso sobre los estudiantes del curso |
| C14.1-3 | Error messages filtran schema interno | `errorMiddleware.js:41-46` | Sanitizar response: mensaje genérico en prod, log completo server-side |
| C14.1-4 | Password change endpoint no existe | `users.service.js:116-118` | Implementar `PUT /api/v1/auth/password` con validación de old password |
| C14.1-5 | `morgan('dev')` en producción | `app.js:37` | Usar `combined` en producción según NODE_ENV |
| C14.1-6 | Sin sanitización input (XSS almacenado) | Múltiples servicios | Agregar `escape()`/`trim()` de express-validator, strip HTML server-side |
| C14.1-7 | `target="_blank"` sin `rel="noopener noreferrer"` | `JustificacionesPage.jsx:52`, `JustificativosPage.jsx:136` | Agregar `rel="noopener noreferrer"` a ambos links |
| C14.1-8 | Root `.gitignore` incompleto | `.gitignore` raíz | Agregar `node_modules/`, `dist/`, `*.env.*`, `uploads/`, `*.log`, `logs/` |
| C14.1-9 | CORS fallback a localhost en prod | `app.js:27-30` | Validar origin contra whitelist, crash si FRONTEND_URL no está seteado en prod |
| C14.1-10 | `vercel.json` minimalista | `vercel.json` | Agregar headers de seguridad, env, buildCommand, outputDirectory |
| C14.1-11 | `pg`/`pg-hstore` en devDependencies | `backend/package.json` | Mover a dependencies (se requieren en runtime para Sequelize) |
| C14.1-12 | `password_hash` sin defaultScope | `models/User.js` | Agregar `defaultScope: { attributes: { exclude: ['password_hash'] } }` |
| C14.1-13 | Seeders misma password para todos | `seeders/20260526001-demo-users.js:7` | Agregar guard `if (NODE_ENV === 'production') return` + warning |
| C14.1-14 | `express` 4.22.1 con DoS (moderado) | `backend/package.json` | Upgrade a express@4.22.2+ |
| C14.1-15 | `bcrypt` 5.1.1 arrastra `tar` vulnerable (HIGH) | `backend/package.json` | Upgrade a bcrypt@6.0.0 (elimina dependencia @mapbox/node-pre-gyp) |
| C14.1-16 | `uuid` 8.3.2 buffer overflow (CVSS 7.5) | `backend/package.json` | Forzar `uuid@>=11.1.1` via overrides en package.json |
| C14.1-17 | Account-level lockout ausente | `auth.routes.js:10-19` | Agregar contador de intentos fallidos por usuario en DB/Redis |
| C14.1-18 | Sin refresh token rotation | `auth.service.js:28` | Implementar refresh tokens + token blacklist en DB |
| C14.1-19 | Preceptor puede crear docentes | `users.routes.js:67` | Restringir: preceptor solo crea `padre`, admin crea `docente` |
| C14.1-20 | Sin SSL/TLS en conexión DB agente Python | `agent/tasks/db_reader.py:11` | Agregar `sslmode=require` en DATABASE_URL o warning si no está |

---

#### Sub-fase C-14.2 `performance-e-integridad` — Medios y Bajos

> 39 hallazgos MEDIUM/LOW para resolver post-producción inmediato.

| # | Hallazgo | Archivo | Acción |
|---|----------|---------|--------|
| C14.2-1 | Sin índices en `messages.chat_id` | `models/Message.js` | Agregar migración con índices en chat_id, created_at |
| C14.2-2 | Sin índices en `courses` | `models/Course.js` | Agregar índices en columnas de filtrado (name, year, division) |
| C14.2-3 | Sin unique constraint en courses | Migraciones | Agregar UNIQUE(name, year, division) |
| C14.2-4 | Sin unique constraint en subjects | Migraciones | Agregar UNIQUE(name, course_id) |
| C14.2-5 | ErrorBoundary logea errores en prod | `ErrorBoundary.jsx:16` | Condicionar console.error a NODE_ENV === 'development' |
| C14.2-6 | Sin request body size limit | `app.js:33` | Agregar `express.json({ limit: '1mb' })` |
| C14.2-7 | Agent logea PII (emails) en INFO | `notifier.py:103,111,114` | Masking de emails + debug level |
| C14.2-8 | Agent: mutable global API key | `notifier.py:11` | Validar consistencia |
| C14.2-9 | Agent: exception loggea connection string | `alert_engine.py:85` | Sanitizar mensaje de error |
| C14.2-10 | Agent: crash si env var no numérica | `config.py:14` | try/except con ValueError + mensaje claro |
| C14.2-11 | `.env.example` con valores reales | `.env.example` | Cambiar a placeholders obvios |
| C14.2-12 | Sin CSP en index.html | `frontend/index.html` | Agregar meta tag CSP |
| C14.2-13 | Sin railway.json | `(missing)` | Crear `backend/railway.json` con startCommand y healthcheckPath |
| C14.2-14 | Sin `.node-version` pinning | `(missing)` | Crear `.node-version` con 20.18.0 |
| C14.2-15 | Sin unique constraint en grades (evaluar) | `models/Grade.js` | Evaluar si aplica según reglas de negocio |
| C14.2-16 | Error messages duplicados en agent | `alert_engine.py` + `db_reader.py` | Quitar exc_info donde ya se loguea internamente |
| C14.2-17 | Hard delete sin audit trail | Repositorios User/Student/Attendance | Evaluar paranoid: true en modelos core |
| C14.2-18 | Chat-Message CASCADE sin guard | `models/index.js:64` | Agregar comentario/model hook preventivo |
| C14.2-19 | Course sin validación de año | `models/Course.js` | Agregar `min: 1900, max: 2100` |
| C14.2-20 | Chat permite user1_id === user2_id | `models/Chat.js` | Agregar validate block |
| C14.2-21 | Sin vite.config sourcemap explícito | `frontend/vite.config.js` | Agregar `build.sourcemap: false` explícito |
| C14.2-22 | No HTTPS enforcement middleware | `app.js` | Agregar redirect condicional HTTP→HTTPS en prod |
| C14.2-23 | Sin validación env vars al startup | `app.js` | Agregar check de JWT_SECRET, DATABASE_URL, FRONTEND_URL requeridas |
| C14.2-24 | Morgan sin env-conditional | `app.js:37` | `morgan(NODE_ENV === 'production' ? 'combined' : 'dev')` |
| C14.2-25 | Sin compresión gzip | `backend/package.json` | Instalar compression middleware |
| C14.2-26 | Agent: PII en tracebacks | `notifier.py:114` | No loguear full exception en email failures |
| C14.2-27 | Sin bloqueo de request body grande | `app.js:33` | Límite de 1mb en express.json + urlencoded |
| C14.2-28 | Sin validación Content-Type en blob download | `LeavesPage.jsx:22`, `MyLeavesPage.jsx` files | Verificar response.headers['content-type'] antes de crear blob |
| C14.2-29 | Categorizar correctamente seeders como dev-only | seeders | Documentar que seeders no corren en prod |
| C14.2-30..39 | Hallazgos restantes LOW/INFO | Varios | Correcciones menores de higiene y configuración |
