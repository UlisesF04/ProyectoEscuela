/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Course, Subject, Student, Task, Submission, TeacherLeave } from '../../types';
import { 
  Check, Play, ArrowRight, Save, Trash, Plus, FileText, ChevronRight, CheckCircle, ShieldAlert, X, AlertTriangle 
} from 'lucide-react';

interface DocenteViewsProps {
  currentView: string;
  courses: Course[];
  subjects: Subject[];
  students: Student[];
  tasks: Task[];
  submissions: Submission[];
  leaves: TeacherLeave[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  setSubmissions: React.Dispatch<React.SetStateAction<Submission[]>>;
  setLeaves: React.Dispatch<React.SetStateAction<TeacherLeave[]>>;
}

export default function DocenteViews(props: DocenteViewsProps) {
  const { currentView } = props;

  switch (currentView) {
    case 'grades':
      return <GradesPage {...props} />;
    case 'tasks':
      return <TasksPage {...props} />;
    case 'submissions':
      return <TaskSubmissionsPage {...props} />;
    case 'leaves':
      return <MyLeavesPage {...props} />;
    case 'profile':
      return <ProfileSection />;
    default:
      return <GradesPage {...props} />;
  }
}

// 4.2 GradesPage - Carga de calificaciones
function GradesPage({ courses, subjects, students }: DocenteViewsProps) {
  const [selectedSubjectId, setSelectedSubjectId] = useState('s1'); // Matemática I
  const [selectedPeriod, setSelectedPeriod] = useState('1er Trimestre');
  const [selectedType, setSelectedType] = useState('Examen Escrito');

  // Local state for interactive grades editing in prototype
  const [localGradesState, setLocalGradesState] = useState<Record<string, string>>({
    'st1': '4.50',
    'st2': '10.00',
    'st5': '6.20'
  });
  const [saveRows, setSaveRows] = useState<Record<string, boolean>>({});
  const [saveAllSuccess, setSaveAllSuccess] = useState(false);

  const subjectObj = subjects.find(s => s.id === selectedSubjectId);
  const matchedStudents = students.filter(s => {
    // Show students of the course matching selected subject
    return subjectObj ? s.courseId === subjectObj.courseId : false;
  });

  const handleGradeChange = (studentId: string, val: string) => {
    setLocalGradesState({
      ...localGradesState,
      [studentId]: val
    });
    // Remove individual success check on edit
    setSaveRows({ ...saveRows, [studentId]: false });
  };

  const handleSaveRow = (studentId: string) => {
    const val = Number(localGradesState[studentId]);
    if (isNaN(val) || val < 0 || val > 10) return;

    setSaveRows({
      ...saveRows,
      [studentId]: true
    });
  };

  const handleSaveAll = () => {
    setSaveAllSuccess(true);
    setTimeout(() => {
      setSaveAllSuccess(false);
      // Mark all row checks
      const checks: Record<string, boolean> = {};
      matchedStudents.forEach(s => {
        checks[s.id] = true;
      });
      setSaveRows(checks);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-display text-2xl font-extrabold text-slate-800">Carga Académica de Notas</h2>
          <p className="text-sm text-slate-500 mt-0.5">Registre calificaciones según tramo, unidad y alumno.</p>
        </div>
        <button 
          onClick={handleSaveAll}
          className="bg-slate-900 hover:bg-slate-800 text-white rounded-full py-2.5 px-6 text-sm font-semibold flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
        >
          <Save size={18} />
          Guardar Todas (Batch)
        </button>
      </div>

      {saveAllSuccess && (
        <div className="p-4 bg-emerald-50 text-emerald-700 font-semibold border border-emerald-100 rounded-2xl text-xs flex items-center gap-2">
          <CheckCircle size={16} />
          Todas las calificaciones han sido validadas e indexadas en el sistema.
        </div>
      )}

      {/* Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <label className="text-xs font-bold text-slate-400 block mb-1.5 uppercase ml-1">Elegir Asignatura dictada</label>
          <select 
            value={selectedSubjectId}
            onChange={e => setSelectedSubjectId(e.target.value)}
            className="w-full bg-slate-50 border-0 rounded-2xl py-3 px-4 text-sm text-slate-600 focus:ring-2 focus:ring-amber-500 outline-none cursor-pointer font-semibold"
          >
            <option value="s1">Matemática I (1º A)</option>
            <option value="s3">Historia Mundial (1º A)</option>
            <option value="s4">Biología General (1º A)</option>
            <option value="s5">Matemática II (2º B)</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-400 block mb-1.5 uppercase ml-1">Período Trimestral</label>
          <select 
            value={selectedPeriod}
            onChange={e => setSelectedPeriod(e.target.value)}
            className="w-full bg-slate-50 border-0 rounded-2xl py-3 px-4 text-sm text-slate-600 focus:ring-2 focus:ring-amber-500 outline-none cursor-pointer font-semibold"
          >
            <option value="1er Trimestre">1º Trimestre Escolar</option>
            <option value="2do Trimestre">2º Trimestre Escolar</option>
            <option value="3er Trimestre">3º Trimestre Escolar</option>
            <option value="Recuperatorio">Recuperatorio General</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-400 block mb-1.5 uppercase ml-1">Tipo de Actividad</label>
          <select 
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            className="w-full bg-slate-50 border-0 rounded-2xl py-3 px-4 text-sm text-slate-600 focus:ring-2 focus:ring-amber-500 outline-none cursor-pointer font-semibold"
          >
            <option value="Examen Escrito">Examen Escrito Integral</option>
            <option value="Entrega de Tarea">Práctico Obligatorio</option>
            <option value="Lección Oral">Lección Oral / Coloquio</option>
          </select>
        </div>
      </div>

      {/* Alumnos Table for editing */}
      <div className="bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-lg">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
              <th className="py-4 px-6">Alumno inscripto</th>
              <th className="py-4 px-6">Rango Permitido (0.00 - 10.00)</th>
              <th className="py-4 px-6">Advertencia / Estado</th>
              <th className="py-4 px-6 text-right">Guardado por fila</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
            {matchedStudents.map(st => {
              const currentGrade = localGradesState[st.id] || '';
              const numVal = Number(currentGrade);
              const isInvalid = isNaN(numVal) || numVal < 0 || numVal > 10 || currentGrade === '';
              const isLowObj = !isInvalid && numVal < 4;

              return (
                <tr key={st.id} className="hover:bg-slate-50/50">
                  <td className="py-4 px-6 font-bold">{st.apellido}, {st.nombre}</td>
                  <td className="py-4 px-6">
                    <input 
                      type="text" 
                      value={currentGrade}
                      onChange={e => handleGradeChange(st.id, e.target.value)}
                      placeholder="Ej: 7.50"
                      className={`w-32 bg-slate-50 border-2 rounded-2xl py-2 px-4 text-center font-bold font-mono text-sm outline-none transition-all ${
                        isInvalid ? 'border-transparent focus:border-red-400 focus:bg-red-50' : 
                        isLowObj ? 'border-amber-400/50 focus:border-amber-500 focus:bg-amber-50/20' : 'border-transparent focus:border-emerald-500 focus:bg-emerald-50/20'
                      }`}
                    />
                  </td>
                  <td className="py-4 px-6">
                    {isInvalid ? (
                      <span className="text-red-500 font-bold text-[10px] uppercase flex items-center gap-1">
                        <AlertTriangle size={14} /> Entrada inválida
                      </span>
                    ) : isLowObj ? (
                      <span className="text-amber-600 font-bold text-[10px] uppercase tracking-wide flex items-center gap-1">
                        🚨 Genera Alerta (Nota &lt; 4.00)
                      </span>
                    ) : (
                      <span className="text-emerald-600 font-bold text-[10px] uppercase flex items-center gap-1">
                        Aprobado (Regulable)
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button 
                      onClick={() => handleSaveRow(st.id)}
                      disabled={isInvalid}
                      className={`p-2.5 rounded-xl cursor-pointer ${saveRows[st.id] ? 'bg-emerald-500 text-white shadow-sm' : 'border border-slate-200 text-slate-400 hover:bg-slate-100 disabled:opacity-50'}`}
                    >
                      {saveRows[st.id] ? <CheckCircle size={16} /> : <Save size={16} />}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// 4.3 TasksPage - Creación y gestión de tareas
function TasksPage({ tasks, setTasks, submissions, setSubmissions, onNavigateToView }: DocenteViewsProps & { onNavigateToView?: (v: string) => void }) {
  const [showModal, setShowModal] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [materiaId, setMateriaId] = useState('s1');
  const [fechaVencimiento, setFechaVencimiento] = useState('');

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo || !descripcion || !fechaVencimiento) return;

    const newTask: Task = {
      id: 'task_' + Date.now(),
      titulo,
      descripcion,
      materiaId,
      materiaNombre: 'Matemática I',
      cursoId: 'c1',
      cursoNombre: '1º A',
      fechaVencimiento
    };

    setTasks([newTask, ...tasks]);
    setShowModal(false);
    
    // Reset
    setTitulo('');
    setDescripcion('');
    setFechaVencimiento('');
  };

  const handleRemoveTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-display text-2xl font-extrabold text-slate-800">Tareas y Consignas</h2>
          <p className="text-sm text-slate-500 mt-0.5 font-medium">Asigne trabajos, de seguimiento de entregas y califique.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-slate-900 hover:bg-slate-800 text-white rounded-full py-2.5 px-5 text-sm font-semibold flex items-center gap-1.5 cursor-pointer"
        >
          <Plus size={18} />
          Nueva Tarea
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tasks.map(task => {
          const taskSubs = submissions.filter(s => s.taskId === task.id);
          const submittedCount = taskSubs.filter(s => s.estado !== 'Pendiente').length;
          const lateCount = taskSubs.filter(s => s.estado === 'Tarde').length;

          return (
            <div key={task.id} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-md hover:shadow-lg transition-all duration-200 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 py-1 px-3 rounded-full">
                    {task.materiaNombre}
                  </span>
                  <span className="text-xs font-semibold text-slate-400 font-mono">Vence: {task.fechaVencimiento}</span>
                </div>
                <h3 className="font-display text-lg font-bold text-slate-800">{task.titulo}</h3>
                <p className="text-xs text-slate-500 mt-2 italic line-clamp-2">"{task.descripcion}"</p>
                
                <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between text-xs select-none">
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block">Curso</span>
                    <span className="font-bold text-slate-700 mt-0.5 block">{task.cursoNombre}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block">Entregas</span>
                    <span className="font-mono font-bold text-slate-700 mt-0.5 block">{submittedCount} de 3 alumnos ({lateCount} tarde)</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-2">
                <button 
                  onClick={() => onNavigateToView && onNavigateToView('submissions')}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-white rounded-full py-2 px-4 text-xs font-bold transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-1"
                >
                  Ver Entregas
                  <ChevronRight size={14} className="stroke-[3]" />
                </button>
                <button 
                  onClick={() => handleRemoveTask(task.id)}
                  className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl cursor-pointer"
                  title="Eliminar consigna"
                >
                  <Trash size={15} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* New Task modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] p-8 w-full max-w-sm shadow-2xl border border-slate-50 relative">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute right-6 top-6 p-1.5 text-slate-400 hover:bg-slate-100 rounded-full cursor-pointer"
            >
              <X size={20} />
            </button>
            <h3 className="font-display text-xl font-bold text-slate-800">Asignar Nueva Tarea</h3>
            <p className="text-slate-400 text-xs mt-1">Cree una consigna oficial de resolución escolar.</p>

            <form onSubmit={handleAddTask} className="space-y-4 mt-6">
              <input 
                type="text" 
                placeholder="Título de la Consigna" 
                value={titulo} 
                onChange={e => setTitulo(e.target.value)}
                className="w-full bg-slate-50 border-0 rounded-2xl py-3.5 px-4 text-sm text-slate-700 focus:ring-2 focus:ring-amber-500 outline-none" 
                required
              />
              <textarea 
                placeholder="Describa la metodología y pautas de presentación..."
                value={descripcion}
                onChange={e => setDescripcion(e.target.value)}
                className="w-full bg-slate-50 border-0 rounded-2xl py-3.5 px-4 text-sm text-slate-700 focus:ring-2 focus:ring-amber-500 outline-none h-24 select-text"
                required
              />
              <div className="grid grid-cols-2 gap-2">
                <select 
                  value={materiaId}
                  onChange={e => setMateriaId(e.target.value)}
                  className="bg-slate-50 border-0 rounded-2xl py-3 px-3 text-xs text-slate-600 focus:ring-2 focus:ring-amber-500 outline-none cursor-pointer"
                >
                  <option value="s1">Matemática I</option>
                  <option value="s3">Historia Mundial</option>
                  <option value="s4">Biología General</option>
                </select>
                <div className="space-y-1">
                  <input 
                    type="date" 
                    value={fechaVencimiento} 
                    onChange={e => setFechaVencimiento(e.target.value)}
                    className="w-full bg-slate-50 border-0 rounded-2xl py-3 px-3 text-xs text-slate-600 focus:ring-2 focus:ring-amber-500 outline-none cursor-pointer font-sans" 
                    required
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-full py-3.5 font-semibold text-xs transition-transform active:scale-95 mt-2 cursor-pointer"
              >
                Crear y Publicar Trabajo
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// 4.4 TaskSubmissionsPage - Registro de estado entregas
function TaskSubmissionsPage({ submissions, setSubmissions }: DocenteViewsProps) {
  const [taskFilter, setTaskFilter] = useState('t1'); // Matematica 1
  const [saveSuccess, setSaveSuccess] = useState(false);

  const matchedSubs = submissions.filter(s => s.taskId === taskFilter);

  // Single-direction state locked as specified in RN-15 (Pendiente -> Entregada | Tarde, irreversible)
  const handleStateChange = (id: string, newState: 'Pendiente' | 'Entregada' | 'Tarde') => {
    const record = submissions.find(s => s.id === id);
    if (record && record.estado !== 'Pendiente') {
      // Reversion attempted - warning or blocking according to rule
      return;
    }

    setSubmissions(submissions.map(s => s.id === id ? { 
      ...s, 
      estado: newState,
      fechaEntrega: '2026-05-29'
    } : s));
  };

  const saveSubmissions = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-display text-2xl font-extrabold text-slate-800">Control de Entregas</h2>
          <p className="text-sm text-slate-500 mt-0.5">Registre la recepción física de carpetas y trabajos prácticos.</p>
        </div>
        <button 
          onClick={saveSubmissions}
          className="bg-slate-900 hover:bg-slate-800 text-white rounded-full py-2.5 px-6 text-sm font-semibold transition-transform active:scale-95 cursor-pointer"
        >
          Guardar Recepción
        </button>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 text-emerald-700 font-semibold border border-emerald-100 rounded-2xl text-xs flex items-center gap-2">
          <CheckCircle size={16} />
          Se ha actualizado de forma exitosa el estado de entrega.
        </div>
      )}

      {/* Task Picker */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-4">
        <label className="text-xs font-bold text-slate-400 block uppercase ml-1 md:whitespace-nowrap">Tarea Evaluada</label>
        <select 
          value={taskFilter}
          onChange={e => setTaskFilter(e.target.value)}
          className="w-full md:max-w-md bg-slate-50 border-0 rounded-2xl py-3 px-4 text-sm text-slate-650 text-slate-600 focus:ring-2 focus:ring-amber-500 outline-none cursor-pointer font-semibold font-sans"
        >
          <option value="t1">Matemática I - Ecuaciones Fraccionarias Práctica</option>
          <option value="t2">Historia Mundial - Informe Revolución de Mayo</option>
          <option value="t3">Biología General - Célula Procariota Maqueta</option>
        </select>
      </div>

      {/* Submissions Table list */}
      <div className="bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-lg">
        <table className="w-full text-left border-collapse select-none">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
              <th className="py-4 px-6">Alumno matriculado</th>
              <th className="py-4 px-6 text-center">Estado de Recepción</th>
              <th className="py-4 px-6 text-right">Información de entrega</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
            {matchedSubs.map(sub => (
              <tr key={sub.id} className="hover:bg-slate-50/50">
                <td className="py-4.5 px-6 font-bold">{sub.studentName}</td>
                <td className="py-4.5 px-6 text-center">
                  <div className="inline-flex p-1 bg-slate-50 rounded-full border border-slate-100 gap-1">
                    <button 
                      onClick={() => handleStateChange(sub.id, 'Pendiente')}
                      disabled={sub.estado !== 'Pendiente'}
                      className={`py-2 px-5 rounded-full text-xs font-bold transition-colors cursor-pointer ${sub.estado === 'Pendiente' ? 'bg-rose-500 text-white shadow-sm' : 'opacity-40 text-slate-400'}`}
                    >
                      Pendiente
                    </button>
                    <button 
                      onClick={() => handleStateChange(sub.id, 'Entregada')}
                      disabled={sub.estado !== 'Pendiente'}
                      className={`py-2 px-5 rounded-full text-xs font-bold transition-colors cursor-pointer ${sub.estado === 'Entregada' ? 'bg-emerald-500 text-white shadow-sm' : 'hover:bg-slate-200 text-slate-400'}`}
                    >
                      Entregada
                    </button>
                    <button 
                      onClick={() => handleStateChange(sub.id, 'Tarde')}
                      disabled={sub.estado !== 'Pendiente'}
                      className={`py-2 px-5 rounded-full text-xs font-bold transition-colors cursor-pointer ${sub.estado === 'Tarde' ? 'bg-amber-500 text-white shadow-sm' : 'hover:bg-slate-200 text-slate-400'}`}
                    >
                      Tarde
                    </button>
                  </div>
                </td>
                <td className="py-4.5 px-6 text-right font-mono text-xs">
                  {sub.estado !== 'Pendiente' ? (
                    <span className="text-emerald-600 font-bold inline-flex items-center gap-1">
                      <CheckCircle size={14} /> Registrada ({sub.fechaEntrega})
                    </span>
                  ) : (
                    <span className="text-slate-450 text-slate-400">Por recibir</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-amber-50 p-4 border border-amber-100 rounded-2xl flex items-start gap-2 max-w-xl text-xs text-amber-800">
        <AlertTriangle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="leading-snug">
          <b>Regla de Seguridad Académica (RN-15)</b>: El estado de los trabajos presentados es unidireccional. Una vez marcado como recibido (Entregado/Tarde), no es posible revertirlo a pendiente para evitar raspaduras.
        </p>
      </div>
    </div>
  );
}

// 4.5 MyLeavesPage - Solicitud de licencias por el docente
function MyLeavesPage({ leaves, setLeaves }: DocenteViewsProps) {
  const [tipo, setTipo] = useState<'Enfermedad' | 'Personal' | 'Gremial'>('Enfermedad');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [notas, setNotas] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Simple date diff calculator
  const calculateDays = () => {
    if (!fechaInicio || !fechaFin) return 0;
    const s = new Date(fechaInicio);
    const e = new Date(fechaFin);
    const diff = e.getTime() - s.getTime();
    if (diff < 0) return 0;
    return Math.round(diff / (1000 * 60 * 60 * 24)) + 1;
  };

  const handleAddLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fechaInicio || !fechaFin) return;

    const daysCount = calculateDays();
    if (daysCount === 0) return;

    const newLeave: TeacherLeave = {
      id: 'l_' + Date.now(),
      teacherId: 'u5',
      teacherName: 'Mariana López (Docente)',
      tipo,
      fechaInicio,
      fechaFin,
      dias: daysCount,
      status: 'pendiente',
      notas: notas || undefined,
      fechaSolicitud: '2026-05-29' // today
    };

    setLeaves([newLeave, ...leaves]);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);

    // Reset
    setFechaInicio('');
    setFechaFin('');
    setNotas('');
  };

  const myLeaves = leaves.filter(l => l.teacherId === 'u5' || l.teacherName.includes('Mariana'));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-extrabold text-slate-800">Mis Licencias Docentes</h2>
        <p className="text-sm text-slate-500 mt-0.5 font-medium">Solicite permisos de reposo y visualice el estado de aprobación central.</p>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 text-emerald-700 font-semibold border border-emerald-100 rounded-2xl text-xs flex items-center gap-2">
          <CheckCircle size={16} />
          Fórmula de solicitud enviada de forma satisfactoria a Dirección.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form panel */}
        <div className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-md h-fit">
          <h3 className="font-display text-lg font-bold text-slate-800 mb-4 font-sans">Nueva Solicitud</h3>
          <form onSubmit={handleAddLeave} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 ml-1">Especifique motivo / Causa</label>
              <select 
                value={tipo}
                onChange={e => setTipo(e.target.value as any)}
                className="w-full bg-slate-50 border-0 rounded-2xl py-3 px-4 text-xs text-slate-600 focus:ring-2 focus:ring-amber-500 outline-none cursor-pointer font-semibold"
              >
                <option value="Enfermedad">Carpeta Médica (Enfermedad)</option>
                <option value="Personal">Trámite Personal</option>
                <option value="Gremial">Asunto Sindical/Gremial</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 ml-1">Fecha de Inicio</label>
                <input 
                  type="date" 
                  value={fechaInicio}
                  onChange={e => setFechaInicio(e.target.value)}
                  className="w-full bg-slate-50 border-0 rounded-2xl py-3 px-3 text-xs text-slate-600 focus:ring-2 focus:ring-amber-500 outline-none cursor-pointer font-semibold font-sans"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 ml-1">Fecha de Fin</label>
                <input 
                  type="date" 
                  value={fechaFin}
                  onChange={e => setFechaFin(e.target.value)}
                  className="w-full bg-slate-50 border-0 rounded-2xl py-3 px-3 text-xs text-slate-600 focus:ring-2 focus:ring-amber-500 outline-none cursor-pointer font-semibold font-sans"
                  required
                />
              </div>
            </div>

            {calculateDays() > 0 && (
              <div className="p-3 bg-amber-50 rounded-xl text-xs text-amber-800 font-bold text-center">
                Total Días Solicitados: {calculateDays()} días hábiles
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 ml-1">Anotaciones / Justificativo</label>
              <textarea 
                placeholder="Indique centro médico de atención o cuadro clínico general..."
                value={notas}
                onChange={e => setNotas(e.target.value)}
                className="w-full bg-slate-50 border-0 rounded-2xl py-3 px-4 text-xs text-slate-700 focus:ring-2 focus:ring-amber-500 outline-none h-20 select-text font-serif"
              />
            </div>

            <button 
              type="submit"
              disabled={calculateDays() === 0}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-full py-3 font-semibold text-xs transition-transform active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              Enviar Ficha Solicitud
            </button>
          </form>
        </div>

        {/* Right log panel */}
        <div className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-md lg:col-span-2">
          <h3 className="font-display text-lg font-bold text-slate-800 mb-4 font-sans">Registro de Solicitudes</h3>
          <div className="space-y-4">
            {myLeaves.map(link => (
              <div key={link.id} className="p-4.5 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center select-none">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 text-sm">{link.tipo}</span>
                    <span className="text-[10px] bg-slate-200 text-slate-500 py-0.5 px-2 rounded font-mono font-semibold">
                      {link.dias} días solicitado
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 font-semibold">Período: {link.fechaInicio} al {link.fechaFin}</p>
                </div>
                <div>
                  {link.status === 'pendiente' ? (
                    <span className="bg-amber-50 text-amber-600 py-1 px-3.5 rounded-full font-bold uppercase text-[9px]">
                      Pendiente
                    </span>
                  ) : link.status === 'aprobado' ? (
                    <span className="bg-emerald-50 text-emerald-600 py-1 px-3.5 rounded-full font-bold uppercase text-[9px]">
                      Aprobada
                    </span>
                  ) : (
                    <span className="bg-rose-50 text-rose-600 py-1 px-3.5 rounded-full font-bold uppercase text-[9px]">
                      Rechazada
                    </span>
                  )}
                </div>
              </div>
            ))}
            {myLeaves.length === 0 && (
              <div className="p-12 text-center text-slate-400 text-xs italic">
                Aun no ha iniciado solicitudes de carpeta médica o licencias.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// 4.6 ProfileSection
function ProfileSection() {
  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div>
        <h2 className="font-display text-2xl font-extrabold text-slate-800">Mi Perfil / Datos Personales</h2>
        <p className="text-sm text-slate-500 mt-0.5">Control de credenciales del personal de cátedra.</p>
      </div>

      <div className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-xl flex flex-col items-center text-center">
        <div className="w-24 h-24 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center font-display text-3xl font-extrabold mb-4 select-none">
          ML
        </div>
        <h3 className="font-display text-2xl font-bold text-slate-850 text-slate-800">Prof. Mariana López</h3>
        <p className="text-[10px] uppercase font-bold tracking-wider text-amber-600 bg-amber-50 py-1 px-3 rounded-full mt-2">
          Docente Ordinario de Matemáticas
        </p>

        <div className="w-full space-y-3.5 border-t border-slate-100 mt-6 pt-6 text-sm text-slate-700 select-all font-sans text-left">
          <div className="flex justify-between">
            <span className="text-slate-400 font-semibold font-sans">Dirección de correo:</span>
            <span className="font-bold font-mono">mariana.lopez@school.edu</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 font-semibold font-sans">Teléfono celular:</span>
            <span className="font-bold font-mono">+54 9 11 5566-7788</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 font-semibold font-sans">Situación de Revista:</span>
            <span className="font-bold">Titular Interina</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 font-semibold font-sans">Sede de dictado:</span>
            <span className="font-bold">Ciclo Básico Unificado (CBU)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
