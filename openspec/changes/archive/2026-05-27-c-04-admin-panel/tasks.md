## 1. Backend — Módulo Users (IMPLEMENTADO)

- [x] 1.1 Crear `backend/modules/users/users.service.js` — CRUD con bcrypt (12 rounds), validación de email único, exclusión de password_hash en respuestas
- [x] 1.2 Crear `backend/modules/users/users.controller.js` — handlers: createUser, getAllUsers, getUserById, getUsersByRole, updateUser, deactivateUser, getUsersByIds
- [x] 1.3 Crear `backend/modules/users/users.routes.js` — todas las rutas protegidas con authMiddleware + roleMiddleware('admin') + validationMiddleware
- [x] 1.4 Editar `backend/app.js` — registrar usersRoutes en `/api/v1/users`
- [x] 1.5 Migrar `backend/config/config.json` → `config.js` para leer variables de `.env`
- [x] 1.6 Agregar `delete()` y `findByRole()` a `backend/repositories/userRepository.js`
- [x] 1.7 Convertir DELETE a soft-delete (`is_active = false`) en repository y service
- [x] 1.8 Filtrar solo usuarios activos en getAllUsers y getUsersByRole

## 2. Backend — Módulo Courses (IMPLEMENTADO)

- [x] 2.1 Crear `backend/modules/courses/courses.service.js` — CRUD de cursos
- [x] 2.2 Crear `backend/modules/courses/courses.controller.js` — handlers
- [x] 2.3 Crear `backend/modules/courses/courses.routes.js` — rutas protegidas (admin)
- [x] 2.4 Crear endpoints para asignar materias a cursos (`POST/GET /api/v1/courses/:id/subjects`)

## 3. Backend — Módulo Students (IMPLEMENTADO)

- [x] 3.1 Crear `backend/modules/students/students.service.js` — CRUD de alumnos
- [x] 3.2 Crear `backend/modules/students/students.controller.js` — handlers
- [x] 3.3 Crear `backend/modules/students/students.routes.js` — rutas protegidas (admin)
- [x] 3.4 Crear endpoints para vinculación padre-alumno (`POST/GET /api/v1/students/:id/parents`)

## 4. Backend — Módulo Subjects (IMPLEMENTADO)

- [x] 4.1 Crear `backend/modules/subjects/subjects.service.js` — CRUD de materias, asignación docente
- [x] 4.2 Crear `backend/modules/subjects/subjects.controller.js` — handlers
- [x] 4.3 Crear `backend/modules/subjects/subjects.routes.js` — rutas protegidas (admin)
- [x] 4.4 Crear endpoints para asignar docente a materia (`POST/GET /api/v1/subjects/:id/teachers`)

## 5. Frontend — AdminDashboard (IMPLEMENTADO)

- [x] 5.1 Crear `frontend/src/pages/AdminDashboard.jsx` — layout con tabs para Users, Courses, Students
- [x] 5.2 Crear `frontend/src/components/DataTable.jsx` — tabla reutilizable con Chakra UI
- [x] 5.3 Crear formularios CRUD para usuarios, cursos y alumnos
- [x] 5.4 Agregar ruta protegida en `AppRoutes.jsx` para el AdminDashboard

## 6. Tests (IMPLEMENTADO)

- [x] 6.1 Tests de CRUD usuarios: creación, duplicado de email, desactivación, reactivación
- [x] 6.2 Tests de CRUD cursos y materias
- [x] 6.3 Tests de CRUD alumnos y vinculación padre-alumno
- [x] 6.4 Tests de permisos: endpoints admin devuelven 403 para roles no-admin
