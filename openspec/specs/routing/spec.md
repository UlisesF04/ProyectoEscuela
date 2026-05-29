# routing Specification

## Purpose
TBD - created by archiving change c-13-frontend-redesign. Update Purpose after archive.
## Requirements
### Requirement: Nested routing structure per role
The system SHALL define routes using nested `<Route>` elements, one parent route per role wrapping a layout component that renders `<Outlet />`. Each parent SHALL have child routes for each page in that role.

**Route structure:**
```
<Routes>
  <Route path="/login" element={LoginPage} />
  <Route path="/unauthorized" element={UnauthorizedPage} />
  
  <Route path="/admin" element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}>
    <Route index element={<DashboardOverview />} />
    <Route path="users" element={<UsersPage />} />
    <Route path="courses" element={<CoursesPage />} />
    <Route path="students" element={<StudentsPage />} />
    <Route path="assignments" element={<AssignmentsPage />} />
    <Route path="links" element={<LinksPage />} />
    <Route path="leaves" element={<LeavesPage />} />
    <Route path="notifications" element={<NotificationLogsPage />} />
    <Route path="config" element={<ConfigurationPage />} />
  </Route>
  
  <Route path="/preceptor" element={<ProtectedRoute role="preceptor"><PreceptorLayout /></ProtectedRoute>}>
    <Route index element={<Navigate to="attendance/register" />} />
    <Route path="attendance/register" element={<AttendanceRegisterPage />} />
    <Route path="attendance/history" element={<AttendanceHistoryPage />} />
    <Route path="justify" element={<PendingCertificatesPage />} />
  </Route>
  
  <Route path="/docente" element={<ProtectedRoute role="docente"><DocenteLayout /></ProtectedRoute>}>
    <Route index element={<Navigate to="grades" />} />
    <Route path="grades" element={<GradesPage />} />
    <Route path="tasks" element={<TasksPage />} />
    <Route path="tasks/:taskId/submissions" element={<TaskSubmissionsPage />} />
    <Route path="leaves" element={<MyLeavesPage />} />
    <Route path="profile" element={<ProfileSection />} />
  </Route>
  
  <Route path="/padre" element={<ProtectedRoute role="padre"><PadreLayout /></ProtectedRoute>}>
    <Route index element={<Navigate to="grades" />} />
    <Route path="grades" element={<ChildGradesPage />} />
    <Route path="attendances" element={<ChildAttendancesPage />} />
    <Route path="tasks" element={<ChildTasksPage />} />
    <Route path="upload-certificate" element={<UploadCertificatePage />} />
  </Route>
  
  <Route path="/" element={token ? <DashboardRedirect /> : <Navigate to="/login" />} />
  <Route path="*" element={<NotFoundPage />} />
</Routes>
```

#### Scenario: Admin route renders layout with Outlet
- **WHEN** admin navigates to `/admin/users`
- **THEN** the AdminLayout SHALL render with sidebar, and UsersPage SHALL render inside `<Outlet />`

#### Scenario: Preceptor root redirects
- **WHEN** preceptor navigates to `/preceptor`
- **THEN** it SHALL redirect to `/preceptor/attendance/register`

### Requirement: NotFoundPage component (404)
The system SHALL render a `<NotFoundPage>` component at `pages/NotFoundPage.jsx` with a large "404" heading, "Página no encontrada" subtitle, a "Volver al inicio" button, and a decorative illustration/icon. This SHALL replace the current `*` catch-all `<Navigate to="/" />`.

#### Scenario: NotFoundPage renders for unknown route
- **WHEN** user navigates to `/ruta-inexistente`
- **THEN** NotFoundPage SHALL display with 404 heading and "Volver al inicio" button

### Requirement: UnauthorizedPage as standalone component
The system SHALL extract the current inline unauthorized view into `<UnauthorizedPage>` at `pages/UnauthorizedPage.jsx` with lock icon, "Acceso no autorizado" heading, "No tienes permisos para acceder a esta sección" message, "Volver a mi dashboard" button (redirects by role), and "Cerrar sesión" button.

#### Scenario: UnauthorizedPage shows for restricted access
- **WHEN** user with wrong role tries to access a protected route
- **THEN** UnauthorizedPage SHALL display with role-appropriate redirect button

### Requirement: ProtectedRoute uses role-based access
The existing `<ProtectedRoute>` component SHALL be enhanced to:
- Redirect to `/login` if no token
- Redirect to `/unauthorized` if user role not in `requiredRoles`
- Render `<Outlet />` for valid users (or children if no nesting)

#### Scenario: ProtectedRoute blocks wrong role
- **WHEN** a docente navigates to `/admin`
- **THEN** ProtectedRoute SHALL redirect to `/unauthorized`

#### Scenario: ProtectedRoute allows valid role
- **WHEN** an admin navigates to `/admin/users`
- **THEN** ProtectedRoute SHALL render the Outlet with the target page

### Requirement: Redirect map by role
The `<DashboardRedirect>` component SHALL redirect authenticated users to their role dashboard root based on a map: `{ admin: '/admin', preceptor: '/preceptor', docente: '/docente', padre: '/padre' }`. Unknown roles SHALL redirect to `/login`.

#### Scenario: DashboardRedirect sends admin to /admin
- **WHEN** authenticated admin visits `/`
- **THEN** they SHALL be redirected to `/admin`

#### Scenario: DashboardRedirect sends parent to /padre
- **WHEN** authenticated padre visits `/login` (already logged in)
- **THEN** they SHALL be redirected to `/padre`

