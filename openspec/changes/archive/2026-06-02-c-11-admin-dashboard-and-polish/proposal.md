## Why

C-10 (notification-agent) y C-09 (teacher-leaves-module) ya están completos, y C-13 (frontend-redesign) dejó las vistas de admin creadas pero con datos básicos. Este change cierra el gap: enriquece el DashboardOverview con datos reales del agente de notificaciones y licencias, implementa el backend de configuración del umbral RN-18, añade los guards de calidad faltantes (ErrorBoundary, manejo de 429), y verifica responsive en todos los dashboards.

## What Changes

- **DashboardOverview**: Agregar widgets de resumen — notificaciones recientes, licencias pendientes, alumnos con ausencias críticas, quick-actions
- **Backend `/api/v1/config`**: Endpoint GET/PUT para persistir configuración del sistema (umbral ausencias, horario notificaciones, alertas habilitadas)
- **Backend `/api/v1/admin/stats`**: Endpoint con estadísticas agregadas para el dashboard (totales + últimas notificaciones + licencias pendientes)
- **ErrorBoundary**: Envolver cada dashboard de admin con ErrorBoundary para capturar errores de render
- **Manejo HTTP 429**: Interceptor en `api.js` que muestre mensaje amigable al recibir rate limit
- **Responsive**: Verificar y corregir layout de vistas admin en mobile (<768px)
- **Tests**: Suite de integración para dashboard admin (stats), configuración (CRUD), y notification logs

## Capabilities

### New Capabilities
- `admin-dashboard-stats`: Endpoint de estadísticas agregadas para el panel de admin (totales de usuarios, cursos, alumnos + últimas notificaciones + licencias pendientes)
- `admin-config`: Endpoints GET/PUT para persistir configuración del sistema (umbral RN-18, horario notificaciones, toggles de alertas)

### Modified Capabilities
- `admin-views`: Enriquecer DashboardOverview con nuevos widgets; agregar ErrorBoundary; verificar responsive mobile
- `notification-alerts`: El panel de NotificationLogsPage ya existe y está conectado — verificar filtros y agregar tests
- `shared-components`: ErrorBoundary debe integrarse a nivel de layout de admin; api.js interceptor debe manejar 429

## Impact

- **Backend**: Nuevo módulo `modules/config/` con endpoints GET/PUT `/api/v1/config`; nuevo endpoint `GET /api/v1/admin/stats` en módulo existente o nuevo
- **Frontend**: Modificar `DashboardOverview.jsx` para usar el nuevo endpoint de stats; agregar ErrorBoundary en `AdminLayout.jsx`; agregar interceptor 429 en `services/api.js`
- **Tests**: Test de integración para config CRUD, dashboard stats, notification logs, error 429
- **Base de datos**: Posible nueva tabla `config` si no existe (seed con valores default)
