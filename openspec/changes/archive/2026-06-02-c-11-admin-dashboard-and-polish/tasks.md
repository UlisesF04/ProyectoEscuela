## 1. Backend — Admin Stats Endpoint

- [x] 1.1 Crear módulo `backend/modules/admin-stats/` con `admin-stats.controller.js`, `admin-stats.service.js`, `admin-stats.routes.js`
- [x] 1.2 Implementar `adminStatsService.getStats()` con consultas agregadas: COUNT usuarios activos, COUNT cursos, COUNT alumnos, COUNT licencias pendientes, últimas 5 notification_logs, alumnos con ≥20% ausencias
- [x] 1.3 Montar `GET /api/v1/admin/stats` en `app.js` con middleware auth + role('admin')
- [x] 1.4 Agregar validación express-validator para `PUT /api/v1/config` (absence_threshold entre 1-50)

## 2. Frontend — DashboardOverview Enrichment

- [x] 2.1 Modificar `DashboardOverview.jsx` para consumir `GET /api/v1/admin/stats` en lugar de 3 llamadas individuales
- [x] 2.2 Agregar cards de "Licencias Pendientes" (con badge "Action Needed") y "Notificaciones Hoy"
- [x] 2.3 Agregar sección "Actividad Reciente" con últimas 5 notificaciones y licencias pendientes
- [x] 2.4 Verificar loading skeletons, empty states y error states en el dashboard

## 3. Frontend — ErrorBoundary & Quality

- [x] 3.1 Envolver `<DashboardLayout>` en `AdminLayout.jsx` con `<ErrorBoundary>`
- [x] 3.2 Agregar interceptor en `api.js` que muestre mensaje amigable para HTTP 429
- [x] 3.3 Verificar responsive en todas las vistas admin: sidebar drawer mobile, tablas scroll horizontal, modales full-screen
- [x] 3.4 Verificar ruta `/unauthorized` y NotFoundPage para rutas inválidas

## 4. Tests

- [x] 4.1 Test de integración: `GET /api/v1/admin/stats` devuelve datos agregados
- [x] 4.2 Test de integración: `GET /api/v1/config` devuelve configuración con defaults
- [x] 4.3 Test de integración: `PUT /api/v1/config` persiste cambios y valida rangos
- [x] 4.4 Test de integración: `GET /api/v1/notifications` con filtros (tipo, estado, fecha)
- [x] 4.5 Test de integración: admin stats rechaza acceso a roles no-admin (403)
