# Mapa de Changes — Optimización de la Gestión Académica y Comunicación Escolar

> Generado a partir del análisis de `docs/Descripcion.txt`, `docs/Integrador.txt` y `docs/Historias_de_usuario.txt`.
> Stack: React 19 + Chakra UI v3 / Node.js 20 + Express + Sequelize / PostgreSQL 15 / Python 3.11 + Resend

---

## Dependencias entre changes

```
1. project-setup
   └── 2. auth-y-autorizacion
         ├── 3. gestion-usuarios-admin
         ├── 4. cursos-materias
         │    └── 5. gestion-estudiantes
         │         ├── 6. asistencias-registro
         │         │    └── 7. asistencias-justificacion
         │         ├── 8. calificaciones-docente
         │         └── 9. tareas-y-entregas
         ├── 10. licencias-docentes (solo depende de 3 — paralelizable con 6-9)
         └── (3,5,7,8,9) ─── 11. vista-parental
              (5,6,8,9,10) ─── 12. agente-notificaciones
                    (todos) ─── 13. polish-y-deploy
```

---

## Agrupación en sprints

| Sprint | Changes | Temática |
|--------|---------|----------|
| 1 | 1, 2 | Fundaciones + Auth full-stack |
| 2 | 3, 4 | Admin: usuarios + cursos/materias |
| 3 | 5, 6 | Admin: estudiantes + Asistencias registro |
| 4 | 7, 8, 9 | Justificación + Calificaciones + Tareas |
| 5 | 10, 11 | Licencias docentes + Vista parental |
| 6 | 12, 13 | Agente notificaciones + Polish + Deploy |

---

## [1]. `project-setup`

**Funcionalidad**: Completar el scaffolding del proyecto. El monorepo ya tiene las carpetas `/frontend`, `/backend` y `/agent` con sus respectivos `package.json`, Vite + React 19 + Chakra UI v3 en frontend, Express + Sequelize en backend y conexión a PostgreSQL configurada. Faltan: migraciones Sequelize con los modelos base (`users`, `courses`, `subjects`), seed data de prueba, tooling compartido (ESLint, variables de entorno, CI básico) y reemplazar los placeholders README de `modules/` por archivos reales.

**Historias**: Ninguna (fundación técnica)

**Reglas de negocio**: Ninguna

**Depende de**: Ninguno (es el punto de partida)

**Complejidad**: Media

**Nota**: El scaffolding base del backend (Express, Sequelize, .env.example), frontend (Vite, Chakra UI v3) y agente (carpeta con archivos .py) ya existe. Este change completa lo que falta: modelos, migraciones, seeders, variables de entorno reales y ajustes de configuración.

---

## [2]. `auth-y-autorizacion`

**Funcionalidad**: Implementa el subsistema completo de autenticación (login, logout, perfil activo) y autorización por rol. Backend: endpoints `/auth/login`, `/auth/logout`, `/auth/me`, middlewares `authMiddleware` (JWT) y `roleMiddleware`. Frontend: pantalla de login, `AuthContext`, `ProtectedRoute` por rol, redirección a dashboard según rol.

**Historias**: US-001, US-002

**Reglas de negocio**: RN-01, RN-02

**Depende de**: `project-setup` (necesita la BD con el modelo `users`, migraciones ejecutadas, seed data con usuarios de prueba)

**Complejidad**: Media

**Decisión full-stack**: Backend y frontend juntos porque la sesión requiere ambos lados para ser funcional de punta a punta desde el sprint 1.

---

## [3]. `gestion-usuarios-admin`

**Funcionalidad**: CRUD completo de usuarios del sistema para el rol administrador. Backend: endpoints `GET /users`, `POST /users`, `GET /users/:id`, `PUT /users/:id`, `DELETE /users/:id` (soft-delete). Frontend: panel de administración con listado paginado, filtros por rol, formulario de creación/edición y desactivación de cuentas.

**Historias**: US-003

**Reglas de negocio**: RN-01

**Depende de**: `auth-y-autorizacion` (requiere JWT y roleMiddleware para proteger las rutas de admin)

**Complejidad**: Media

---

## [4]. `cursos-materias`

**Funcionalidad**: Gestión de la estructura académica: cursos y materias. Backend: endpoints `GET /courses`, `POST /courses`, `GET /courses/:id/subjects`, `POST /courses/:id/subjects`, `POST /subjects/:id/teachers`. Frontend: panel de administración con creación de cursos, asignación de materias por curso y asignación de docentes a materias.

**Historias**: US-005

**Reglas de negocio**: Ninguna directa (sienta las bases para RN-04)

**Depende de**: `auth-y-autorizacion` (requiere JWT y autorización admin)

**Complejidad**: Baja

---

## [5]. `gestion-estudiantes`

**Funcionalidad**: CRUD de alumnos y vinculación de padres/tutores a alumnos. Backend: endpoints `GET /students`, `POST /students`, `GET /students/:id`, `PUT /students/:id`, `POST /students/:id/parents`, `DELETE /students/:id/parents/:userId`, con filtrado por rol. Frontend: panel de administración para alta de alumnos, búsqueda por curso, y gestión de vínculos familiares.

**Historias**: US-004

**Reglas de negocio**: RN-03

**Depende de**: `cursos-materias` (los alumnos requieren un `course_id` existente), `gestion-usuarios-admin` (los padres deben existir como usuarios antes de vincularlos)

**Complejidad**: Media

---

## [6]. `asistencias-registro`

**Funcionalidad**: Registro diario de asistencias y consulta de historial con resumen estadístico. Backend: endpoints `POST /attendances`, `GET /students/:id/attendances` con filtros por fecha y estado, resumen de totales. Frontend: interfaz del preceptor para registro rápido por curso/fecha y vista de historial con filtros. Vista de solo lectura para docentes.

**Historias**: US-006, US-008

**Reglas de negocio**: RN-05, RN-06, RN-09

**Depende de**: `gestion-estudiantes` (requiere alumnos existentes para registrar asistencias)

**Complejidad**: Media

---

## [7]. `asistencias-justificacion`

**Funcionalidad**: Justificación de inasistencias con subida de certificados. Backend: endpoints `PUT /attendances/:id/justify` (cambio irreversible, RN-07), `POST /certificates/upload` (multipart con validación de tipo/tamaño, storage cloud). Frontend: interfaz del preceptor para justificar ausencias con carga de certificado. El backend de subida será reutilizado por el padre en el change 11.

**Historias**: US-007 (preceptor justifica), US-016 (backend de subida de certificados)

**Reglas de negocio**: RN-07, RN-08

**Depende de**: `asistencias-registro` (requiere registros de asistencia existentes para justificarlos)

**Complejidad**: Baja

---

## [8]. `calificaciones-docente`

**Funcionalidad**: Carga, edición y eliminación de calificaciones por materia y período. Backend: endpoints `POST /grades`, `GET /students/:id/grades`, `PUT /grades/:id`, `DELETE /grades/:id`. Validación de asignación docente a materia (RN-04). Frontend: interfaz del docente para seleccionar materia/curso, cargar notas por alumno y visualizar historial. Vista de solo lectura para preceptor y admin.

**Historias**: US-009, US-010

**Reglas de negocio**: RN-04, RN-10, RN-11, RN-12

**Depende de**: `cursos-materias` (requiere materias con docentes asignados), `gestion-estudiantes` (requiere alumnos para calificar)

**Complejidad**: Media

---

## [9]. `tareas-y-entregas`

**Funcionalidad**: Creación de tareas con generación atómica de registros de entrega para cada alumno, y registro de estado de entregas. Backend: endpoints `GET /subjects/:id/tasks`, `POST /tasks`, `PUT /tasks/:id`, `DELETE /tasks/:id`, `GET /tasks/:id/submissions`, `PUT /tasks/:taskId/submissions/:studentId`, `GET /students/:id/tasks`. Transacción Sequelize para creación atómica de submissions (RN-14). Frontend: interfaz del docente para crear tareas y marcar entregas; vista de consulta para preceptor y admin.

**Historias**: US-011, US-012

**Reglas de negocio**: RN-13, RN-14, RN-15

**Depende de**: `cursos-materias` (requiere materias existentes), `gestion-estudiantes` (requiere alumnos para generar submissions automáticas)

**Complejidad**: Media

---

## [10]. `licencias-docentes`

**Funcionalidad**: Solicitud, aprobación/rechazo y consulta de licencias docentes. Backend: endpoints `GET /teacher-leaves`, `GET /teacher-leaves/me`, `POST /teacher-leaves`, `PUT /teacher-leaves/:id/status`. Cálculo automático de `days_used`. Frontend: formulario de solicitud para docente, panel de aprobación para admin, historial con resumen de días usados/restantes.

**Historias**: US-020, US-021, US-022

**Reglas de negocio**: RN-19, RN-20

**Depende de**: `gestion-usuarios-admin` (requiere usuarios docentes y admin existentes)

**Complejidad**: Baja

**Nota**: Depende solo del change 3, por lo que puede implementarse en paralelo con los changes 6-9 si hay recursos disponibles.

---

## [11]. `vista-parental`

**Funcionalidad**: Dashboard del padre/tutor con visualización de calificaciones, asistencias (con resumen) y tareas de sus hijos vinculados, más subida de certificados de justificación. Frontend: panel parental con selector de hijo (si tiene múltiples), secciones de notas por materia y período, historial de asistencias con resumen, listado de tareas con filtro por estado, y formulario de subida de certificados. Backend: consume los endpoints existentes protegidos por RN-03.

**Historias**: US-013, US-014, US-015, US-016 (frontend de subida de certificados)

**Reglas de negocio**: RN-03, RN-08 (validación en frontend), RN-09

**Depende de**: `gestion-estudiantes` (requiere vinculación padre-alumno), `asistencias-justificacion` (requiere backend de subida de certificados), `calificaciones-docente` (requiere datos de notas), `tareas-y-entregas` (requiere datos de tareas)

**Complejidad**: Media

---

## [12]. `agente-notificaciones`

**Funcionalidad**: Agente automatizado en Python que evalúa periódicamente condiciones críticas contra la BD y envía notificaciones email vía Resend. Implementa 5 alertas: ausencias críticas (umbral configurable RN-18), riesgo de regularidad (≥20% inasistencias), calificación baja (< 4), tarea próxima a vencer (≤ 2 días), vencimiento de licencia docente (≤ 3 días). Incluye registro de auditoría en `notification_logs`, supresión de duplicados por día (RN-16) y ejecución programada con APScheduler.

**Historias**: US-017, US-018, US-019

**Reglas de negocio**: RN-16, RN-17, RN-18

**Depende de**: `gestion-estudiantes` (requiere alumnos y vinculación padre-alumno para saber a quién notificar), `asistencias-registro` (requiere datos de asistencia para alertas 1 y 2), `calificaciones-docente` (requiere notas para alerta 3), `tareas-y-entregas` (requiere tareas y submissions para alerta 4), `licencias-docentes` (requiere licencias para alerta 5)

**Complejidad**: Alta

**Advertencia**: Implica integrar Resend para envío de emails, acceder a PostgreSQL desde Python con SQL directo, y desplegar un worker independiente en Railway con scheduler CRON.

---

## [13]. `polish-y-deploy`

**Funcionalidad**: Cierre del MVP. Incluye barrido de pruebas manuales de todas las funcionalidades, ajustes de UX/UI finales, creación del README.md con instrucciones de instalación y variables de entorno, configuración de variables de producción, despliegue de frontend en Vercel y backend + BD + agente en Railway. Verificación de que no hay credenciales hardcodeadas ni secretos versionados.

**Historias**: Ninguna nueva (cierre del proyecto)

**Reglas de negocio**: Todas (verificación final de cumplimiento)

**Depende de**: Todos los changes anteriores (el sistema debe estar completo para desplegar)

**Complejidad**: Media

---

## Resumen

| N° | Change | Historias | RN | Deps | Complejidad |
|----|--------|-----------|----|------|-------------|
| 1 | project-setup | — | — | — | Media |
| 2 | auth-y-autorizacion | US-001, US-002 | RN-01, RN-02 | 1 | Media |
| 3 | gestion-usuarios-admin | US-003 | RN-01 | 2 | Media |
| 4 | cursos-materias | US-005 | — | 2 | Baja |
| 5 | gestion-estudiantes | US-004 | RN-03 | 3, 4 | Media |
| 6 | asistencias-registro | US-006, US-008 | RN-05, RN-06, RN-09 | 5 | Media |
| 7 | asistencias-justificacion | US-007, US-016 (BE) | RN-07, RN-08 | 6 | Baja |
| 8 | calificaciones-docente | US-009, US-010 | RN-04, RN-10, RN-11, RN-12 | 4, 5 | Media |
| 9 | tareas-y-entregas | US-011, US-012 | RN-13, RN-14, RN-15 | 4, 5 | Media |
| 10 | licencias-docentes | US-020, US-021, US-022 | RN-19, RN-20 | 3 | Baja |
| 11 | vista-parental | US-013, US-014, US-015, US-016 (FE) | RN-03, RN-08, RN-09 | 5, 7, 8, 9 | Media |
| 12 | agente-notificaciones | US-017, US-018, US-019 | RN-16, RN-17, RN-18 | 5, 6, 8, 9, 10 | Alta |
| 13 | polish-y-deploy | — | Todas | 2-12 | Media |

**Total**: 13 changes | **22 user stories** | **20 reglas de negocio** | **6 sprints estimados**

---

*Mapa generado el 26/05/2026 — Revisar y ajustar antes de comenzar el primer `/opsx:propose`.*
