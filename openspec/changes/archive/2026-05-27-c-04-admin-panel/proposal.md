## Why

El sistema necesita un panel administrativo para que los administradores gestionen usuarios, cursos, materias, estudiantes y asignaciones. Sin este módulo no se puede poblar el sistema con datos reales, y los módulos académicos (asistencias, calificaciones, tareas) no tienen datos sobre los cuales operar. Es el change que desbloquea todo el GATE 2 del roadmap.

## What Changes

### Backend — Users (YA IMPLEMENTADO)
- Módulo `modules/users/` con CRUD de usuarios (docente, preceptor, padre)
- `POST /api/v1/users` — crear usuario con bcrypt (12 rounds), validación de email único
- `GET /api/v1/users` — listar usuarios activos (excluye admins)
- `GET /api/v1/users/:id` — obtener usuario por ID
- `GET /api/v1/users/role/:role` — filtrar por rol
- `PUT /api/v1/users/:id` — actualizar datos (email, nombre, teléfono, is_active)
- `DELETE /api/v1/users/:id` — desactivar usuario (soft-delete, `is_active = false`)
- `POST /api/v1/users/bulk/get` — obtener múltiples usuarios por IDs
- Todas las rutas protegidas con `authMiddleware` + `roleMiddleware('admin')`

### Backend — Courses (PENDIENTE)
- Módulo `modules/courses/`: CRUD de cursos
- `POST /api/v1/courses`, `GET /api/v1/courses`
- `POST /api/v1/courses/:id/subjects`, `GET /api/v1/courses/:id/subjects`

### Backend — Students (PENDIENTE)
- Módulo `modules/students/`: CRUD de alumnos, vinculación padre-alumno
- `POST /api/v1/students`, `GET /api/v1/students`, `PUT /api/v1/students/:id`
- `POST /api/v1/students/:id/parents`, `GET /api/v1/students/:id/parents`

### Backend — Subjects (PENDIENTE)
- Módulo `modules/subjects/`: asignación docente a materia
- `POST /api/v1/subjects/:id/teachers`, `GET /api/v1/subjects/:id/teachers`

### Frontend (PENDIENTE)
- `AdminDashboard.jsx` con tabs para Users, Courses, Students
- Componentes reutilizables: `DataTable.jsx`, formularios CRUD con Chakra UI

## Capabilities

### New Capabilities
- `admin-users`: CRUD de usuarios del sistema con soft-delete
- `admin-courses`: Gestión de cursos y materias (pendiente)
- `admin-students`: Gestión de alumnos y vínculos parentales (pendiente)

### Modified Capabilities
- *(ninguna)*

## Impact

- **Backend**: nuevos directorios `modules/users/`, `modules/courses/`, `modules/students/`, `modules/subjects/` (users ya implementado)
- **Frontend**: nuevo `AdminDashboard.jsx`, componentes de tabla y formulario
- **Dependencias**: ya incluidas en `package.json`
- **Reglas de negocio cubiertas**: RN-01 (rol único), RN-03 (vinculación parental)
