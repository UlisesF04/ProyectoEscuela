## 1. Backend

- [x] 1.1 Agregar endpoint `GET /api/v1/students/me/children` en students.routes.js con roleMiddleware('padre')
- [x] 1.2 Implementar `getMyChildren` en students.service.js (consulta a ParentStudent + include Student + Course)

## 2. Frontend — DashboardLayout

- [x] 2.1 Crear `frontend/src/components/DashboardLayout.jsx` con sidebar colapsable, avatar, navegación por secciones, logout
- [x] 2.2 Refactor `AdminDashboard.jsx` para usar DashboardLayout
- [x] 2.3 Refactor `PreceptorDashboard.jsx` para usar DashboardLayout
- [x] 2.4 Refactor `DocenteDashboard.jsx` para usar DashboardLayout

## 3. Frontend — PadreDashboard

- [x] 3.1 Crear `frontend/src/services/parentService.js` con getMyChildren
- [x] 3.2 Crear `frontend/src/pages/PadreDashboard.jsx` con secciones Mis Hijos y Mi Perfil
- [x] 3.3 Implementar modal de consulta de notas (consume GET /api/v1/students/:id/grades)
- [x] 3.4 Implementar modal de consulta de asistencias (consume GET /api/v1/students/:id/attendances)
- [x] 3.5 Agregar ruta `/padre` en AppRoutes.jsx

## 4. Hotfix

- [x] 4.1 Agregar `useDisclosure` al import de Chakra en PadreDashboard.jsx (bug crítico)
