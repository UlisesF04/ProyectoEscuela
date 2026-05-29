## Context

El frontend actual fue construido incrementalmente durante los changes C-03 a C-08. Como resultado:
- Cada dashboard es un archivo monolítico con secciones inline (sin routing interno)
- No existe `theme.js` — Chakra UI usa sus defaults
- Solo 5 componentes compartidos (DataTable, DashboardLayout, DashboardHeader, AttendanceGrid, AuthContext)
- Los estados de carga/error/vacío son inconsistentes entre dashboards
- No hay diseño responsivo para mobile/tablet
- El diseño Google Stitch (Tailwind v4) con paleta warm/terracota, glassmorphism y tipografía Montserrat+Inter nunca se implementó

Este diseño define la arquitectura para migrar de dashboards monolíticos a un sistema de rutas anidadas por rol con theme tokens centralizados.

## Goals / Non-Goals

**Goals:**
- Theme tokens Stitch → Chakra UI `extendTheme` (colores, tipografía, radios, sombras, glassmorphism)
- Arquitectura de rutas anidadas por rol con `Outlet` de React Router
- 8 specs de capacidad que cubren todas las vistas del sistema
- Componentes compartidos con estados loading/empty/error completos
- Layout responsivo: sidebar colapsable en tablet, hamburger drawer en mobile
- NotFoundPage y UnauthorizedPage como componentes dedicados (no inline)

**Non-Goals:**
- NO cambiar lógica de negocio del backend
- NO crear nuevos endpoints API
- NO modificar migraciones o modelos
- NO agregar nuevas funcionalidades (solo refactor visual)
- NO implementar animaciones complejas (se abordarán post-refactor si aplica)

## Decisions

### D-01: Theme tokens como `extendTheme` de Chakra
- **Decisión**: Crear `frontend/src/theme.js` con `extendTheme({ colors, fonts, radii, shadows, styles, components })`
- **Alternativa considerada**: CSS Modules + Tailwind. Se descarta porque Chakra UI ya está integrado y `extendTheme` es la vía nativa de personalización. No se introduce Tailwind porque duplicaría el sistema de estilos.
- **Tokens Stitch**:
  - Backgrounds: `#f9f9ff` surface, `#f1f3ff` container-low
  - Primary: `#0052b1`, hover: `#0069e0`
  - Tintes por rol: admin(`#f4f0ff` violeta), preceptor(`#e6fcf5` teal), docente(`#fff4ed` naranja), padre(`#fff0f6` rosa)
  - Vivid accents: amber(`#f59e0b`), orange(`#ea580c`), terracotta(`#7c2d12`)
  - Tipografía: Montserrat (headings, 700), Inter (body, 400/500/600)
  - Radios: 32px cards, pill borders (full), 12px inputs
  - Sombras: `rgba(124, 45, 18, 0.08)` warm shadow

### D-02: Routing anidado por rol con `Outlet`
- **Decisión**: Cada rol tiene un layout wrapper + sidebar + `<Outlet />` para renderizar sub-páginas. `AppRoutes.jsx` usa rutas anidadas de React Router v6.
- **Estructura**:
  ```
  /admin
    /admin → DashboardOverview
    /admin/users → UsersPage
    /admin/courses → CoursesPage
    /admin/students → StudentsPage
    /admin/assignments → AssignmentsPage
    /admin/links → LinksPage
    /admin/leaves → LeavesPage
    /admin/notifications → NotificationLogsPage
    /admin/config → ConfigurationPage
  /preceptor
    /preceptor → redirect a /preceptor/attendance/register
    /preceptor/attendance/register → AttendanceRegisterPage
    /preceptor/attendance/history → AttendanceHistoryPage
    /preceptor/justify → PendingCertificatesPage
  /docente
    /docente → redirect a /docente/grades
    /docente/grades → GradesPage
    /docente/tasks → TasksPage
    /docente/tasks/:taskId/submissions → TaskSubmissionsPage
    /docente/leaves → MyLeavesPage
    /docente/profile → ProfileSection
  /padre
    /padre → redirect a /padre/grades
    /padre/grades → ChildGradesPage
    /padre/attendances → ChildAttendancesPage
    /padre/tasks → ChildTasksPage
    /padre/upload-certificate → UploadCertificatePage
  ```
- **Alternativa considerada**: Un solo layout con routing condicional. Se descarta porque mezcla sidebars de roles diferentes y complica el mantenimiento. Cada rol tiene items de navegación distintos.

### D-03: Componentes compartidos con estados completos
- **Decisión**: Cada componente compartido implementa 3 estados visuales: loading (skeleton), empty (icono + mensaje + acción opcional), y error (alert + retry). El estado se controla via props.
- **Contrato**:
  ```jsx
  <EmptyState icon={FiInbox} title="Sin datos" description="No hay registros" action={<Button>Crear</Button>} />
  <LoadingSkeleton variant="table" rows={5} />
  <ErrorAlert error={error} onRetry={refetch} />
  <ErrorBoundary fallback={<ErrorFallback />}>
    <Component />
  </ErrorBoundary>
  ```

### D-04: DashboardLayout refactor con sidebar configurable
- **Decisión**: `DashboardLayout` recibe `sections` (array de `{id, label, icon, path}`) y renderiza sidebar + header + `<Outlet />`. Cada rol pasa sus propias secciones. Sidebar colapsable con estado guardado en localStorage.
- **Responsive**: ≥1024px sidebar fija 280px, 768-1023px rail 64px (solo iconos), <768px hamburger drawer overlay.

### D-05: States loading/empty/error en cada página
- **Decisión**: Toda página que consume APIs debe manejar estos 4 estados:
  1. **Loading**: Skeleton específico del contenido (tabla, cards, texto)
  2. **Empty**: EmptyState con icono + mensaje contextual + acción opcional
  3. **Error**: Toast de error + contenido degradado parcial (no pantalla en blanco)
  4. **Success**: Toast verde + actualización visual

## Risks / Trade-offs

| Riesgo | Mitigación |
|--------|------------|
| Sidebar colapsable con animaciones → posible jank en mobile | Usar transiciones CSS nativas (no JS-driven). `transition: width 0.2s ease` |
| Rutas anidadas pueden romper navegación existente | Mantener redirects de rutas viejas → nuevas durante la migración |
| Refactor de componentes rotos por cambio de props | Cada sub-fase se implementa y prueba independientemente. Los dashboards viejos se mantienen hasta que el nuevo esté funcional |
| Glassmorphism no soportado en Firefox < 90 | Fallback: `background-color: rgba(255,255,255,0.8)` sin backdrop-filter. Es degradación suave (visual, no funcional) |
| Montserrat e Inter no cargados → FOIT | Usar `@fontsource/montserrat` y `@fontsource/inter` con `font-display: swap` en el theme |
| Migrar 5 dashboards en una sesión es demasiado scope | Las sub-fases C-13.1 a C-13.4 son independientes y se implementan una por sesión |

## Migration Plan

1. **C-13.0**: Crear `theme.js` → importar en `main.jsx` → verificar que no rompa nada (los componentes existentes heredan defaults)
2. **C-13.5**: Crear shared components (sin romper referencias existentes)
3. **C-13.1→C-13.4**: Por cada rol: crear páginas nuevas → refactor `AppRoutes.jsx` con rutas anidadas → las rutas viejas redirigen a las nuevas → eliminar dashboard monolítico viejo
4. **C-13.6**: Aplicar props responsivas a todos los componentes
5. **C-13.7**: Agregar vistas faltantes (NotFound, Unauthorized, condicionales)
6. **Rollback**: Cada sub-fase es atómica. Si una falla, solo esa sub-fase se revierte.

## Open Questions

- ¿Los servicios API actuales (`adminService.js`, `gradesService.js`, etc.) se mantienen igual o se refactorizan para usar react-query/SWR? Decisión actual: mantener axios + useState, migrar a react-query queda post-MVP.
- ¿Se agrega `@fontsource/montserrat` y `@fontsource/inter` como dependencias? Sí, son las fuentes del design system Stitch.
- ¿Se versiona el diseño Stitch original como referencia en `docs/`? Sí, ya existe `Diseño Front/CANONICAL_SYS_VISTAS.md`.
