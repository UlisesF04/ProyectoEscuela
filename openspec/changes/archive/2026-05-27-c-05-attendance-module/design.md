## Context

El sistema actual tiene modelos fundacionales (usuarios, estudiantes, cursos, materias) y autenticación JWT, pero no tiene ningún módulo de gestión académica. El módulo de asistencias es el primero de la Fase 2. El modelo `Attendance` está definido en el modelo de datos (`knowledge-base/04_modelo_de_datos.md`) pero no implementado. Existe un directorio `modules/absences/` con solo un README.md que debe reemplazarse por el módulo real `modules/attendances/`.

El flujo de trabajo del preceptor es: seleccionar curso + fecha → ver grilla de alumnos → marcar presente/ausente/tarde → confirmar. También necesita justificar inasistencias con certificados y consultar historiales.

## Goals / Non-Goals

**Goals:**
- Modelo `Attendance` con UNIQUE(student_id, date), estados (presente/ausente/tarde), soporte de justificación
- CRUD completo de asistencias: registrar, editar, consultar historial
- Justificación de inasistencias: irreversible (RN-07), con subida de certificados
- Resumen de totales por alumno: total días, ausencias, justificadas, no justificadas (RN-09)
- Frontend `PreceptorDashboard.jsx` con grilla de alumnos por curso+fecha
- Permisos: preceptor/admin pueden registrar/editar; docentes/padres solo lectura
- Tests de integración: registro, duplicado (409), justificación irreversible, permisos

**Non-Goals:**
- No se implementa registro de asistencia por materia (solo registro diario general por alumno)
- No se implementa multi-tenancy
- No se implementa integración con Cloudinary (se usa almacenamiento local para desarrollo, ver IN-01)
- No se implementa exportación a PDF/Excel
- No se implementa notificación automática por inasistencias (eso es C-10)

## Decisions

### D-01: Nombre del módulo → `attendances` (no `absences`)
- **Decisión**: El módulo se llamará `modules/attendances/`, no `modules/absences/` (directorio existente con README.md).
- **Motivo**: El modelo de datos (`knowledge-base/04_modelo_de_datos.md`) define la tabla como `attendances`. Consistencia con el naming del modelo (`Attendance`), el repositorio (`attendanceRepository`) y la tabla en BD. El directorio `absences/` se elimina o se deja como alias.
- **Alternativa considerada**: Usar `absences` — rechazado porque el modelo cubre TODOS los estados (presente, ausente, tarde), no solo ausencias.

### D-02: Registro individual vs batch
- **Decisión**: El endpoint principal acepta registros individuales (`POST /api/v1/attendances` con `{ student_id, date, status }`). Se agrega un endpoint batch opcional (`POST /api/v1/attendances/batch`) que acepta un array de registros.
- **Motivo**: El flujo principal (Flujo 2) describe el envío por alumno individualmente. Sin embargo, la experiencia UX del preceptor sugiere que querrá registrar todo el curso de una vez. El batch simplifica el frontend y reduce requests.
- **Alternativa considerada**: Solo individual — más simple en backend pero peor UX.

### D-03: Almacenamiento de certificados → local filesystem + configurable
- **Decisión**: Los certificados se almacenan en el filesystem local (`uploads/certificates/`) durante desarrollo. La ruta es configurable via env var `UPLOAD_DIR`. El endpoint devuelve la URL local. Para producción se puede cambiar a un servicio externo (Cloudinary, S3) sin cambiar la interfaz.
- **Motivo**: IN-01 (Preguntas Abiertas) define Railway Volumes como opción default. Local es más simple para desarrollo y tests. La abstracción queda en el service, no en el controller.
- **Alternativa considerada**: Cloudinary directo — requiere API key y tier gratuito limitado. Mejor postergar.

### D-04: Middleware de permisos para asistencias
- **Decisión**: Se crea un middleware específico `attendancePermissionMiddleware` que verifica:
  - `POST /attendances`, `PUT /attendances/:id` → solo preceptor o admin (RN-06)
  - `PUT /attendances/:id/justify` → solo preceptor o admin
  - `GET /students/:id/attendances` → preceptor, admin (todas), docente (alumnos de su materia), padre (solo hijos vinculados vía RN-03)
- **Motivo**: Los permisos de lectura son más complejos que un simple `roleMiddleware`. Docentes y padres necesitan acceso acotado al historial.

### D-05: Resumen de totales → cálculo en SQL (no en Node.js)
- **Decisión**: El endpoint `GET /api/v1/students/:id/attendances` devuelve los registros + un objeto `summary` con `{ total_days, total_absences, justified_absences, unjustified_absences }` calculado vía agregación SQL (`COUNT` + `WHERE`).
- **Motivo**: Performance sobre grandes volúmenes de datos. El resumen se calcula en la query, no iterando en Node.js.

## Risks / Trade-offs

| Riesgo | Mitigación |
|--------|------------|
| Archivos de certificados acumulados sin limpieza en local | Agregar tarea opcional de limpieza post-MVP. Por ahora el volumen es bajo (escuela ~200 alumnos) |
| Justificación irreversible (RN-07) puede ser conflictiva si el preceptor se equivoca | Implementar confirmación en UI ("¿Está seguro? Esta acción no se puede deshacer") |
| El batch puede crear carga alta si se envían 30+ registros a la vez | El endpoint procesa en un solo INSERT (no por fila), no hay problema de performance para ~40 alumnos por curso |
| SELECT permisivo en `GET /students/:id/attendances` podría exponer datos | El middleware de permisos verifica relación padre-alumno (RN-03) y asignación docente (RN-04) antes de devolver datos |
