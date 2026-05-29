/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  User, Course, Subject, Student, TeacherAssignment, ParentLink, TeacherLeave, NotificationLog 
} from '../../types';
import { 
  Users, BookOpen, UserCheck, Calendar, Bell, Sliders, Play, Trash, Edit, Check, X, AlertTriangle, Search, Filter, Plus, ChevronRight, CheckCircle, XCircle 
} from 'lucide-react';

interface AdminViewsProps {
  currentView: string;
  users: User[];
  courses: Course[];
  subjects: Subject[];
  students: Student[];
  assignments: TeacherAssignment[];
  parentLinks: ParentLink[];
  leaves: TeacherLeave[];
  notifications: NotificationLog[];
  config: any;
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
  setSubjects: React.Dispatch<React.SetStateAction<Subject[]>>;
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  setAssignments: React.Dispatch<React.SetStateAction<TeacherAssignment[]>>;
  setParentLinks: React.Dispatch<React.SetStateAction<ParentLink[]>>;
  setLeaves: React.Dispatch<React.SetStateAction<TeacherLeave[]>>;
  setNotifications: React.Dispatch<React.SetStateAction<NotificationLog[]>>;
  setConfig: React.Dispatch<React.SetStateAction<any>>;
  onNavigateToView: (viewId: string) => void;
}

export default function AdminViews(props: AdminViewsProps) {
  const { currentView } = props;

  switch (currentView) {
    case 'dashboard':
      return <AdminDashboard {...props} />;
    case 'users':
      return <AdminUsersPage {...props} />;
    case 'courses':
      return <AdminCoursesPage {...props} />;
    case 'students':
      return <AdminStudentsPage {...props} />;
    case 'assignments':
      return <AdminTeacherAssignmentsPage {...props} />;
    case 'links':
      return <AdminParentLinksPage {...props} />;
    case 'leaves':
      return <AdminLeavesPage {...props} />;
    case 'notifications':
      return <AdminNotificationLogsPage {...props} />;
    case 'config':
      return <AdminConfigurationPage {...props} />;
    default:
      return <AdminDashboard {...props} />;
  }
}

// 2.1 AdminDashboard Overview
function AdminDashboard({ users, courses, students, leaves, notifications, onNavigateToView }: AdminViewsProps) {
  const totUsers = users.length;
  const totCourses = courses.length;
  const totStudents = students.length;
  const pendLeaves = leaves.filter(l => l.status === 'pendiente').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-display text-2xl md:text-3xl font-extrabold text-slate-800">Resumen del Sistema</h2>
          <p className="text-sm text-slate-500 mt-1">Siga de cerca el estado general del portal escolar.</p>
        </div>
      </div>

      {/* Bento Grid: Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1 */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-lg flex flex-col justify-between hover:-translate-y-1 transition-transform duration-200">
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Users size={24} />
            </div>
            <span className="bg-emerald-50 text-emerald-600 text-[10px] uppercase font-bold py-1 px-2.5 rounded-full">
              +12% esta sem
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Usuarios Activos</p>
            <p className="font-display text-3xl font-bold text-slate-800 mt-1">{totUsers}</p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-lg flex flex-col justify-between hover:-translate-y-1 transition-transform duration-200">
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
              <BookOpen size={24} />
            </div>
            <span className="bg-slate-100 text-slate-600 text-[10px] uppercase font-bold py-1 px-2.5 rounded-full">
              Estable
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Clases Activas</p>
            <p className="font-display text-3xl font-bold text-slate-800 mt-1">{totCourses}</p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-lg flex flex-col justify-between hover:-translate-y-1 transition-transform duration-200">
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <UserCheck size={24} />
            </div>
            <span className="bg-emerald-50 text-emerald-600 text-[10px] uppercase font-bold py-1 px-2.5 rounded-full">
              +5% anual
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Alumnos Totales</p>
            <p className="font-display text-3xl font-bold text-slate-800 mt-1">{totStudents}</p>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-lg flex flex-col justify-between hover:-translate-y-1 transition-transform duration-200">
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
              <Calendar size={24} />
            </div>
            {pendLeaves > 0 ? (
              <span className="bg-red-50 text-red-600 text-[10px] uppercase font-bold py-1 px-2.5 rounded-full tracking-wide">
                Atención req.
              </span>
            ) : (
              <span className="bg-emerald-50 text-emerald-600 text-[10px] uppercase font-bold py-1 px-2.5 rounded-full tracking-wide">
                Al día
              </span>
            )}
          </div>
          <div className="mt-4 flex justify-between items-end">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Licencias Pendientes</p>
              <p className="font-display text-3xl font-bold text-slate-800 mt-1">{pendLeaves}</p>
            </div>
            <button 
              onClick={() => onNavigateToView('leaves')}
              className="text-xs font-bold text-amber-600 hover:text-amber-700 outline-none flex items-center gap-0.5 cursor-pointer"
            >
              Verificar <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Extended Logs overview inside Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-lg lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-display text-lg font-bold text-slate-800">Notificaciones Recientes (Python Monitoring)</h3>
            <button 
              onClick={() => onNavigateToView('notifications')}
              className="text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-600 py-1.5 px-3 rounded-full cursor-pointer"
            >
              Ver Auditoría
            </button>
          </div>
          <div className="space-y-3">
            {notifications.slice(0, 3).map(n => (
              <div key={n.id} className="p-4 bg-slate-50 rounded-2xl flex items-start gap-3">
                <div className={`p-2 rounded-xl text-white ${n.estado === 'enviado' ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                  <Bell size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <p className="text-xs font-bold text-slate-800 truncate">{n.alumno} ({n.tipo})</p>
                    <span className="text-[10px] text-slate-400 font-mono">{n.fecha}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 italic line-clamp-1">"{n.mensaje}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-lg">
          <h3 className="font-display text-lg font-bold text-slate-800 mb-4 font-sans">Enlaces Rápidos</h3>
          <div className="grid grid-cols-1 gap-2.5 text-slate-700">
            {[
              { id: 'users', title: 'Administrar Usuarios', desc: 'Gestionar directores, profesores y familiares' },
              { id: 'courses', title: 'Gestionar Clases e Idiomas', desc: 'Control de tramos de cursos y materias asignadas' },
              { id: 'students', title: 'Gestionar Matrícula Alumnos', desc: 'CRUD y vinculación de familiares responsables' },
              { id: 'config', title: 'Parámetros del Sistema', desc: 'Límite de inasistencias y alertas activas' }
            ].map((link, idx) => (
              <button 
                key={idx}
                onClick={() => onNavigateToView(link.id)}
                className="w-full text-left p-3.5 bg-slate-50 hover:bg-amber-50 rounded-2xl border border-transparent hover:border-amber-100 outline-none transition-all flex items-center justify-between cursor-pointer group"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-800 group-hover:text-amber-700">{link.title}</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">{link.desc}</p>
                </div>
                <ChevronRight size={16} className="text-slate-400 group-hover:text-amber-600" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// 2.2 AdminUsersPage
function AdminUsersPage({ users, setUsers }: AdminViewsProps) {
  const [term, setTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  
  // Form state
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [rol, setRol] = useState<'admin' | 'preceptor' | 'docente' | 'padre'>('docente');
  const [telefono, setTelefono] = useState('');

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !apellido || !email) return;

    const newUser: User = {
      id: 'u_' + Date.now(),
      email,
      nombre,
      apellido,
      rol,
      telefono: telefono || undefined,
      is_active: true
    };

    setUsers([newUser, ...users]);
    setShowModal(false);
    
    // Clear
    setNombre('');
    setApellido('');
    setEmail('');
    setTelefono('');
  };

  const toggleUserActive = (id: string) => {
    setUsers(users.map(u => u.id === id ? { ...u, is_active: !u.is_active } : u));
  };

  const deleteUser = (id: string) => {
    setUsers(users.filter(u => u.id !== id));
  };

  const filteredUsers = users.filter(u => {
    const matchTerm = (u.nombre + ' ' + u.apellido + ' ' + u.email).toLowerCase().includes(term.toLowerCase());
    const matchRole = roleFilter === 'all' || u.rol === roleFilter;
    return matchTerm && matchRole;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-display text-2xl font-extrabold text-slate-800">Administración de Usuarios</h2>
          <p className="text-sm text-slate-500 mt-0.5">Gestione las credenciales, perfiles y permisos de ingreso.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-slate-900 hover:bg-slate-800 text-white rounded-full py-2.5 px-5 text-sm font-semibold flex items-center gap-1.5 shadow-sm transition-transform active:scale-95 cursor-pointer"
        >
          <Plus size={18} />
          Crear Usuario
        </button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-3 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar por nombre, email..." 
            value={term}
            onChange={e => setTerm(e.target.value)}
            className="w-full bg-slate-50 border-0 rounded-2xl py-3 pl-10 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-amber-500 outline-none"
          />
        </div>
        <div className="w-full md:w-56 flex items-center gap-2">
          <Filter size={18} className="text-slate-400" />
          <select 
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="w-full bg-slate-50 border-0 rounded-2xl py-3 px-4 text-sm text-slate-600 focus:ring-2 focus:ring-amber-500 outline-none font-semibold cursor-pointer"
          >
            <option value="all">Filtro de Rol (Todos)</option>
            <option value="admin">Administradores</option>
            <option value="preceptor">Preceptores</option>
            <option value="docente">Docentes</option>
            <option value="padre">Familiares</option>
          </select>
        </div>
      </div>

      {/* Users table */}
      <div className="bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                <th className="py-4 px-6">Estado</th>
                <th className="py-4 px-6">Nombre Completo</th>
                <th className="py-4 px-6">Correo</th>
                <th className="py-4 px-6">Rol asignado</th>
                <th className="py-4 px-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {filteredUsers.length > 0 ? (
                filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/50">
                    <td className="py-4.5 px-6">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold py-1 px-2.5 rounded-full ${u.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                        {u.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="py-4.5 px-6 font-bold">{u.apellido}, {u.nombre}</td>
                    <td className="py-4.5 px-6 font-mono text-xs text-slate-500">{u.email}</td>
                    <td className="py-4.5 px-6">
                      <span className={`text-[10px] font-semibold uppercase tracking-wider py-1 px-3 rounded-xl ${
                        u.rol === 'admin' ? 'bg-red-50 text-red-600' :
                        u.rol === 'preceptor' ? 'bg-orange-50 text-orange-600' :
                        u.rol === 'docente' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
                      }`}>
                        {u.rol}
                      </span>
                    </td>
                    <td className="py-4.5 px-6 text-right flex justify-end gap-1.5">
                      <button 
                        onClick={() => toggleUserActive(u.id)}
                        className="py-1.5 px-3 border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-semibold select-none flex items-center gap-1 text-slate-600 cursor-pointer"
                      >
                        {u.is_active ? 'Inhabilitar' : 'Habilitar'}
                      </button>
                      <button 
                        onClick={() => deleteUser(u.id)}
                        className="p-1.5 border border-red-100 hover:bg-red-50 rounded-xl text-red-600 cursor-pointer"
                        title="Eliminar usuario definitivo"
                      >
                        <Trash size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No se encontraron usuarios registrados con los filtros aplicados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] p-8 w-full max-w-md shadow-2xl border border-slate-50 relative">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute right-6 top-6 p-1.5 text-slate-400 hover:bg-slate-100 rounded-full cursor-pointer"
            >
              <X size={20} />
            </button>
            <h3 className="font-display text-xl font-bold text-slate-800">Crear Nuevo Usuario</h3>
            <p className="text-slate-400 text-xs mt-1">Configure las credenciales académicas del nuevo miembro.</p>

            <form onSubmit={handleAddUser} className="space-y-4 mt-6">
              <div className="grid grid-cols-2 gap-3">
                <input 
                  type="text" 
                  placeholder="Nombre" 
                  value={nombre} 
                  onChange={e => setNombre(e.target.value)}
                  className="bg-slate-50 border-0 rounded-2xl py-3 px-4 text-sm text-slate-700 focus:ring-2 focus:ring-amber-500 outline-none font-sans" 
                  required
                />
                <input 
                  type="text" 
                  placeholder="Apellido" 
                  value={apellido} 
                  onChange={e => setApellido(e.target.value)}
                  className="bg-slate-50 border-0 rounded-2xl py-3 px-4 text-sm text-slate-700 focus:ring-2 focus:ring-amber-500 outline-none font-sans" 
                  required
                />
              </div>
              <input 
                type="email" 
                placeholder="Correo Electrónico" 
                value={email} 
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-slate-50 border-0 rounded-2xl py-3 px-4 text-sm text-slate-700 focus:ring-2 focus:ring-amber-500 outline-none font-sans" 
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <select 
                  value={rol}
                  onChange={e => setRol(e.target.value as any)}
                  className="bg-slate-50 border-0 rounded-2xl py-3 px-4 text-sm text-slate-600 focus:ring-2 focus:ring-amber-500 outline-none cursor-pointer"
                >
                  <option value="admin">Administrador</option>
                  <option value="preceptor">Preceptor</option>
                  <option value="docente">Docente</option>
                  <option value="padre">Familiar/Madre</option>
                </select>
                <input 
                  type="text" 
                  placeholder="Teléfono" 
                  value={telefono} 
                  onChange={e => setTelefono(e.target.value)}
                  className="bg-slate-50 border-0 rounded-2xl py-3 px-4 text-sm text-slate-700 focus:ring-2 focus:ring-amber-500 outline-none" 
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-slate-950 hover:bg-slate-800 text-white rounded-full py-3.5 font-semibold text-sm transition-transform active:scale-95 mt-4 cursor-pointer"
              >
                Crear y Notificar Acceso
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// 2.3 AdminCoursesPage
function AdminCoursesPage({ courses, setCourses, subjects, setSubjects }: AdminViewsProps) {
  const [showModal, setShowModal] = useState(false);
  const [nombre, setNombre] = useState('');
  const [division, setDivision] = useState('');
  const [nivel, setNivel] = useState<'Primaria' | 'Secundaria' | 'Terciario'>('Secundaria');

  // Subjects display modal
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [subjectName, setSubjectName] = useState('');

  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !division) return;

    const newCourse: Course = {
      id: 'c_' + Date.now(),
      nombre,
      division,
      nivel
    };

    setCourses([...courses, newCourse]);
    setShowModal(false);
    setNombre('');
    setDivision('');
  };

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse || !subjectName) return;

    const newSubject: Subject = {
      id: 's_' + Date.now(),
      nombre: subjectName,
      courseId: selectedCourse.id
    };

    setSubjects([...subjects, newSubject]);
    setSubjectName('');
  };

  const handleDeleteSubject = (id: string) => {
    setSubjects(subjects.filter(s => s.id !== id));
  };

  const handleDeleteCourse = (id: string) => {
    setCourses(courses.filter(c => c.id !== id));
    setSubjects(subjects.filter(s => s.courseId !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-display text-2xl font-extrabold text-slate-800">Cursos y Materias</h2>
          <p className="text-sm text-slate-500 mt-0.5">Gestione los cursos activos y la grilla de materias.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-slate-900 hover:bg-slate-800 text-white rounded-full py-2.5 px-5 text-sm font-semibold flex items-center gap-1.5 cursor-pointer"
        >
          <Plus size={18} />
          Nuevo Curso
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map(course => {
          const courseSubjects = subjects.filter(s => s.courseId === course.id);
          return (
            <div key={course.id} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-md hover:shadow-lg transition-all duration-200 relative group">
              <span className="absolute top-6 right-6 text-[10px] font-bold uppercase tracking-widest bg-amber-50 text-amber-700 py-1 px-3 rounded-full">
                {course.nivel}
              </span>
              <h3 className="font-display text-2xl font-bold text-slate-800">
                {course.nombre} Div: "{course.division}"
              </h3>
              <p className="text-xs text-slate-400 mt-1 font-medium italic">Curso de Nivel Medio</p>
              
              <div className="mt-4 border-t border-slate-50 pt-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2.5">Grilla Materias ({courseSubjects.length})</p>
                <div className="flex flex-wrap gap-1.5">
                  {courseSubjects.map(sub => (
                    <span key={sub.id} className="text-xs bg-slate-100 text-slate-500 font-semibold py-1 px-2.5 rounded-xl">
                      {sub.nombre}
                    </span>
                  ))}
                  {courseSubjects.length === 0 && (
                    <span className="text-xs text-slate-400 italic">No tiene materias registradas</span>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-between items-center bg-slate-50 p-2 rounded-2xl">
                <button 
                  onClick={() => setSelectedCourse(course)}
                  className="text-xs font-bold text-amber-600 hover:text-amber-700 py-2 px-3 hover:bg-amber-100 rounded-xl transition-all cursor-pointer flex items-center gap-0.5"
                >
                  Editar Materias
                </button>
                <button 
                  onClick={() => handleDeleteCourse(course.id)}
                  className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl cursor-pointer"
                  title="Eliminar curso"
                >
                  <Trash size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* New Course Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] p-8 w-full max-w-sm shadow-2xl relative">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute right-6 top-6 p-1.5 text-slate-400 hover:bg-slate-100 rounded-full cursor-pointer"
            >
              <X size={20} />
            </button>
            <h3 className="font-display text-xl font-bold text-slate-800">Crear Nuevo Curso</h3>
            <p className="text-slate-400 text-xs mt-1">Configure e inicialice una nueva sección áulica.</p>

            <form onSubmit={handleAddCourse} className="space-y-4 mt-6">
              <input 
                type="text" 
                placeholder="Nombre (Ej: 5º)" 
                value={nombre} 
                onChange={e => setNombre(e.target.value)}
                className="w-full bg-slate-50 border-0 rounded-2xl py-3 px-4 text-sm text-slate-700 focus:ring-2 focus:ring-amber-500 outline-none" 
                required
              />
              <input 
                type="text" 
                placeholder="División (Ej: B)" 
                value={division} 
                onChange={e => setDivision(e.target.value)}
                className="w-full bg-slate-50 border-0 rounded-2xl py-3 px-4 text-sm text-slate-700 focus:ring-2 focus:ring-amber-500 outline-none" 
                required
              />
              <select 
                value={nivel}
                onChange={e => setNivel(e.target.value as any)}
                className="w-full bg-slate-50 border-0 rounded-2xl py-3 px-4 text-sm text-slate-600 focus:ring-2 focus:ring-amber-500 outline-none cursor-pointer"
              >
                <option value="Primaria">Primaria</option>
                <option value="Secundaria">Secundaria</option>
                <option value="Terciario">Terciario</option>
              </select>

              <button 
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-full py-3.5 font-semibold text-sm transition-transform active:scale-95 mt-2 cursor-pointer"
              >
                Crear Curso Secundario
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Subjects Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] p-8 w-full max-w-md shadow-2xl relative">
            <button 
              onClick={() => setSelectedCourse(null)}
              className="absolute right-6 top-6 p-1.5 text-slate-400 hover:bg-slate-100 rounded-full cursor-pointer"
            >
              <X size={20} />
            </button>
            <h3 className="font-display text-xl font-bold text-slate-800">Materias de {selectedCourse.nombre} "{selectedCourse.division}"</h3>
            <p className="text-slate-400 text-xs mt-1">Configure asignaciones específicas de la currícula.</p>

            <form onSubmit={handleAddSubject} className="mt-5 flex gap-2">
              <input 
                type="text" 
                placeholder="Nueva Materia (Ej: Física)" 
                value={subjectName} 
                onChange={e => setSubjectName(e.target.value)}
                className="flex-1 bg-slate-50 border-0 rounded-2xl py-3 px-4 text-sm text-slate-700 focus:ring-2 focus:ring-amber-500 outline-none" 
                required
              />
              <button 
                type="submit"
                className="bg-amber-500 hover:bg-amber-600 text-white py-3 px-4 rounded-2xl text-xs font-bold cursor-pointer"
              >
                Agregar
              </button>
            </form>

            <div className="mt-6 border-t border-slate-100 pt-5">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Asignadas actualmente</p>
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {subjects.filter(s => s.courseId === selectedCourse.id).map(sub => (
                  <div key={sub.id} className="p-3 bg-slate-50 rounded-2xl flex justify-between items-center">
                    <span className="text-xs font-semibold text-slate-700">{sub.nombre}</span>
                    <button 
                      onClick={() => handleDeleteSubject(sub.id)}
                      className="p-1 text-rose-500 hover:bg-rose-100 rounded-lg cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                {subjects.filter(s => s.courseId === selectedCourse.id).length === 0 && (
                  <div className="text-center py-6 text-slate-400 text-xs italic">
                    Sin materias asignadas aún. Agregue una nueva en la caja de arriba.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 2.4 AdminStudentsPage
function AdminStudentsPage({ students, setStudents, courses, users, parentLinks, setParentLinks }: AdminViewsProps) {
  const [term, setTerm] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);

  // Form states
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [dni, setDni] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [courseId, setCourseId] = useState(courses[0]?.id || '');

  // Parent links manage states
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedParentId, setSelectedParentId] = useState('');
  const [relacion, setRelacion] = useState<'Padre' | 'Madre' | 'Tutor'>('Madre');

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !apellido || !dni || !courseId) return;

    const newStudent: Student = {
      id: 'st_' + Date.now(),
      nombre,
      apellido,
      dni,
      fechaNacimiento,
      courseId,
      is_active: true
    };

    setStudents([newStudent, ...students]);
    setShowModal(false);
    setNombre('');
    setApellido('');
    setDni('');
    setFechaNacimiento('');
  };

  const handleAddParentLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !selectedParentId) return;

    // Check custom duplicate check
    const exists = parentLinks.some(l => l.studentId === selectedStudent.id && l.parentId === selectedParentId);
    if (exists) return;

    const newLink: ParentLink = {
      id: 'l_' + Date.now(),
      parentId: selectedParentId,
      studentId: selectedStudent.id,
      relacion
    };

    setParentLinks([newLink, ...parentLinks]);
  };

  const handleDeleteParentLink = (id: string) => {
    setParentLinks(parentLinks.filter(l => l.id !== id));
  };

  const toggleStudentActive = (id: string) => {
    setStudents(students.map(s => s.id === id ? { ...s, is_active: !s.is_active } : s));
  };

  const deleteStudent = (id: string) => {
    setStudents(students.filter(s => s.id !== id));
    setParentLinks(parentLinks.filter(l => l.studentId !== id));
  };

  const parents = users.filter(u => u.rol === 'padre');

  const filteredStudents = students.filter(s => {
    const matchTerm = (s.nombre + ' ' + s.apellido + ' ' + s.dni).toLowerCase().includes(term.toLowerCase());
    const matchCourse = courseFilter === 'all' || s.courseId === courseFilter;
    return matchTerm && matchCourse;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-display text-2xl font-extrabold text-slate-800">Matrícula Escolar (Alumnos)</h2>
          <p className="text-sm text-slate-500 mt-0.5">CRUD de estudiantes matriculados y sus vínculos con padres.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-slate-900 hover:bg-slate-800 text-white rounded-full py-2.5 px-5 text-sm font-semibold flex items-center gap-1.5 cursor-pointer"
        >
          <Plus size={18} />
          Matricular Alumno
        </button>
      </div>

      {/* Filter options */}
      <div className="flex flex-col md:flex-row gap-3 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar por nombre, apellido, DNI del alumno..." 
            value={term}
            onChange={e => setTerm(e.target.value)}
            className="w-full bg-slate-50 border-0 rounded-2xl py-3 pl-10 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-amber-500 outline-none"
          />
        </div>
        <div className="w-full md:w-56 flex items-center gap-2">
          <Filter size={18} className="text-slate-400" />
          <select 
            value={courseFilter}
            onChange={e => setCourseFilter(e.target.value)}
            className="w-full bg-slate-50 border-0 rounded-2xl py-3 px-4 text-sm text-slate-600 focus:ring-2 focus:ring-amber-500 outline-none cursor-pointer"
          >
            <option value="all">Filtro Curso (Todos)</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.nombre} div "{c.division}"</option>
            ))}
          </select>
        </div>
      </div>

      {/* Alumnos Table */}
      <div className="bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                <th className="py-4 px-6">Estado</th>
                <th className="py-4 px-6">Alumno</th>
                <th className="py-4 px-6">DNI</th>
                <th className="py-4 px-6">Curso Asociado</th>
                <th className="py-4 px-6 text-right">Vinculaciones</th>
                <th className="py-4 px-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {filteredStudents.length > 0 ? (
                filteredStudents.map(s => {
                  const courseObj = courses.find(c => c.id === s.courseId);
                  const linkedParents = parentLinks
                    .filter(pl => pl.studentId === s.id)
                    .map(pl => {
                      const parObj = users.find(u => u.id === pl.parentId);
                      return parObj ? `${parObj.nombre} (${pl.relacion})` : '';
                    })
                    .filter(Boolean);

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/50">
                      <td className="py-4.5 px-6">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold py-0.5 px-2.5 rounded-full ${s.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                          {s.is_active ? 'Matriculado' : 'No inscripto'}
                        </span>
                      </td>
                      <td className="py-4.5 px-6 font-bold">{s.apellido}, {s.nombre}</td>
                      <td className="py-4.5 px-6 font-mono text-xs text-slate-500">{s.dni}</td>
                      <td className="py-4.5 px-6">
                        <span className="text-xs bg-slate-100 text-slate-600 font-bold py-1 px-3 rounded-lg">
                          {courseObj ? `${courseObj.nombre} "${courseObj.division}"` : 'Sin asignar'}
                        </span>
                      </td>
                      <td className="py-4.5 px-6 text-right">
                        <div className="flex flex-col items-end gap-0.5">
                          {linkedParents.map((lp, idx) => (
                            <span key={idx} className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                              {lp}
                            </span>
                          ))}
                          {linkedParents.length === 0 && (
                            <span className="text-[10px] font-medium text-amber-600 italic">No tiene tutores vinculados</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4.5 px-6 text-right flex justify-end gap-1.5">
                        <button 
                          onClick={() => setSelectedStudent(s)}
                          className="py-1.5 px-3 bg-amber-500/5 hover:bg-amber-100 text-amber-700 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                        >
                          Vincular Padres
                        </button>
                        <button 
                          onClick={() => toggleStudentActive(s.id)}
                          className="py-1.5 px-3 border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-600 cursor-pointer"
                        >
                          {s.is_active ? 'Inhabilitar' : 'Habilitar'}
                        </button>
                        <button 
                          onClick={() => deleteStudent(s.id)}
                          className="p-1.5 border border-red-100 hover:bg-red-50 rounded-xl text-red-600 cursor-pointer"
                          title="Remover definitivamente"
                        >
                          <Trash size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No se encontraron alumnos registrados bajo estos términos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Matrimony create user modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] p-8 w-full max-w-sm shadow-2xl relative">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute right-6 top-6 p-1.5 text-slate-400 hover:bg-slate-100 rounded-full cursor-pointer"
            >
              <X size={20} />
            </button>
            <h3 className="font-display text-xl font-bold text-slate-800">Matricular Alumno</h3>
            <p className="text-slate-400 text-xs mt-1">Ingrese los datos para la ficha oficial.</p>

            <form onSubmit={handleAddStudent} className="space-y-4 mt-6">
              <div className="grid grid-cols-2 gap-3">
                <input 
                  type="text" 
                  placeholder="Nombre" 
                  value={nombre} 
                  onChange={e => setNombre(e.target.value)}
                  className="bg-slate-50 border-0 rounded-2xl py-3 px-4 text-sm text-slate-700 focus:ring-2 focus:ring-amber-500 outline-none" 
                  required
                />
                <input 
                  type="text" 
                  placeholder="Apellido" 
                  value={apellido} 
                  onChange={e => setApellido(e.target.value)}
                  className="bg-slate-50 border-0 rounded-2xl py-3 px-4 text-sm text-slate-700 focus:ring-2 focus:ring-amber-500 outline-none" 
                  required
                />
              </div>
              <input 
                type="text" 
                placeholder="DNI (Ej: 44.894.202)" 
                value={dni} 
                onChange={e => setDni(e.target.value)}
                className="w-full bg-slate-50 border-0 rounded-2xl py-3 px-4 text-sm text-slate-700 focus:ring-2 focus:ring-amber-500 outline-none" 
                required
              />
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 ml-1">Fecha de Nacimiento</label>
                <input 
                  type="date" 
                  value={fechaNacimiento} 
                  onChange={e => setFechaNacimiento(e.target.value)}
                  className="w-full bg-slate-50 border-0 rounded-2xl py-3 px-4 text-sm text-slate-600 focus:ring-2 focus:ring-amber-500 outline-none cursor-pointer" 
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 ml-1">Asignar de entrada al curso</label>
                <select 
                  value={courseId}
                  onChange={e => setCourseId(e.target.value)}
                  className="w-full bg-slate-50 border-0 rounded-2xl py-3.5 px-4 text-sm text-slate-600 focus:ring-2 focus:ring-amber-500 outline-none cursor-pointer"
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.nombre} div: "{c.division}"</option>
                  ))}
                </select>
              </div>

              <button 
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-full py-3.5 font-semibold text-sm transition-transform active:scale-95 mt-2 cursor-pointer"
              >
                Inscribir Alumno Oficial
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Parents linking sub modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] p-8 w-full max-w-md shadow-2xl relative">
            <button 
              onClick={() => { setSelectedStudent(null); setSelectedParentId(''); }}
              className="absolute right-6 top-6 p-1.5 text-slate-400 hover:bg-slate-100 rounded-full cursor-pointer"
            >
              <X size={20} />
            </button>
            <h3 className="font-display text-xl font-bold text-slate-800">Padres de {selectedStudent.nombre}</h3>
            <p className="text-slate-400 text-xs mt-1">Adminisre las personas de contacto asignadas a este menor.</p>

            <form onSubmit={handleAddParentLink} className="mt-5 space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Asociar Familiar Tutor</p>
              <div className="grid grid-cols-2 gap-2">
                <select 
                  value={selectedParentId}
                  onChange={e => setSelectedParentId(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl py-2.5 px-3 text-xs text-slate-600 focus:ring-2 focus:ring-amber-500 outline-none cursor-pointer"
                  required
                >
                  <option value="">-- Elija familiar --</option>
                  {parents.map(p => (
                    <option key={p.id} value={p.id}>{p.apellido}, {p.nombre}</option>
                  ))}
                </select>
                <select 
                  value={relacion}
                  onChange={e => setRelacion(e.target.value as any)}
                  className="bg-white border border-slate-200 rounded-xl py-2.5 px-3 text-xs text-slate-600 focus:ring-2 focus:ring-amber-500 outline-none cursor-pointer"
                >
                  <option value="Madre">Madre</option>
                  <option value="Padre">Padre</option>
                  <option value="Tutor">Representante/Tutor</option>
                </select>
              </div>
              <button 
                type="submit"
                disabled={!selectedParentId}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2.5 rounded-full text-xs font-bold outline-none transition-transform active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                Vincular como {relacion}
              </button>
            </form>

            <div className="mt-6 border-t border-slate-100 pt-5">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Vinculados activos</p>
              <div className="space-y-2 max-h-52 overflow-y-auto">
                {parentLinks.filter(pl => pl.studentId === selectedStudent.id).map(link => {
                  const parentObj = users.find(u => u.id === link.parentId);
                  return (
                    <div key={link.id} className="p-3 bg-slate-50 rounded-xl flex justify-between items-center select-none">
                      <div>
                        <span className="text-xs font-bold text-slate-800">{parentObj ? `${parentObj.nombre} ${parentObj.apellido}` : 'Desconocido'}</span>
                        <span className="text-[10px] bg-amber-550 italic text-amber-700 bg-amber-50 py-0.5 px-2 rounded-md font-semibold ml-2">
                          {link.relacion}
                        </span>
                      </div>
                      <button 
                        onClick={() => handleDeleteParentLink(link.id)}
                        className="text-xs font-semibold text-red-600 hover:bg-red-50 py-1 px-2.5 rounded-lg cursor-pointer"
                      >
                        Remover
                      </button>
                    </div>
                  );
                })}
                {parentLinks.filter(pl => pl.studentId === selectedStudent.id).length === 0 && (
                  <div className="text-center py-6 text-slate-400 text-xs italic">
                    No tiene tutores vinculados actualmente. Ingrese uno de la caja de arriba.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 2.5 AdminTeacherAssignmentsPage
function AdminTeacherAssignmentsPage({ users, courses, subjects, assignments, setAssignments }: AdminViewsProps) {
  const [selectedTeacherId, setSelectedTeacherId] = useState(users.find(u => u.rol === 'docente')?.id || '');
  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id || '');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');

  const handleAddAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacherId || !selectedSubjectId || !selectedCourseId) return;

    // Dupe check
    const dupe = assignments.some(a => a.teacherId === selectedTeacherId && a.subjectId === selectedSubjectId);
    if (dupe) return;

    const newAssignment: TeacherAssignment = {
      id: 'as_' + Date.now(),
      teacherId: selectedTeacherId,
      subjectId: selectedSubjectId,
      courseId: selectedCourseId
    };

    setAssignments([...assignments, newAssignment]);
    setSelectedSubjectId('');
  };

  const handleDeleteAssignment = (id: string) => {
    setAssignments(assignments.filter(a => a.id !== id));
  };

  const teachers = users.filter(u => u.rol === 'docente');
  const courseSubjects = subjects.filter(s => s.courseId === selectedCourseId);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-extrabold text-slate-800">Ubicación Docente (Asignaciones)</h2>
        <p className="text-sm text-slate-500 mt-0.5 font-medium">Asigne qué docente dicta qué materia en qué curso.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form panel */}
        <div className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-md h-fit">
          <h3 className="font-display text-lg font-bold text-slate-800 mb-4">Nueva Asignación</h3>
          <form onSubmit={handleAddAssignment} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 ml-1">Seleccionar Docente</label>
              <select 
                value={selectedTeacherId}
                onChange={e => setSelectedTeacherId(e.target.value)}
                className="w-full bg-slate-50 border-0 rounded-2xl py-3 px-4 text-xs text-slate-600 focus:ring-2 focus:ring-amber-500 outline-none cursor-pointer font-semibold"
                required
              >
                {teachers.map(t => (
                  <option key={t.id} value={t.id}>{t.apellido}, {t.nombre}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 ml-1">Seleccionar Curso</label>
              <select 
                value={selectedCourseId}
                onChange={e => setSelectedCourseId(e.target.value)}
                className="w-full bg-slate-50 border-0 rounded-2xl py-3 px-4 text-xs text-slate-600 focus:ring-2 focus:ring-amber-500 outline-none cursor-pointer font-semibold"
                required
              >
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre} Div: "{c.division}"</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 ml-1">Seleccionar Materia curricular</label>
              <select 
                value={selectedSubjectId}
                onChange={e => setSelectedSubjectId(e.target.value)}
                className="w-full bg-slate-50 border-0 rounded-2xl py-3 px-4 text-xs text-slate-600 focus:ring-2 focus:ring-amber-500 outline-none cursor-pointer font-semibold"
                required
              >
                <option value="">-- Elegir Materia --</option>
                {courseSubjects.map(s => (
                  <option key={s.id} value={s.id}>{s.nombre}</option>
                ))}
              </select>
            </div>

            <button 
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-full py-3 font-semibold text-xs transition-transform active:scale-95 cursor-pointer"
            >
              Asignar Docente a Materia
            </button>
          </form>
        </div>

        {/* Right list table */}
        <div className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-md lg:col-span-2">
          <h3 className="font-display text-lg font-bold text-slate-800 mb-4">Relación de Cargos Docentes</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Docente</th>
                  <th className="py-3 px-4">Curso</th>
                  <th className="py-3 px-4">Materia</th>
                  <th className="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-600 font-sans">
                {assignments.map(a => {
                  const teacher = users.find(u => u.id === a.teacherId);
                  const subject = subjects.find(s => s.id === a.subjectId);
                  const course = courses.find(c => c.id === a.courseId);

                  return (
                    <tr key={a.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        {teacher ? `${teacher.apellido}, ${teacher.nombre}` : 'Desconocido'}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-500">
                        {course ? `${course.nombre} "${course.division}"` : 'Sin curso'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="bg-blue-50 text-blue-700 py-1 px-2.5 rounded-lg font-bold text-[10px]">
                          {subject ? subject.nombre : 'Sin materia'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button 
                          onClick={() => handleDeleteAssignment(a.id)}
                          className="p-1 px-2 hover:bg-rose-50 text-rose-600 rounded-lg font-semibold cursor-pointer"
                        >
                          Remover
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {assignments.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-400">
                      No hay cargos docentes asociados actualmente. Genere uno desde la caja de la izquierda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// 2.6 AdminParentLinksPage
function AdminParentLinksPage({ students, users, parentLinks, setParentLinks }: AdminViewsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-extrabold text-slate-800">Vínculos de Padres-Alumnos</h2>
        <p className="text-sm text-slate-500 mt-0.5">Control cruzado de responsables a cargo de la tutela escolar.</p>
      </div>

      <div className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-lg">
        <h3 className="font-display text-lg font-bold text-slate-800 mb-4">Tabla General de Tutela</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                <th className="py-4 px-6">Alumno hijo</th>
                <th className="py-4 px-6">Tutor Familiar responsable</th>
                <th className="py-4 px-6">Vínculo Parentesco</th>
                <th className="py-4 px-6">Contacto de Emergencia</th>
                <th className="py-4 px-6 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {parentLinks.map(link => {
                const child = students.find(s => s.id === link.studentId);
                const parent = users.find(u => u.id === link.parentId);

                return (
                  <tr key={link.id} className="hover:bg-slate-50/50">
                    <td className="py-4.5 px-6 font-bold">{child ? `${child.apellido}, ${child.nombre}` : 'Desconocido'}</td>
                    <td className="py-4.5 px-6 font-semibold text-slate-800">{parent ? `${parent.apellido}, ${parent.nombre}` : 'Desconocido'}</td>
                    <td className="py-4.5 px-6">
                      <span className="bg-purple-50 text-purple-700 py-1 px-3 rounded-full text-[10px] font-bold uppercase">
                        {link.relacion}
                      </span>
                    </td>
                    <td className="py-4.5 px-6 font-mono text-slate-500">{parent?.telefono || 'No registra'}</td>
                    <td className="py-4.5 px-6 text-right">
                      <button 
                        onClick={() => setParentLinks(parentLinks.filter(p => p.id !== link.id))}
                        className="py-1 px-3 border border-red-100 hover:bg-red-50 text-red-600 rounded-xl text-[10px] font-bold cursor-pointer"
                      >
                        Quitar vínculo
                      </button>
                    </td>
                  </tr>
                );
              })}
              {parentLinks.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No se registran vínculos familiares. Matrícula incolora.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// 2.7 AdminLeavesPage (Aprobación/rechazo de licencias)
function AdminLeavesPage({ leaves, setLeaves }: AdminViewsProps) {
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');

  const updateLeaveStatus = (id: string, newStatus: 'aprobado' | 'rechazado') => {
    setLeaves(leaves.map(l => l.id === id ? { ...l, status: newStatus } : l));
  };

  const pendingList = leaves.filter(l => l.status === 'pendiente');
  const historyList = leaves.filter(l => l.status !== 'pendiente');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-extrabold text-slate-800">Licencias del Profesorado</h2>
        <p className="text-sm text-slate-500 mt-0.5">Control de ausentismo docente y asignación de suplencias.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-100 gap-6 text-sm">
        <button 
          onClick={() => setActiveTab('pending')}
          className={`pb-3 font-semibold relative outline-none cursor-pointer ${activeTab === 'pending' ? 'text-amber-600' : 'text-slate-400'}`}
        >
          Pendientes de revisión ({pendingList.length})
          {activeTab === 'pending' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500"></span>}
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`pb-3 font-semibold relative outline-none cursor-pointer ${activeTab === 'history' ? 'text-amber-600' : 'text-slate-400'}`}
        >
          Historial procesado
          {activeTab === 'history' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500"></span>}
        </button>
      </div>

      {activeTab === 'pending' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pendingList.map(leave => (
            <div key={leave.id} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-md flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-display text-lg font-bold text-slate-800">{leave.teacherName}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Solicitado el: {leave.fechaSolicitud}</p>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-600 py-1 px-3 rounded-full">
                    {leave.tipo}
                  </span>
                </div>
                
                <div className="bg-slate-50 p-4 rounded-2xl italic text-xs text-slate-600 mb-4 quotes border-l-4 border-amber-500">
                  "{leave.notas || 'No se adjuntaron notas aclaratorias.'}"
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs border-t border-slate-50 pt-4 mb-4 select-none">
                  <div>
                    <p className="text-slate-400 font-semibold uppercase text-[9px] tracking-wide">Fecha Inicio</p>
                    <p className="font-bold text-slate-700 mt-0.5">{leave.fechaInicio}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-semibold uppercase text-[9px] tracking-wide">Fecha Fin</p>
                    <p className="font-bold text-slate-700 mt-0.5">{leave.fechaFin}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => updateLeaveStatus(leave.id, 'aprobado')}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 rounded-full text-xs font-bold transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                >
                  <Check size={14} />
                  Aprobar Licencia
                </button>
                <button 
                  onClick={() => updateLeaveStatus(leave.id, 'rechazado')}
                  className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-600 py-3 rounded-full text-xs font-bold transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <X size={14} />
                  Rechazar
                </button>
              </div>
            </div>
          ))}
          {pendingList.length === 0 && (
            <div className="p-8 text-center bg-white border border-slate-100 rounded-[32px] md:col-span-2 text-slate-400 text-sm">
              No hay solicitudes de licencias pendientes de revisión académica. Todo en orden.
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Docente</th>
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4">Dias</th>
                  <th className="py-3 px-4">Fecha Inicio / Fin</th>
                  <th className="py-3 px-4 text-right">Resultado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                {historyList.map(h => (
                  <tr key={h.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-800">{h.teacherName}</td>
                    <td className="py-3 px-4 font-semibold">{h.tipo}</td>
                    <td className="py-3 px-4 font-bold">{h.dias} días</td>
                    <td className="py-3 px-4 font-mono text-slate-400">{h.fechaInicio} al {h.fechaFin}</td>
                    <td className="py-3 px-4 text-right">
                      {h.status === 'aprobado' ? (
                        <span className="bg-emerald-50 text-emerald-600 py-1 px-3 rounded-full font-bold uppercase text-[9px] inline-flex items-center gap-1">
                          <CheckCircle size={12} /> Aprobada
                        </span>
                      ) : (
                        <span className="bg-rose-50 text-rose-600 py-1 px-3 rounded-full font-bold uppercase text-[9px] inline-flex items-center gap-1">
                          <XCircle size={12} /> Rechazada
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// 2.8 AdminNotificationLogsPage
function AdminNotificationLogsPage({ notifications }: AdminViewsProps) {
  const [filterType, setFilterType] = useState('all');

  const filtered = filterType === 'all' 
    ? notifications 
    : notifications.filter(n => n.tipo === filterType);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-display text-2xl font-extrabold text-slate-800">Auditoría / Alerts Monitoring</h2>
          <p className="text-sm text-slate-500 mt-0.5">Filtro de notificaciones remitidas de manera automática por el Agente Python.</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-slate-450 text-slate-400" />
          <select 
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="bg-white border border-slate-200 rounded-2xl py-2 px-3 text-xs text-slate-600 outline-none cursor-pointer font-semibold"
          >
            <option value="all">Ver todas las alertas</option>
            <option value="Ausencias Críticas">Límite Ausencias Críticas</option>
            <option value="Calificación Baja">Calificación Baja</option>
            <option value="Falta de entrega">Inasistencia Entregas</option>
          </select>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs select-none">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                <th className="py-4 px-6">Timestamp emisión</th>
                <th className="py-4 px-6">Envío Canal</th>
                <th className="py-4 px-6">Destinatario Tutor</th>
                <th className="py-4 px-6">Hijo Alumno</th>
                <th className="py-4 px-6">Alerta Tipo / Texto de Notificación</th>
                <th className="py-4 px-6 text-right">Resultado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map(n => (
                <tr key={n.id} className="hover:bg-slate-50/50">
                  <td className="py-4 px-6 font-mono text-slate-450 text-slate-400">{n.fecha}</td>
                  <td className="py-4 px-6">
                    <span className="bg-slate-100 py-1 px-2.5 rounded-lg font-bold text-[9px] uppercase text-slate-600 block w-fit">
                      {n.canal}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-semibold text-slate-800">{n.destinatario}</td>
                  <td className="py-4 px-6 font-bold">{n.alumno}</td>
                  <td className="py-4 px-6 max-w-sm">
                    <span className="font-bold text-[10px] text-amber-700 uppercase tracking-wide block mb-1">{n.tipo}</span>
                    <p className="text-slate-500 italic line-clamp-2">"{n.mensaje}"</p>
                    {n.error && (
                      <span className="text-[10px] text-red-600 font-mono block mt-1.5 p-1 bg-red-50 rounded-md border border-red-100">
                        ERR: {n.error}
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-right">
                    {n.estado === 'enviado' ? (
                      <span className="bg-emerald-50 text-emerald-600 py-0.5 px-2 rounded-full font-bold uppercase text-[9px]">
                        Exitoso
                      </span>
                    ) : (
                      <span className="bg-rose-50 text-rose-600 py-0.5 px-2 rounded-full font-bold uppercase text-[9px]">
                        Falla
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// 2.9 AdminConfigurationPage
function AdminConfigurationPage({ config, setConfig }: AdminViewsProps) {
  const [umbral, setUmbral] = useState(config.umbralAusenciasCriticas);
  const [horario, setHorario] = useState(config.horarioNotificaciones);
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setConfig({
      ...config,
      umbralAusenciasCriticas: Number(umbral),
      horarioNotificaciones: horario
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleToggle = (key: string) => {
    setConfig({
      ...config,
      alertasHabilitadas: {
        ...config.alertasHabilitadas,
        [key]: !config.alertasHabilitadas[key]
      }
    });
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h2 className="font-display text-2xl font-extrabold text-slate-800">Parámetros del Sistema</h2>
        <p className="text-sm text-slate-500 mt-0.5">Ajuste configuraciones y umbrales de advertencias.</p>
      </div>

      {saved && (
        <div className="p-4 bg-emerald-50 text-emerald-700 font-semibold border border-emerald-100 rounded-2xl text-xs flex items-center gap-2">
          <CheckCircle size={16} />
          Configuraciones actualizadas con éxito.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-lg space-y-4">
          <h3 className="font-display font-bold text-slate-800">Ajuste de Umbrales</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500">Inasistencias Críticas Límite</label>
              <input 
                type="number" 
                value={umbral}
                onChange={e => setUmbral(e.target.value)}
                className="w-full bg-slate-50 border-0 rounded-2xl py-3 px-4 text-sm text-slate-700 focus:ring-2 focus:ring-amber-500 outline-none" 
              />
              <p className="text-[10px] text-slate-400">Determina el valor tras el cual se emiten las alertas informativas automáticas.</p>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500">Horario de Notificaciones</label>
              <input 
                type="time" 
                value={horario}
                onChange={e => setHorario(e.target.value)}
                className="w-full bg-slate-50 border-0 rounded-2xl py-3 px-4 text-sm text-slate-700 focus:ring-2 focus:ring-amber-500 outline-none cursor-pointer" 
              />
              <p className="text-[10px] text-slate-400">Hora de envío diario de los logs procesados por el backend.</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-lg space-y-4">
          <h3 className="font-display font-bold text-slate-800">Alertas Automáticas</h3>
          <div className="divide-y divide-slate-150 divide-slate-100 text-xs">
            {[
              { id: 'ausenciasCriticas', title: 'Alerta de Ausencias Críticas', desc: 'Alertar inmediatamente al familiar cuando supera el umbral.' },
              { id: 'notasBajas', title: 'Alertas por Rendimiento Bajo', desc: 'Advertir cuando la nota es menor a 4.00.' },
              { id: 'faltaEntregas', title: 'Alerta por Tareas Pendientes', desc: 'Notificar falta de entrega el día del vencimiento.' }
            ].map(al => (
              <div key={al.id} className="py-3 flex justify-between items-center bg-slate-50/20 px-3 rounded-lg mt-1">
                <div>
                  <h4 className="font-bold text-slate-700">{al.title}</h4>
                  <p className="text-slate-400 text-[10px]">{al.desc}</p>
                </div>
                <button 
                  type="button"
                  onClick={() => handleToggle(al.id)}
                  className={`w-11 h-6 rounded-full p-1 transition-colors cursor-pointer outline-none relative ${config.alertasHabilitadas[al.id] ? 'bg-amber-500' : 'bg-slate-300'}`}
                >
                  <span className={`block w-4 h-4 bg-white rounded-full transition-transform ${config.alertasHabilitadas[al.id] ? 'translate-x-5' : 'translate-x-0'}`}></span>
                </button>
              </div>
            ))}
          </div>
        </div>

        <button 
          type="submit"
          className="bg-slate-900 hover:bg-slate-800 text-white rounded-full py-3.5 px-8 text-sm font-semibold shadow-md transition-transform active:scale-95 cursor-pointer"
        >
          Guardar Configuración Global
        </button>
      </form>
    </div>
  );
}
