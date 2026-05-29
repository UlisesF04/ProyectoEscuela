/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  User, Course, Subject, Student, TeacherAssignment, ParentLink, TeacherLeave, NotificationLog, Attendance 
} from './types';
import { 
  initialUsers, initialCourses, initialSubjects, initialStudents, initialAssignments, initialParentLinks, initialLeaves, initialNotificationLogs, initialTasks, initialSubmissions, initialAttendances, initialConfig 
} from './data';

import RoleShell from './components/RoleShell';
import MarkdownExport from './components/MarkdownExport';
import { LoginPage, UnauthorizedPage, NotFoundPage } from './components/views/PublicViews';
import AdminViews from './components/views/AdminViews';
import PreceptorViews from './components/views/PreceptorViews';
import DocenteViews from './components/views/DocenteViews';
import PadreViews from './components/views/PadreViews';

// Sidebar Icons matching rules
import { 
  BarChart, Users, BookOpen, UserPlus, ListTodo, ClipboardList, Calendar, Bell, Sliders, MapPin, User as UserIcon, FileText, Upload, ShieldAlert, Sparkles, BookCheck, ClipboardCheck
} from 'lucide-react';

export default function App() {
  // Master reactive dataset states (all entities supporting CRUD)
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [subjects, setSubjects] = useState<Subject[]>(initialSubjects);
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [assignments, setAssignments] = useState<TeacherAssignment[]>(initialAssignments);
  const [parentLinks, setParentLinks] = useState<ParentLink[]>(initialParentLinks);
  const [leaves, setLeaves] = useState<TeacherLeave[]>(initialLeaves);
  const [notifications, setNotifications] = useState<NotificationLog[]>(initialNotificationLogs);
  const [tasks, setTasks] = useState(initialTasks);
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const [attendances, setAttendances] = useState<Attendance[]>(initialAttendances);
  const [config, setConfig] = useState(initialConfig);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Dashboard Section View
  const [activeSection, setActiveSection] = useState('dashboard');
  
  // Custom Demo view tracking
  const [publicDemoView, setPublicDemoView] = useState<'login' | 'unauthorized' | 'notfound'>('login');
  const [showExportCenter, setShowExportCenter] = useState(false);

  // 27 Views direct jump mapping for verification and Open Code copy
  const viewsList = [
    { id: 'v1', name: '1. LoginPage (/login)', role: 'public', sec: 'login' },
    { id: 'v2', name: '2. UnauthorizedPage (/unauthorized)', role: 'public', sec: 'unauthorized' },
    { id: 'v3', name: '3. NotFoundPage (404)', role: 'public', sec: 'notfound' },
    { id: 'v4', name: '4. AdminDashboard (Overview)', role: 'admin', sec: 'dashboard' },
    { id: 'v5', name: '5. AdminUsersPage (CRUD)', role: 'admin', sec: 'users' },
    { id: 'v6', name: '6. AdminCoursesPage (Subjects)', role: 'admin', sec: 'courses' },
    { id: 'v7', name: '7. AdminStudentsPage (Student DB)', role: 'admin', sec: 'students' },
    { id: 'v8', name: '8. AdminTeacherAssignments', role: 'admin', sec: 'assignments' },
    { id: 'v9', name: '9. AdminParentLinks', role: 'admin', sec: 'links' },
    { id: 'v10', name: '10. AdminLeavesPage (Approvals)', role: 'admin', sec: 'leaves' },
    { id: 'v11', name: '11. AdminNotificationLogs (Audit)', role: 'admin', sec: 'notifications' },
    { id: 'v12', name: '12. AdminConfigurationPage', role: 'admin', sec: 'config' },
    { id: 'v13', name: '13. Preceptor Register (Course dropdown)', role: 'preceptor', sec: 'register' },
    { id: 'v14', name: '14. AttendanceRegisterPage (States Grid)', role: 'preceptor', sec: 'register' },
    { id: 'v15', name: '15. AttendanceHistoryPage', role: 'preceptor', sec: 'history' },
    { id: 'v16', name: '16. PendingCertificatesPage (Justify)', role: 'preceptor', sec: 'justify' },
    { id: 'v17', name: '17. Docente Grades (Subject selector)', role: 'docente', sec: 'grades' },
    { id: 'v18', name: '18. GradesPage (Inputs 0-10)', role: 'docente', sec: 'grades' },
    { id: 'v19', name: '19. TasksPage (Assignments)', role: 'docente', sec: 'tasks' },
    { id: 'v20', name: '20. TaskSubmissionsPage (Locks)', role: 'docente', sec: 'submissions' },
    { id: 'v21', name: '21. MyLeavesPage (Applications)', role: 'docente', sec: 'leaves' },
    { id: 'v22', name: '22. ProfileSection (Teacher credentials)', role: 'docente', sec: 'profile' },
    { id: 'v23', name: '23. ChildSelector Component', role: 'padre', sec: 'grades' },
    { id: 'v24', name: '24. ChildGradesPage (Fails warnings)', role: 'padre', sec: 'grades' },
    { id: 'v25', name: '25. ChildAttendancesPage (RN-10 Warning)', role: 'padre', sec: 'attendances' },
    { id: 'v26', name: '26. ChildTasksPage (Homework ratio)', role: 'padre', sec: 'tasks' },
    { id: 'v27', name: '27. UploadCertificatePage (Dropzone)', role: 'padre', sec: 'upload-certificate' }
  ];

  const handleLogin = (email: string, role: 'admin' | 'preceptor' | 'docente' | 'padre') => {
    // Select representing profile user
    const matched = users.find(u => u.rol === role && u.is_active);
    setCurrentUser(matched || {
      id: 'sub_u_123',
      email,
      nombre: 'Demo',
      apellido: role.toUpperCase(),
      rol: role,
      is_active: true
    });
    
    // Set default route sections depending on selected role
    switch (role) {
      case 'admin':
        setActiveSection('dashboard');
        break;
      case 'preceptor':
        setActiveSection('register');
        break;
      case 'docente':
        setActiveSection('grades');
        break;
      case 'padre':
        setActiveSection('grades');
        break;
    }
    setShowExportCenter(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setPublicDemoView('login');
    setShowExportCenter(false);
  };

  const handleJumpToView = (viewId: string) => {
    const matched = viewsList.find(v => v.id === viewId);
    if (!matched) return;

    setShowExportCenter(false);

    if (matched.role === 'public') {
      setCurrentUser(null);
      setPublicDemoView(matched.sec as any);
    } else {
      // Login matching role profile first
      const defaultUser = users.find(u => u.rol === matched.role && u.is_active);
      setCurrentUser(defaultUser || null);
      setActiveSection(matched.sec);
    }
  };

  // Nav sections dictionary
  const getSidebarSections = () => {
    if (!currentUser) return [];

    switch (currentUser.rol) {
      case 'admin':
        return [
          { id: 'dashboard', label: 'Dashboard Overview', icon: <BarChart size={18} /> },
          { id: 'users', label: 'Usuarios CRUD', icon: <Users size={18} /> },
          { id: 'courses', label: 'Cursos y Materias', icon: <BookOpen size={18} /> },
          { id: 'students', label: 'Matrícula Alumnos', icon: <UserPlus size={18} /> },
          { id: 'assignments', label: 'Ubicación Docente', icon: <ListTodo size={18} /> },
          { id: 'links', label: 'Vínculos Familiares', icon: <ClipboardList size={18} /> },
          { id: 'leaves', label: 'Licencias Docentes', icon: <Calendar size={18} /> },
          { id: 'notifications', label: 'Historial Alertas', icon: <Bell size={18} /> },
          { id: 'config', label: 'Parámetros Globales', icon: <Sliders size={18} /> }
        ];
      case 'preceptor':
        return [
          { id: 'register', label: 'Registrar Asistencia', icon: <ClipboardCheck size={18} /> },
          { id: 'history', label: 'Historial Completo', icon: <FileText size={18} /> },
          { id: 'justify', label: 'Justificar Faltas', icon: <Calendar size={18} /> }
        ];
      case 'docente':
        return [
          { id: 'grades', label: 'Carga de Notas', icon: <BookCheck size={18} /> },
          { id: 'tasks', label: 'Mis Trabajos / Tareas', icon: <ListTodo size={18} /> },
          { id: 'submissions', label: 'Recepción Entregas', icon: <ClipboardList size={18} /> },
          { id: 'leaves', label: 'Mis Licencias', icon: <Calendar size={18} /> },
          { id: 'profile', label: 'Mi Legajo Perfil', icon: <UserIcon size={18} /> }
        ];
      case 'padre':
        return [
          { id: 'grades', label: 'Notas de mi Hijo', icon: <BookCheck size={18} /> },
          { id: 'attendances', label: 'Inasistencias / Faltas', icon: <Calendar size={18} /> },
          { id: 'tasks', label: 'Tareas por Entregar', icon: <ListTodo size={18} /> },
          { id: 'upload-certificate', label: 'Subir Certificado', icon: <Upload size={18} /> }
        ];
      default:
        return [];
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 selection:bg-amber-500 selection:text-white">
      
      {/* ⚠️ DEMO INTERACTION FLYING FLOATING BOX CONTROLLER */}
      <div className="bg-slate-900 border-b border-slate-800 text-white py-3 px-6 sticky top-0 z-50 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md select-none">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Fidelidad del Prototipo: <b className="text-amber-400">Excelente</b>
          </span>
        </div>

        {/* View Jump Dropdown Selector containing all 27 views specifying index */}
        <div className="flex items-center gap-2.5">
          <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Saltar Vista Directa:</label>
          <select 
            onChange={(e) => handleJumpToView(e.target.value)}
            className="bg-slate-800 text-amber-300 text-xs font-semibold py-1.5 px-3 rounded-full border border-slate-700 outline-none cursor-pointer max-w-[280px]"
            defaultValue="v1"
          >
            {viewsList.map(item => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>

          {/* Markdown Export View Switcher */}
          <button 
            onClick={() => setShowExportCenter(!showExportCenter)}
            className={`py-1.5 px-4 text-xs font-bold rounded-full cursor-pointer flex items-center gap-1 transition-colors ${showExportCenter ? 'bg-amber-500 text-white' : 'bg-slate-800 text-amber-300 border border-slate-700 hover:bg-slate-700'}`}
          >
            <Sparkles size={14} className="stroke-[2.5]" />
            {showExportCenter ? 'Ver Vistas Portal' : 'Exportar Markdown'}
          </button>
        </div>
      </div>

      {/* Render Markdown compiler center view if requested, or the actual views layout */}
      {showExportCenter ? (
        <div className="flex-1 p-6 md:p-12 bg-slate-50 flex items-center justify-center">
          <div className="w-full max-w-5xl">
            <h2 className="font-display text-3xl font-extrabold text-slate-800 text-center">Boletín del Generador de Markdown</h2>
            <p className="text-sm text-slate-500 text-center mt-2 max-w-lg mx-auto">
              Copia o descarga de inmediato las clases, estilos de maquetación, tokens de color (Warm / Amber / Zesty) y el desglose de las 27 vistas.
            </p>
            <MarkdownExport />
          </div>
        </div>
      ) : (
        <div className="flex-grow flex flex-col">
          {currentUser ? (
            <RoleShell
              user={currentUser}
              sections={getSidebarSections()}
              activeSection={activeSection}
              setActiveSection={setActiveSection}
              onLogout={handleLogout}
            >
              {currentUser.rol === 'admin' && (
                <AdminViews
                  currentView={activeSection}
                  users={users}
                  setUsers={setUsers}
                  courses={courses}
                  setCourses={setCourses}
                  subjects={subjects}
                  setSubjects={setSubjects}
                  students={students}
                  setStudents={setStudents}
                  assignments={assignments}
                  setAssignments={setAssignments}
                  parentLinks={parentLinks}
                  setParentLinks={setParentLinks}
                  leaves={leaves}
                  setLeaves={setLeaves}
                  notifications={notifications}
                  setNotifications={setNotifications}
                  config={config}
                  setConfig={setConfig}
                  onNavigateToView={(viewId) => setActiveSection(viewId)}
                />
              )}

              {currentUser.rol === 'preceptor' && (
                <PreceptorViews
                  currentView={activeSection}
                  courses={courses}
                  students={students}
                  attendances={attendances}
                  setAttendances={setAttendances}
                />
              )}

              {currentUser.rol === 'docente' && (
                <DocenteViews
                  currentView={activeSection}
                  courses={courses}
                  subjects={subjects}
                  students={students}
                  tasks={tasks}
                  setTasks={setTasks}
                  submissions={submissions}
                  setSubmissions={setSubmissions}
                  leaves={leaves}
                  setLeaves={setLeaves}
                />
              )}

              {currentUser.rol === 'padre' && (
                <PadreViews
                  currentView={activeSection}
                  students={students}
                  attendances={attendances}
                  setAttendances={setAttendances}
                  tasks={tasks}
                  submissions={submissions}
                />
              )}
            </RoleShell>
          ) : (
            // Public Views: Login, Unauthorized or NotFound Catch (controlled by jumping menu or preset buttons)
            <div className="flex-1">
              {publicDemoView === 'login' && (
                <LoginPage onLoginSuccess={handleLogin} />
              )}
              {publicDemoView === 'unauthorized' && (
                <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-[32px] shadow-xl border border-slate-100 p-8 w-full max-w-lg">
                    <UnauthorizedPage onReturn={() => setPublicDemoView('login')} />
                  </div>
                </div>
              )}
              {publicDemoView === 'notfound' && (
                <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-[32px] shadow-xl border border-slate-100 p-8 w-full max-w-lg">
                    <NotFoundPage onReturn={() => setPublicDemoView('login')} />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
