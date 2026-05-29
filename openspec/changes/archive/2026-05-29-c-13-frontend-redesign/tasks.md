# Tasks: C-13 Frontend Redesign

> Refactor completo del frontend: theme tokens Stitch → Chakra UI, 27 vistas separadas por ruta, componentes compartidos, responsivo.

## 1. Theme Tokens (C-13.0)

- [x] 1.1 Crear `frontend/src/theme.js` con `extendTheme` mapeando colores Stitch (surface, primary, secondary, tertiary, vivid accents, role tints)
- [x] 1.2 Configurar tipografía: `@fontsource/montserrat` para headings y `@fontsource/inter` para body
- [x] 1.3 Definir `radii` tokens: 32px cards, pill buttons (full), 12px inputs
- [x] 1.4 Definir `shadows` tokens warm (terracotta rgba)
- [x] 1.5 Agregar glassmorphism global styles (`.glass-panel` con backdrop-filter)
- [x] 1.6 Crear keyframes para animated gradient del LoginPage + fadeSlideIn
- [x] 1.7 Importar `theme.js` en `main.jsx` via `<ChakraProvider theme={theme}>`

## 2. Routing & Layout Architecture (C-13.5/7 parte routing)

- [x] 2.1 Refactor `AppRoutes.jsx` con rutas anidadas por rol usando `<Outlet />`
- [x] 2.2 Crear `pages/NotFoundPage.jsx` (404 catch-all con "Volver al inicio")
- [x] 2.3 Extraer `pages/UnauthorizedPage.jsx` del inline actual con lock icon + acciones
- [x] 2.4 Refactor `ProtectedRoute.jsx` para soportar `<Outlet />` (ya lo tenía)
- [x] 2.5 Refactor `DashboardLayout.jsx` para aceptar `sections` y usar `<Outlet />`
- [x] 2.6 Implementar sidebar colapsable con 3 breakpoints (280px / 64px rail / hamburger drawer)
- [x] 2.7 Conectar estado de sidebar colapsada a localStorage

## 3. Shared Components (C-13.5)

- [x] 3.1 Crear `components/EmptyState.jsx` con icon, title, description, action props
- [x] 3.2 Crear `components/LoadingSkeleton.jsx` con variantes table/card/text
- [x] 3.3 Crear `components/ErrorBoundary.jsx` con fallback + reintentar
- [x] 3.4 Crear `components/ErrorAlert.jsx` con mensajes por status code (401/403/429/500)
- [x] 3.5 Crear `components/GradeForm.jsx` con validación 0-10 y step 0.01
- [x] 3.6 Crear `components/AttendanceSummary.jsx` con cards de resumen + color coding
- [x] 3.7 Crear `components/ChildSelector.jsx` con tabs (≤3) / dropdown (>3)
- [x] 3.8 Refactor `DataTable.jsx` con diseño Stitch (32px radius, warm shadows, skeleton rows, empty state)

## 4. Admin Views (C-13.1)

- [x] 4.1 Crear `pages/admin/AdminLayout.jsx` con sidebar + `<Outlet />`
- [x] 4.2 Crear `pages/admin/DashboardOverview.jsx` — 5 summary cards con datos reales
- [x] 4.3 Crear `pages/admin/UsersPage.jsx` — CRUD usuarios con DataTable + modales
- [x] 4.4 Crear `pages/admin/CoursesPage.jsx` — cursos + materias expandibles
- [x] 4.5 Crear `pages/admin/StudentsPage.jsx` — alumnos + vinculación padres
- [x] 4.6 Crear `pages/admin/AssignmentsPage.jsx` — asignación docente→materias
- [x] 4.7 Crear `pages/admin/LinksPage.jsx` — vínculos padre-alumno
- [x] 4.8 Crear `pages/admin/LeavesPage.jsx` — aprobar/rechazar licencias con tabs
- [x] 4.9 Crear `pages/admin/NotificationLogsPage.jsx` — tabla de logs + filtros
- [x] 4.10 Crear `pages/admin/ConfigurationPage.jsx` — cards de configuración

## 5. Preceptor Views (C-13.2)

- [x] 5.1 Crear `pages/preceptor/PreceptorLayout.jsx` con sidebar teal + `<Outlet />`
- [x] 5.2 Crear `pages/preceptor/AttendanceRegisterPage.jsx` — grilla con 3 estados toggle
- [x] 5.3 Crear `pages/preceptor/AttendanceHistoryPage.jsx` — historial + resumen cards
- [x] 5.4 Crear `pages/preceptor/PendingCertificatesPage.jsx` — justificación + certificados

## 6. Docente Views (C-13.3)

- [x] 6.1 Crear `pages/docente/DocenteLayout.jsx` con sidebar naranja + `<Outlet />`
- [x] 6.2 Crear `pages/docente/GradesPage.jsx` — tabla de notas con inputs 0-10
- [x] 6.3 Crear `pages/docente/TasksPage.jsx` — lista de tareas + modal creación
- [x] 6.4 Crear `pages/docente/TaskSubmissionsPage.jsx` — entregas unidireccionales
- [x] 6.5 Crear `pages/docente/MyLeavesPage.jsx` — solicitud + historial
- [x] 6.6 Crear `pages/docente/ProfileSection.jsx` — datos personales

## 7. Padre Views (C-13.4)

- [x] 7.1 Crear `pages/padre/PadreLayout.jsx` con sidebar rosa + `<Outlet />`
- [x] 7.2 Crear `pages/padre/ChildGradesPage.jsx` — notas read-only con color coding
- [x] 7.3 Crear `pages/padre/ChildAttendancesPage.jsx` — asistencias + alerta visual
- [x] 7.4 Crear `pages/padre/ChildTasksPage.jsx` — tareas con urgencia ≤2 días
- [x] 7.5 Crear `pages/padre/UploadCertificatePage.jsx` — dropzone drag & drop

## 8. Responsive (C-13.6)

- [x] 8.1 Sidebar: hamburger drawer en mobile (<768px), rail 64px en tablet (768-1023px)
- [x] 8.2 Grids: summary cards 1 col mobile, 2 cols tablet, 4 cols desktop
- [x] 8.3 DataTable: scroll horizontal en mobile con contenedor overflow-x
- [x] 8.4 Modales: `size="full"` en mobile con close button top-left
- [x] 8.5 Touch targets: botones ≥44x44px en mobile
- [x] 8.6 Header: breadcrumb en desktop → solo título en mobile

## 9. LoginPage Refactor

- [x] 9.1 Aplicar animated gradient background del theme al LoginPage
- [x] 9.2 Refactor LoginPage con glassmorphism card, logo, Montserrat headings
- [x] 9.3 Verificar estados: loading, error, rate-limited, account deactivated

## 10. Limpieza Post-Refactor

- [x] 10.1 Eliminar archivos de dashboards monolíticos viejos (AdminDashboard.jsx, PreceptorDashboard.jsx, DocenteDashboard.jsx, PadreDashboard.jsx) — solo después de verificar que las rutas nuevas funcionan
- [x] 10.2 Verificar que todos los imports en `AppRoutes.jsx` apunten a los nuevos archivos
- [x] 10.3 Verificar que los servicios (adminService, gradesService, etc.) sigan funcionando con las nuevas páginas
- [x] 10.4 Ejecutar `npm run build` en frontend para verificar compilación sin errores
