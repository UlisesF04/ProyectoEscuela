## Why

El sistema necesita un portal parental donde los padres/madres puedan consultar la información académica de sus hijos: notas, asistencias y datos de perfil. Es el único punto de contacto directo con las familias y un diferenciador clave del proyecto. Sin este módulo, los padres no tienen visibilidad del progreso escolar de sus hijos.

## What Changes

- Nuevo endpoint `GET /api/v1/students/me/children` que devuelve los hijos vinculados al padre autenticado
- Frontend `PadreDashboard.jsx` con secciones: Mis Hijos (cards con acciones), Mi Perfil
- `DashboardLayout.jsx` — layout reutilizable con sidebar colapsable para todos los dashboards
- Servicios frontend: `parentService.js` (hijos), `gradesService.js` (notas), `attendanceService.js` (asistencias)
- Modales de consulta: notas por materia y asistencias con resumen de totales
- Refactor de `AdminDashboard.jsx`, `PreceptorDashboard.jsx`, `DocenteDashboard.jsx` para usar `DashboardLayout`

## Capabilities

### New Capabilities
- `parent-child-view`: Visualización de hijos vinculados y acceso a su información académica
- `parent-grade-query`: Consulta de calificaciones por hijo (consumo de C-06)
- `parent-attendance-query`: Consulta de asistencias con resumen de totales (consumo de C-05)
- `dashboard-layout`: Layout unificado con sidebar colapsable para todos los dashboards

### Modified Capabilities
- `auth-system`: Nuevo middleware roleMiddleware('padre') para rutas parentales

## Impact

- **Backend**: Nuevo endpoint `GET /students/me/children` en `students.routes.js`
- **Frontend**: Nuevo `PadreDashboard.jsx`, `DashboardLayout.jsx`, refactor de dashboards existentes
- **Reglas de negocio cubiertas**: RN-03 (vinculación padre-alumno)
