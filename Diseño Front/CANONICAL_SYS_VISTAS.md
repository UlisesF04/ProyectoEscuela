# PROYECTO COMPLETO GESTIÓN ESCOLAR: CANONICAL DESIGN SYSTEM & VISTAS

---
name: Cozy Chocolate Cream EduConnect Palette
theme: warm-light-cozy
colors:
  background: '#FFF8F2'             # Soft warm cream background
  primary: '#FF6B35'                # Brand Orange / Warm Amber
  secondary: '#F7C59F'              # Light Peach Accent
  tertiary: '#2D1B08'               # Cozy Dark Chocolate Sidebar
  tertiary-container: '#3D2511'     # Rich Warm Brown Container
  on-tertiary-container: '#F7C59F'  # Light peach placeholder/accent
  surface: '#FFFDFB'                # Vanilla surface background
  surface-container-lowest: '#ffffff'
  surface-container-low: '#FFFDFB'
  surface-container: '#FFF9F4'
  surface-container-high: '#FFF5ED'
  on-surface-variant: '#7D5A44'     # Soft cocoa text color
  outline: '#E8D5C4'                # Cream border line

  # Theme mappers automatically mapped from Slate-utilities in CSS
  slate-50: '#FFFDFB'               # Warm-beige container background
  slate-100: '#E8D5C4'              # Light border accents
  slate-200: '#D8C3B1'              # Medium border bounds
  slate-300: '#C0A997'              # Solid greyish brown placeholder/ticks
  slate-400: '#9C8370'              # Muted paragraph icons/sub-elements
  slate-500: '#7D5A44'              # Descriptive subtexts
  slate-605: '#634532'              # Informative text highlights
  slate-700: '#463021'              # Base body text
  slate-800: '#2D1B08'              # Primary dark headers and titles
  slate-900: '#1B0F04'              # Core dark emphasis

  # Vivid accents
  vivid-amber: '#FF6B35'
  success-green: '#10B981'
  error-red: '#EF4444'

typography:
  display:
    fontFamily: Montserrat (Substitute for Aeonik)
    letterSpacing: -0.02em
    weight: Bold (700)
  body:
    fontFamily: Inter (Substitute for Geist)
    letterSpacing: -0.01em
    weight: Regular (400), Medium (500), Semibold (600)

shapes & elevation:
  cards_radius: 32px
  buttons_radius: 32px (Pill style)
  inputs_radius: 12px
  shadow_lg: 'rgba(45, 27, 8, 0.08) 0px 14px 20px 4px'
---

## ESPECIFICACIÓN DETALLADA DE LAS 27 VISTAS DEL SISTEMA

### 1. VISTAS PÚBLICAS

#### 1.1 LoginPage (/login)
- **Aesthetic**: Cozy sunset-chocolate gradient background with warm amber active features over a glassmorphic warm-cream central card.
- **Components**: Graduation logo with circular container, user email field (with validation), password field with visibility toggle, Sign-In button with loading spinner, Support link.
- **Adaptive**: Fully centered on mobile, tablet, and desktop. Large cards scale max-width to 450px on desktop with 40px internal margins.

#### 1.2 UnauthorizedPage (/unauthorized)
- **Aesthetic**: High contrast warning view using warm amber accents.
- **Components**: Locked padlock SVG icon, "Acceso no autorizado" warning label, "Volver al Dashboard" action button, Logout option.

#### 1.3 NotFoundPage (404 Catch-All)
- **Aesthetic**: Playful 404 illustration with orange/amber accents.
- **Components**: Giant "404" indicator, "Página no encontrada" guide text, "Volver al inicio" button.

---

### 2. VISTAS DEL ADMINISTRADOR (Paleta: Cozy Chocolate Cream & Warm Beige)

#### 2.1 AdminDashboard (/admin)
- **Aesthetic**: Clean grid of statistics over a subtle warm cream (Vanilla #FFF8F2) tinted canvas.
- **Summary Cards**:
  - Total Active Users: Card with dynamic trigger +12% indicator.
  - Active Courses: Card showing state "Stable".
  - Registered Students: Card with +5% trend badges.
  - Pending Leaves: Vibrant Card with "Action Needed" indicator linking toleaves page.
- **Components**: Fixed 280px sidebar on desktop, collapsible hamburger menu on mobile, responsive bento grid (1 col mobile, 2 cols tablet, 4 cols desktop).

#### 2.2 AdminUsersPage (/admin/users)
- **Components**: User list with Role indicators: Admin (Red), Preceptor (Orange), Teacher (Blue), Parent (Green). Action buttons for Create user, Edit, Delete (with active dialog warnings). Search text field and role filter.

#### 2.3 AdminCoursesPage (/admin/courses)
- **Components**: Table managing classes, Division (e.g. 1º A), Nivel, and active subjects. Actions with expandable subjects sub-modal for instant creation or deletion of subjects inside the selected class.

#### 2.4 AdminStudentsPage (/admin/students)
- **Components**: Table with Student Info: Name, DNI, Class, Parent indicators. Responsive sub-modal to quickly "Vincular Padre" from existing parental profiles. Filter by class active.

#### 2.5 AdminTeacherAssignmentsPage (/admin/assignments)
- **Components**: Twin columns mapping teachers to exact subjects. Select dropdown for class -> select dropdown for subject -> Assign Teacher button. Action chips to drag/click delete assignments on the fly.

#### 2.6 AdminParentLinksPage (/admin/links)
- **Components**: Parent matching screen with Search and filters. Select relation (Padre/Madre/Tutor) and associate parent email to student profile directly.

#### 2.7 AdminLeavesPage (/admin/leaves)
- **Components**: Tabs for 'Pendientes de revisión' and 'Historial'. Cards with request info (Teacher name, dates, medical attachment file link). Action buttons "Aprobar" (vivid green) and "Rechazar" (danger red).

#### 2.8 AdminNotificationLogsPage (/admin/notifications)
- **Components**: Audit trail for active background alerts. Table displaying Notification Date, Recipient, Student, Alert Type, Channel (SMS, Email, WhatsApp), and Status (Enviado/Fallido with error string).

#### 2.9 AdminConfigurationPage (/admin/config)
- **Components**: Setup forms for Critical Absences limits (default 10), alert daily schedules (e.g. 18:00), active toggles to enable or disable messaging pipelines.

---

### 3. VISTAS DEL PRECEPTOR (Paleta: Cozy Chocolate Cream & Warm Beige)

#### 3.1 PreceptorDashboard Layout
- **Navigation Options**: Registrar Asistencia, Historial de Asistencia, Justificaciones Pendientes.

#### 3.2 AttendanceRegisterPage (/preceptor/attendance/register)
- **Components**: Course selection dropdown, Date picker. List of class students with 3 interactive toggle buttons: Presente (Mint Glaze), Ausente (Teal/Coral), Tarde (Sunburst). Save all button with saving states.

#### 3.3 AttendanceHistoryPage (/preceptor/attendance/history)
- **Components**: Absences filter, Student details search, student attendance analytics with summary cards (% Attendance, Total absent, late arrivals).

#### 3.4 PendingCertificatesPage (/preceptor/justify)
- **Components**: Display certificates uploaded by parents. Actions: View certificate file, click "Justificar" causing irreversible confirmation dialog confirming justification status change.

---

### 4. VISTAS DEL DOCENTE (Paleta: Cozy Chocolate Cream & Warm Orange)

#### 4.1 DocenteDashboard Layout
- **Navigation Options**: Mis Materias, Tareas / Entregas, Mis Licencias, Mi Perfil.

#### 4.2 GradesPage (/docente/grades)
- **Components**: Subject selector, trimester selector, table showing students with live numerical inputs (0-10) validating ranges instantly. Save Row icon or batch Save All button.

#### 4.3 TasksPage (/docente/tasks)
- **Components**: List of assignments / homework. Card displays: Title, due date (color coded), ratio of student submissions (e.g. 12 of 15 submitted). Create assignment button triggers form modal.

#### 4.4 TaskSubmissionsPage (/docente/tasks/:taskId/submissions)
- **Components**: Gradebook list of students for selected homework with single-direction state dropdown (Pendiente -> Entregada/Tarde) showing clear color codes.

#### 4.5 MyLeavesPage (/docente/leaves)
- **Components**: Teacher leave application form: select reason (Enfermedad, Personal, Gremial), start/end date, calculated days. History with request status (Aprobada, Pendiente, Rechazada).

#### 4.2.6 ProfileSection (/docente/profile)
- **Components**: Displays teacher profile data cleanly (Name, Email, Phone, Active subjects).

---

### 5. VISTAS DEL PADRE (Paleta: Cozy Chocolate Cream & Elegant Peach)

#### 5.1 PadreDashboard Layout
- **Navigation Options**: Mis Hijos (Active indicator), Calificaciones, Asistencias, Tareas, Subir Certificado Médico.

#### 5.2 ChildSelector Component
- **Adaptive**: Compact horizontal tab row if ≤ 3 children, or dropdown picker if > 3 children. Immediately loads selected child context parameters.

#### 5.3 ChildGradesPage (/padre/grades)
- **Components**: Grid of child grades organized by trimester and subject. Color coded status showing danger for values under 4, warning (4-6), success (green for ≥ 7). Average mark indicator.

#### 5.4 ChildAttendancesPage (/padre/attendances)
- **Components**: List of present/absent dates. Display banner with high absentee warning if total absences exceed configuration limits.

#### 5.5 ChildTasksPage (/padre/tasks)
- **Components**: Real-time display of homework assignments of the child, with indicators for upcoming due dates (vending in ≤ 2 days).

#### 5.6 UploadCertificatePage (/padre/upload-certificate)
- **Components**: Absences selector dropdown, file dropzone area with validation parameters (PNG/JPG/PDF, max 5MB) and drag & drop support, upload action bar with file progress.

## DIRECTRICES DE DISEÑO RESPONSIVO Y MAQUETACIÓN

1. **Responsive Breakdown Rules**:
   - **Desktops (≥1024px)**: Fixed 280px navigation sidebar with rounded borders. Main content area sits in a scrollable container with 40px padding. Card grids occupy 3 or 4 columns.
   - **Tablets (768px-1023px)**: Nav sidebar collapses into a narrow 64px rail with icons only. Bento grids adapt into 2 columns.
   - **Mobiles (<768px)**: Fixed full-width header with hamburger toggle showing Drawer overlay menu. All grids transform to full-bleed, single-column rows with 16px lateral padding.

2. **Contrast & Theme Rules**:
   - Font pairings: **Montserrat** for display headers, creating compact geometric layout titles. **Inter** for all list tags, forms, tables, and supporting notes.
   - White standard cards with 32px rounded corners floating beautifully on cozy warm neutral chocolate cream backdrops.
   - Clear focus state borders in vivid Brand Orange (#FF6B35) with a soft 3px outer shadow ring.