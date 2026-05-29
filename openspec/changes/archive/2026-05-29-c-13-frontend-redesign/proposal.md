## Why

El frontend actual tiene 5 dashboards monolíticos (uno por rol) sin separación por ruta, sin `theme.js` personalizado, y con componentes básicos sin estados completos (loading, empty, error). El diseño premium generado por Google Stitch (Tailwind v4) define un design system warm/terracota con glassmorphism, cards 32px, tipografía Montserrat+Inter y tintes por rol que no se ha aplicado. Este refactor adaptará ese diseño a nuestro stack Chakra UI + React Router v6, dividiendo cada dashboard en vistas independientes y componetizando todo el frontend.

## What Changes

- **Theme tokens**: Crear `frontend/src/theme.js` con `extendTheme` mapeando colores Stitch, tipografía Montserrat+Inter, radios (32px cards, pill buttons, 12px inputs), sombras warm, tintes por rol y glassmorphism.
- **Shared components**: Crear EmptyState, LoadingSkeleton, ErrorBoundary, ErrorAlert, GradeForm, AttendanceSummary, ChildSelector. Refactorizar DataTable y DashboardLayout con diseño Stitch.
- **Admin views**: Separar `AdminDashboard.jsx` → 9 páginas por ruta (`/admin`, `/admin/users`, `/admin/courses`, `/admin/students`, `/admin/assignments`, `/admin/links`, `/admin/leaves`, `/admin/notifications`, `/admin/config`) con sidebar propia.
- **Preceptor views**: Separar `PreceptorDashboard.jsx` → 3 páginas (`/preceptor/attendance/register`, `/preceptor/attendance/history`, `/preceptor/justify`) más layout base.
- **Docente views**: Separar `DocenteDashboard.jsx` → 5 páginas (`/docente/grades`, `/docente/tasks`, `/docente/tasks/:taskId/submissions`, `/docente/leaves`, `/docente/profile`) más layout base.
- **Padre views**: Separar `PadreDashboard.jsx` → 4 páginas (`/padre/grades`, `/padre/attendances`, `/padre/tasks`, `/padre/upload-certificate`) más layout base + ChildSelector.
- **Responsive mobile**: Sidebar → hamburger drawer en mobile, grids 4cols→1col, tablas → scroll horizontal, modales → fullscreen, touch targets ≥44px.
- **Missing views**: NotFoundPage (catch-all), UnauthorizedPage, AdminLeavesPage, AdminNotificationLogsPage, AdminConfigurationPage.
- **Routing**: Refactor `AppRoutes.jsx` con rutas anidadas por rol usando `Outlet` de React Router.
- **Estados completos**: Toda página con estados loading (skeleton), empty (icono+mensaje), error (toast), y edge cases específicos.

## Capabilities

### New Capabilities
- `frontend-theme`: Design system tokens de Stitch adaptados a Chakra UI — colores, tipografía, radios, sombras, glassmorphism, animaciones
- `frontend-shared-components`: Componentes reutilizables (EmptyState, LoadingSkeleton, ErrorBoundary, ErrorAlert, GradeForm, AttendanceSummary, ChildSelector)
- `frontend-admin-views`: Vista general + CRUD usuarios/cursos/alumnos + asignaciones/vínculos/licencias/logs/config
- `frontend-preceptor-views`: Registro de asistencia, historial, justificaciones con certificados
- `frontend-docente-views`: Calificaciones, tareas, entregas, licencias, perfil
- `frontend-padre-views`: Notas, asistencias, tareas, subida de certificados con selector de hijos
- `frontend-responsive`: Adaptación mobile (hamburger drawer, grids 1col, tablas responsivas, modales fullscreen)
- `frontend-routing`: Arquitectura de rutas anidadas por rol con layouts, NotFoundPage, UnauthorizedPage

### Modified Capabilities
<!-- No existing specs to modify — this is the first frontend-focused change -->

## Impact

- **Frontend**: Refactor completo de `frontend/src/pages/` y `frontend/src/components/`. Creación de `frontend/src/theme.js`. Modificación de `frontend/src/routes/AppRoutes.jsx` y `frontend/src/components/DashboardLayout.jsx`.
- **Backend**: Sin cambios. Todos los endpoints existentes se mantienen intactos.
- **Tests**: No se requieren tests nuevos por ahora (solo UI). Los tests de integración existentes no se ven afectados.
- **Datos**: Sin migraciones ni cambios en base de datos.
- **Riesgo**: Visual-only. Si un componente falla, el backend sigue funcionando. Los dashboards monolíticos actuales quedan como respaldo hasta que el refactor esté completo por rol.
