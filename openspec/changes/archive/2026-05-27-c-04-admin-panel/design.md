# Design: C-04 Admin Panel

## Context

El panel administrativo es el módulo central de gestión de datos maestros. Permite al admin crear, leer, actualizar y desactivar usuarios, cursos, materias, estudiantes y asignaciones. La parte de Users ya fue implementada (commit `0819172`). Este diseño cubre tanto lo existente como lo pendiente.

## Goals / Non-Goals

**Goals:**
- CRUD completo de usuarios del sistema con soft-delete y roles (docente, preceptor, padre)
- CRUD de cursos y materias asociadas
- CRUD de alumnos con vinculación padre-alumno
- Asignación docente-materia
- Frontend AdminDashboard con tabs y componentes reutilizables

**Non-Goals:**
- No incluye dashboard de estadísticas ni resúmenes (eso es C-11)
- No incluye gestión de asistencias (C-05), calificaciones (C-06) ni tareas (C-07)
- No incluye subida de archivos ni certificados

## Decisions

1. **Soft-delete en usuarios**: Se usa `is_active = false` en vez de `destroy()` para preservar integridad referencial. Los usuarios desactivados no aparecen en listados públicos pero su registro histórico se conserva. Los admins nunca pueden ser desactivados.

2. **Validación con express-validator**: Cada endpoint POST/PUT tiene su propio schema de validación con mensajes en español. Schemas con `extra: 'forbid'` implícito (solo campos declarados son aceptados).

3. **Repository Pattern**: Toda la lógica de acceso a datos pasa por `repositories/`. Los services nunca llaman a modelos directamente. Esto facilita测试s de integración y cambios de ORM.

4. **Admin-only**: Todos los endpoints de este módulo requieren `roleMiddleware('admin')`. No hay excepciones. Los roles no-admin no tienen acceso a la gestión de usuarios.

5. **Role inmutable post-creación**: El `role` de un usuario no puede cambiarse después de creado. Esto previene escalada de privilegios vía endpoint de actualización.

## Components

### Backend — Users (IMPLEMENTADO)

| Componente | Archivo |
|---|---|
| Controller | `backend/modules/users/users.controller.js` |
| Routes | `backend/modules/users/users.routes.js` |
| Service | `backend/modules/users/users.service.js` |

**Endpoints:**

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/v1/users` | Crear usuario (docente, preceptor, padre) |
| GET | `/api/v1/users` | Listar usuarios activos |
| GET | `/api/v1/users/:id` | Obtener usuario por ID |
| GET | `/api/v1/users/role/:role` | Filtrar por rol |
| PUT | `/api/v1/users/:id` | Actualizar datos (excepto role y password) |
| DELETE | `/api/v1/users/:id` | Desactivar (soft-delete) |
| POST | `/api/v1/users/bulk/get` | Obtener múltiples por IDs |

**Validaciones:**
- email: requerido, formato email, único
- password: requerido, mínimo 8 caracteres
- first_name / last_name: requerido, mínimo 2 caracteres
- role: requerido, uno de `docente`, `preceptor`, `padre`
- phone_whatsapp: opcional, formato E.164
- is_active: solo bool (en update)

### Backend — Courses, Students, Subjects (PENDIENTE)

*(Diseño detallado se completa cuando se implementen estos módulos)*

- `modules/courses/` — Course model + CRUD
- `modules/students/` — Student model + CRUD + parent_student vinculación
- `modules/subjects/` — Subject model + teacher_subject asignación

### Frontend (PENDIENTE)

- `AdminDashboard.jsx` — Layout con tabs (Usuarios, Cursos, Alumnos)
- `DataTable.jsx` — Componente tabla reutilizable con Chakra UI
- Formularios CRUD para cada entidad

## API Changes

### Endpoints Implementados (Users)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/v1/users` | admin | Crear usuario |
| GET | `/api/v1/users` | admin | Listar activos |
| GET | `/api/v1/users/:id` | admin | Obtener por ID |
| GET | `/api/v1/users/role/:role` | admin | Filtrar por rol |
| PUT | `/api/v1/users/:id` | admin | Actualizar |
| DELETE | `/api/v1/users/:id` | admin | Desactivar soft-delete |
| POST | `/api/v1/users/bulk/get` | admin | Bulk get |

### Endpoints Pendientes

*(Se definen cuando se implementen courses, students, subjects)*

## Risks & Trade-offs

| Risk | Mitigation |
|------|------------|
| Hard delete vs soft-delete | Resuelto: se usa soft-delete con `is_active = false` |
| Admin no puede ser desactivado | Validación en service: `if (user.role === 'admin') throw AppError` |
| Email duplicado en update | Verificación previa: si el nuevo email ya pertenece a otro usuario → 409 |
| Pérdida de integridad referencial al desactivar usuarios referenciados | Los registros de alumnos, materias y cursos referencian al user. Con soft-delete el registro sigue existiendo (is_active=false) |
