/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Copy, Check, Download, Layers, Sparkles, BookOpen } from 'lucide-react';

export default function MarkdownExport() {
  const [copied, setCopied] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<'full' | 'design' | 'vistas'>('full');

  const mdDesignSystem = `---
name: Vivid Edu-Pulse (GenieStudio Warm Edition)
theme: warm-light
colors:
  surface: '#f9f9ff'
  surface-dim: '#d6dae8'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f3ff'
  surface-container: '#e9edfc'
  surface-container-high: '#e4e8f6'
  surface-container-highest: '#dee2f0'
  on-surface: '#171c26'
  on-surface-variant: '#424754'
  inverse-surface: '#2b303b'
  inverse-on-surface: '#ecf0ff'
  outline: '#727785'
  outline-variant: '#c2c6d6'
  primary: '#0052b1'
  primary-container: '#0069e0'
  secondary: '#7d38c7'
  secondary-container: '#b26ffe'
  tertiary: '#963700'
  tertiary-container: '#be4700'
  background: '#fafdff'
  
  # Warm role overlays
  admin-bg: '#f4f0ff'        # Deep Violet 5% tint
  preceptor-bg: '#e6fcf5'    # Ocean Spray/Teal 5% tint
  docente-bg: '#fff4ed'      # Warm Zesty Orange 5% tint
  padre-bg: '#fff0f6'        # Caring Pink 5% tint

  # Vivid accents
  vivid-amber: '#f59e0b'
  vivid-orange: '#ea580c'
  vivid-terracotta: '#7c2d12'
  success-green: '#22c55e'
  error-red: '#ef4444'

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
  shadow_lg: 'rgba(124, 45, 18, 0.08) 0px 14px 20px 4px'
---`;

  const mdVistas = `## ESPECIFICACIÓN DETALLADA DE LAS 27 VISTAS DEL SISTEMA

### 1. VISTAS PÚBLICAS

#### 1.1 LoginPage (/login)
- **Aesthetic**: Warm sunset gradient background with active orange elements and a glassmorphic white card in the center.
- **Components**: Graduation logo with circular container, user email field (with validation), password field with visibility toggle, Sign-In button with loading spinner, Support link.
- **Adaptive**: Fully centered on mobile, tablet, and desktop. Large cards scale max-width to 450px on desktop with 40px internal margins.

#### 1.2 UnauthorizedPage (/unauthorized)
- **Aesthetic**: High contrast warning view using amber accents.
- **Components**: Locked padlock SVG icon, "Acceso no autorizado" warning label, "Volver al Dashboard" action button, Logout option.

#### 1.3 NotFoundPage (404 Catch-All)
- **Aesthetic**: Playful 404 illustration with orange/amber accents.
- **Components**: Giant "404" indicator, "Página no encontrada" guide text, "Volver al inicio" button.

---

### 2. VISTAS DEL ADMINISTRADOR (Tinte: Violeta Suave)

#### 2.1 AdminDashboard (/admin)
- **Aesthetic**: Clean grid of statistics over a subtle lavender tinted canvas.
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

### 3. VISTAS DEL PRECEPTOR (Tinte: Verde Menta/Teal)

#### 3.1 PreceptorDashboard Layout
- **Navigation Options**: Registrar Asistencia, Historial de Asistencia, Justificaciones Pendientes.

#### 3.2 AttendanceRegisterPage (/preceptor/attendance/register)
- **Components**: Course selection dropdown, Date picker. List of class students with 3 interactive toggle buttons: Presente (Mint Glaze), Ausente (Teal/Coral), Tarde (Sunburst). Save all button with saving states.

#### 3.3 AttendanceHistoryPage (/preceptor/attendance/history)
- **Components**: Absences filter, Student details search, student attendance analytics with summary cards (% Attendance, Total absent, late arrivals).

#### 3.4 PendingCertificatesPage (/preceptor/justify)
- **Components**: Display certificates uploaded by parents. Actions: View certificate file, click "Justificar" causing irreversible confirmation dialog confirming justification status change.

---

### 4. VISTAS DEL DOCENTE (Tinte: Naranja Cálido)

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

### 5. VISTAS DEL PADRE (Tinte: Rosa/Fucsia Afectuoso)

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
- **Components**: Absences selector dropdown, file dropzone area with validation parameters (PNG/JPG/PDF, max 5MB) and drag & drop support, upload action bar with file progress.`;

  const mdLayoutSystem = `## DIRECTRICES DE DISEÑO RESPONSIVO Y MAQUETACIÓN

1. **Responsive Breakdown Rules**:
   - **Desktops (≥1024px)**: Fixed 280px navigation sidebar with rounded borders. Main content area sits in a scrollable container with 40px padding. Card grids occupy 3 or 4 columns.
   - **Tablets (768px-1023px)**: Nav sidebar collapses into a narrow 64px rail with icons only. Bento grids adapt into 2 columns.
   - **Mobiles (<768px)**: Fixed full-width header with hamburger toggle showing Drawer overlay menu. All grids transform to full-bleed, single-column rows with 16px lateral padding.

2. **Contrast & Theme Rules**:
   - Font pairings: **Montserrat** for display headers, creating compact geometric layout titles. **Inter** for all list tags, forms, tables, and supporting notes.
   - White standard cards with 32px rounded corners floating beautifully on subtly role-tinted canvas backdrops.
   - Clear focus state borders in vivid Electric Blue with a soft 3px outer shadow ring.`;

  const getFullMarkdown = () => {
    return `# PROYECTO COMPLETO GESTIÓN ESCOLAR: CANONICAL DESIGN SYSTEM & VISTAS

${mdDesignSystem}

${mdVistas}

${mdLayoutSystem}
`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(getFullMarkdown());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadMarkdown = () => {
    const blob = new Blob([getFullMarkdown()], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'CANONICAL_SYS_VISTAS.md');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getSelectedText = () => {
    switch (selectedFormat) {
      case 'design': return mdDesignSystem;
      case 'vistas': return mdVistas;
      case 'full': default: return getFullMarkdown();
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-orange-100 shadow-xl overflow-hidden self-stretch mt-4 flex flex-col md:flex-row">
      <div className="p-8 md:w-1/3 bg-gradient-to-br from-amber-50 to-orange-50 border-r border-orange-100 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md">
            <BookOpen size={24} />
          </div>
          <div>
            <h3 className="font-display text-2xl font-bold text-slate-800">Export Center</h3>
            <p className="text-sm text-slate-500 mt-2">
              Genera de inmediato el archivo canónico Markdown con lujo de detalle sobre el diseño, colores, fuentes y las 27 vistas para pegarlo en Open Code.
            </p>
          </div>

          <div className="space-y-2 pt-4">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest block">Seleccionar Sección</label>
            <div className="grid grid-cols-1 gap-1">
              <button 
                onClick={() => setSelectedFormat('full')}
                className={`py-2 px-4 text-left rounded-xl text-sm font-medium transition-colors ${selectedFormat === 'full' ? 'bg-amber-500 text-white' : 'hover:bg-amber-100 text-slate-600'}`}
              >
                Proyecto Completo (27 Vistas)
              </button>
              <button 
                onClick={() => setSelectedFormat('design')}
                className={`py-2 px-4 text-left rounded-xl text-sm font-medium transition-colors ${selectedFormat === 'design' ? 'bg-amber-500 text-white' : 'hover:bg-amber-100 text-slate-600'}`}
              >
                Fichas de Paleta y Tokens
              </button>
              <button 
                onClick={() => setSelectedFormat('vistas')}
                className={`py-2 px-4 text-left rounded-xl text-sm font-medium transition-colors ${selectedFormat === 'vistas' ? 'bg-amber-500 text-white' : 'hover:bg-amber-100 text-slate-600'}`}
              >
                Especificaciones de layout
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-2 pt-6">
          <button 
            onClick={copyToClipboard}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 px-4 rounded-full text-sm font-medium flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95 cursor-pointer"
          >
            {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
            {copied ? '¡Copiado!' : 'Copiar Markdown'}
          </button>

          <button 
            onClick={downloadMarkdown}
            className="w-full border-2 border-slate-900 hover:bg-slate-50 text-slate-900 py-3 px-4 rounded-full text-sm font-medium flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
          >
            <Download size={18} />
            Descargar archivo .md
          </button>
          
          <div className="text-[10px] text-center text-slate-400 font-medium">
            Formato optimizado para integradoras de IA
          </div>
        </div>
      </div>

      <div className="flex-1 bg-slate-950 p-6 flex flex-col justify-between max-h-[500px]">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500 block"></span>
            <span className="w-3 h-3 rounded-full bg-yellow-500 block"></span>
            <span className="w-3 h-3 rounded-full bg-green-500 block"></span>
            <span className="text-xs text-slate-400 ml-2 font-mono">CANONICAL_SYS_VISTAS.md</span>
          </div>
          <span className="text-[10px] bg-slate-800 text-slate-300 font-mono py-1 px-2.5 rounded-full uppercase tracking-wider">
            Markdown
          </span>
        </div>
        <div className="flex-1 overflow-y-auto text-lime-400 font-mono text-xs p-2 leading-relaxed whitespace-pre-wrap select-all hide-scrollbar">
          {getSelectedText()}
        </div>
      </div>
    </div>
  );
}
