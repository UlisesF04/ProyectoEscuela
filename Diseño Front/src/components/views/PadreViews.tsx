/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Course, Student, Attendance, Task, Submission } from '../../types';
import { 
  CheckCircle, ShieldAlert, FileText, AlertTriangle, Download, ArrowRight, UploadCloud, X, Check, Clock 
} from 'lucide-react';

interface PadreViewsProps {
  currentView: string;
  students: Student[];
  attendances: Attendance[];
  tasks: Task[];
  submissions: Submission[];
  setAttendances: React.Dispatch<React.SetStateAction<Attendance[]>>;
}

export default function PadreViews(props: PadreViewsProps) {
  const { students } = props;

  // Track parent's children (Ana Rodriguez is matched to Tomas Rodriguez PL1, Julio is st2, st5, etc.)
  // We'll show an interactive child selector first in all sub-views!
  const [activeChildId, setActiveChildId] = useState<'st1' | 'st2' | 'st3' | 'st4'>('st1');

  const selectedChild = students.find(s => s.id === activeChildId) || students[0];

  const handleChildSelect = (id: any) => {
    setActiveChildId(id);
  };

  const commonProps = {
    ...props,
    selectedChild,
    activeChildId,
    onChildSelect: handleChildSelect
  };

  switch (props.currentView) {
    case 'grades':
      return <ChildGradesPage {...commonProps} />;
    case 'attendances':
      return <ChildAttendancesPage {...commonProps} />;
    case 'tasks':
      return <ChildTasksPage {...commonProps} />;
    case 'upload-certificate':
      return <UploadCertificatePage {...commonProps} />;
    default:
      return <ChildGradesPage {...commonProps} />;
  }
}

// 5.2 ChildSelector Sub-Component
interface ChildSelectorProps {
  students: Student[];
  activeChildId: string;
  onChildSelect: (id: string) => void;
}

function ChildSelector({ students, activeChildId, onChildSelect }: ChildSelectorProps) {
  // Mock children for prototype: Tomas, Sofia, Lucas, Milena
  const myKids = students.filter(s => ['st1', 'st2', 'st3', 'st4'].includes(s.id));

  return (
    <div className="bg-white border border-slate-100 p-4 rounded-3xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 select-none">
      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Contexto Alumno Hijo</span>
      <div className="flex gap-2 w-full sm:w-auto">
        {myKids.map(kid => (
          <button 
            key={kid.id}
            onClick={() => onChildSelect(kid.id)}
            className={`flex-1 sm:flex-none py-2 px-4 rounded-xl text-xs font-bold transition-colors cursor-pointer ${activeChildId === kid.id ? 'bg-fuchsia-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
          >
            👨‍🎓 {kid.nombre}
          </button>
        ))}
      </div>
    </div>
  );
}

// 5.3 ChildGradesPage - Boletín de calificaciones del alumno
function ChildGradesPage(props: PadreViewsProps & { selectedChild: Student; activeChildId: string; onChildSelect: (id: string) => void }) {
  const { selectedChild, activeChildId, onChildSelect, students } = props;

  // Mocked static gradebooks representing the selected child
  const mockSubjectGrades: Record<string, Array<{ subject: string; grade: number; type: string; date: string }>> = {
    'st1': [ // Tomás
      { subject: 'Matemática I', grade: 4.5, type: 'Examen Escrito 1', date: '2026-05-15' },
      { subject: 'Lengua y Literatura', grade: 7.2, type: 'Evaluación Oral', date: '2026-05-20' },
      { subject: 'Historia Mundial', grade: 3.0, type: 'Trabajo Práctico 1', date: '2026-05-10' },
      { subject: 'Biología General', grade: 8.5, type: 'Prueba Escrita', date: '2026-05-28' },
    ],
    'st2': [ // Sofía
      { subject: 'Matemática I', grade: 10.0, type: 'Examen Escrito 1', date: '2026-05-15' },
      { subject: 'Lengua y Literatura', grade: 9.0, type: 'Evaluación Oral', date: '2026-05-20' },
      { subject: 'Historia Mundial', grade: 8.5, type: 'Trabajo Práctico 1', date: '2026-05-10' },
      { subject: 'Biología General', grade: 9.5, type: 'Prueba Escrita', date: '2026-05-28' },
    ],
    'st3': [ // Lucas
      { subject: 'Matemática II', grade: 5.5, type: 'Primer Examen', date: '2026-05-12' },
      { subject: 'Física Química', grade: 6.8, type: 'Trabajo Escrito', date: '2026-05-18' },
    ],
    'st4': [ // Milena
      { subject: 'Matemática II', grade: 8.5, type: 'Primer Examen', date: '2026-05-12' },
      { subject: 'Física Química', grade: 7.5, type: 'Trabajo Escrito', date: '2026-05-18' },
    ]
  };

  const grades = mockSubjectGrades[activeChildId] || [];
  const total = grades.reduce((acc, cr) => acc + cr.grade, 0);
  const average = grades.length > 0 ? (total / grades.length).toFixed(2) : '0.00';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-extrabold text-slate-800">Boletín de Calificaciones</h2>
        <p className="text-sm text-slate-500 mt-0.5">Visualice los registros de notas y desempeño cursado.</p>
      </div>

      <ChildSelector students={students} activeChildId={activeChildId} onChildSelect={onChildSelect} />

      {/* Average badge inside grid bento */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-[32px] p-6 border border-slate-50 shadow-md flex justify-between items-center md:col-span-2">
          <div>
            <h3 className="font-display text-lg font-bold text-slate-800">Desempeño Trimestral</h3>
            <p className="text-xs text-slate-400 mt-0.5">Asistencia al día. Alumno regular matriculado.</p>
          </div>
          <div className="text-right select-none">
            <span className="text-[10px] bg-slate-100 text-slate-500 font-bold uppercase tracking-wider py-1 px-3 rounded-md block w-fit ml-auto">Promedio General</span>
            <p className="font-display text-3xl font-extrabold text-fuchsia-600 mt-2">{average}</p>
          </div>
        </div>

        <div className="bg-white rounded-[32px] p-6 border border-slate-50 shadow-md">
          <h4 className="font-display text-sm font-semibold text-slate-400 uppercase tracking-wider font-sans">Alertas de Bajo promedio</h4>
          {Number(average) < 6 ? (
            <div className="mt-3 bg-red-50 text-red-700 p-3 rounded-2xl text-xs font-semibold border border-red-100 flex items-center gap-1.5 animate-pulse">
              <AlertTriangle size={16} /> Promedio inferior a la media
            </div>
          ) : (
            <div className="mt-3 bg-emerald-50 text-emerald-700 p-3 rounded-2xl text-xs font-semibold border border-emerald-100 flex items-center gap-1.5">
              <CheckCircle size={16} /> Sin advertencias registradas
            </div>
          )}
        </div>
      </div>

      {/* Grades visual Board */}
      <div className="bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-lg select-all">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
              <th className="py-4 px-6">Materia curricular</th>
              <th className="py-4 px-6">Evaluación Tipo</th>
              <th className="py-4 px-6">Fecha Registro</th>
              <th className="py-4 px-6 text-right">Ficha de Nota</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {grades.map((gr, idx) => (
              <tr key={idx} className="hover:bg-slate-50">
                <td className="py-4.5 px-6 font-bold text-slate-800">{gr.subject}</td>
                <td className="py-4.5 px-6 font-medium text-slate-500">{gr.type}</td>
                <td className="py-4.5 px-6 font-mono text-xs text-slate-400">{gr.date}</td>
                <td className="py-4.5 px-6 text-right">
                  <span className={`inline-flex items-center justify-center font-mono font-bold py-1.5 px-4 rounded-xl text-sm ${
                    gr.grade >= 7 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                    gr.grade >= 4 ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-red-50 text-red-700 border border-red-250 animate-pulse'
                  }`}>
                    {gr.grade.toFixed(2)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// 5.4 ChildAttendancesPage - Absismo e inasistencias del alumno
function ChildAttendancesPage(props: PadreViewsProps & { selectedChild: Student; activeChildId: string; onChildSelect: (id: string) => void }) {
  const { selectedChild, activeChildId, onChildSelect, students, attendances } = props;

  const childAttendances = attendances.filter(a => a.studentId === activeChildId);
  const total = childAttendances.length;
  const absents = childAttendances.filter(a => a.estado === 'ausente').length;
  const lates = childAttendances.filter(a => a.estado === 'tarde').length;
  const presents = childAttendances.filter(a => a.estado === 'presente').length;
  const justified = childAttendances.filter(a => a.estado === 'ausente' && a.justificada).length;

  const attendanceRatio = total > 0 ? Math.round(((presents + lates + justified) / total) * 100) : 100;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-extrabold text-slate-800">Inasistencias y Faltas</h2>
        <p className="text-sm text-slate-500 mt-0.5">Supervise el ausentismo diario y justifique carpetas médicas.</p>
      </div>

      <ChildSelector students={students} activeChildId={activeChildId} onChildSelect={onChildSelect} />

      {/* Critical Absentee Warning (RN-10) */}
      {absents >= 10 && (
        <div className="bg-red-50 text-red-800 border-2 border-red-200 rounded-[32px] p-6 shadow-md flex items-start gap-4 animate-bounce">
          <ShieldAlert size={32} className="text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-display font-black text-red-900 leading-tight">⚠️ ALERTA: Límite crítico de ausencias (Regla RN-10)</h4>
            <p className="text-xs text-red-700 mt-1.5 leading-relaxed font-semibold">
              El alumno {selectedChild.nombre} registra un total de <b>{absents} ausentes</b>. De superar las 12 inasistencias perderá la condición de alumno regular y requerirá reincorporación oficial.
            </p>
          </div>
        </div>
      )}

      {/* Summary box */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 select-none">
        <div className="bg-white rounded-3xl p-5 border border-slate-50 shadow-md text-slate-700">
          <span className="text-[10px] bg-slate-100 text-slate-500 py-1 px-3 rounded-full font-bold uppercase block w-fit">Ratio Asistencia</span>
          <p className="font-display text-3xl font-extrabold text-slate-800 mt-3">{attendanceRatio}%</p>
          <p className="text-[10px] text-slate-400 mt-1 font-semibold">Porcentaje consolidado</p>
        </div>
        <div className="bg-white rounded-3xl p-5 border border-slate-50 shadow-md text-slate-700">
          <span className="text-[10px] bg-emerald-50 text-emerald-600 py-1 px-3 rounded-full font-bold uppercase block w-fit">Registros Presente</span>
          <p className="font-display text-3xl font-extrabold text-slate-800 mt-3">{presents}</p>
          <p className="text-[10px] text-slate-400 mt-1 font-semibold">Ingresos registrados</p>
        </div>
        <div className="bg-white rounded-3xl p-5 border border-slate-50 shadow-md text-slate-700">
          <span className="text-[10px] bg-rose-50 text-rose-600 py-1 px-3 rounded-full font-bold uppercase block w-fit">Inasistencias</span>
          <p className="font-display text-3xl font-extrabold text-slate-850 text-slate-800 mt-3">{absents}</p>
          <p className="text-[10px] text-slate-400 mt-1 font-semibold">{justified} debidamente certificadas</p>
        </div>
        <div className="bg-white rounded-3xl p-5 border border-slate-50 shadow-md text-slate-700">
          <span className="text-[10px] bg-amber-50 text-amber-600 py-1 px-3 rounded-full font-bold uppercase block w-fit">Llegadas Tarde</span>
          <p className="font-display text-3xl font-extrabold text-slate-800 mt-3">{lates}</p>
          <p className="text-[10px] text-slate-400 mt-1 font-semibold">Ingresos diferidos</p>
        </div>
      </div>

      {/* List Table */}
      <div className="bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-lg select-all">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
              <th className="py-4 px-6">Fecha</th>
              <th className="py-4 px-6">Registrado Tipo</th>
              <th className="py-4 px-6">Justificativo Oficial</th>
              <th className="py-4 px-6 text-right">Fórmula Comprobante</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {childAttendances.map(row => (
              <tr key={row.id} className="hover:bg-slate-50">
                <td className="py-4.5 px-6 font-bold">{row.fecha}</td>
                <td className="py-4.5 px-6">
                  <span className={`text-[10px] font-bold uppercase tracking-wide py-1 px-3 rounded-full ${
                    row.estado === 'presente' ? 'bg-emerald-50 text-emerald-600' :
                    row.estado === 'ausente' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {row.estado}
                  </span>
                </td>
                <td className="py-4.5 px-6">
                  {row.estado === 'ausente' && (
                    <span>
                      {row.justificada ? (
                        <span className="text-emerald-700 font-bold inline-flex items-center gap-1 text-xs">✓ Justificada</span>
                      ) : (
                        <span className="text-rose-500 font-bold inline-flex items-center gap-1 text-xs">✗ Pendiente regularizar</span>
                      )}
                    </span>
                  )}
                  {row.estado !== 'ausente' && <span className="text-slate-400">—</span>}
                </td>
                <td className="py-4.5 px-6 text-right">
                  {row.certificadoUrl ? (
                    <span className="text-emerald-600 font-bold font-mono text-xs">{row.certificadoUrl}</span>
                  ) : (
                    <span className="text-slate-400 text-xs font-medium">No se adjuntaron archivos</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// 5.5 ChildTasksPage - Tareas de los hijos
function ChildTasksPage(props: PadreViewsProps & { selectedChild: Student; activeChildId: string; onChildSelect: (id: string) => void }) {
  const { selectedChild, activeChildId, onChildSelect, students, tasks, submissions } = props;

  const childSubmissions = submissions.filter(s => s.studentId === activeChildId);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-extrabold text-slate-800">Seguimiento de Tareas</h2>
        <p className="text-sm text-slate-500 mt-0.5">Ficha de consignas asignadas al menor con estado de entrega.</p>
      </div>

      <ChildSelector students={students} activeChildId={activeChildId} onChildSelect={onChildSelect} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tasks.map(t => {
          const matchingSub = childSubmissions.find(s => s.taskId === t.id);
          const state = matchingSub ? matchingSub.estado : 'Pendiente';

          return (
            <div key={t.id} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-md hover:shadow-lg transition-all duration-200 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] font-bold uppercase bg-slate-100 py-1 px-3 text-slate-600 rounded-lg">
                    {t.materiaNombre}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">Vence: {t.fechaVencimiento}</span>
                </div>
                <h3 className="font-display text-lg font-bold text-slate-800">{t.titulo}</h3>
                <p className="text-xs text-slate-500 mt-2 italic line-clamp-2">"{t.descripcion}"</p>
              </div>

              <div className="mt-5 border-t border-slate-50 pt-4 flex justify-between items-center select-none">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Estado</span>
                {state === 'Pendiente' ? (
                  <span className="bg-red-50 text-red-650 text-red-700 py-1 px-3.5 rounded-full text-[10px] font-bold uppercase tracking-wide inline-flex items-center gap-1 animate-pulse">
                    <Clock size={12} /> Pendiente presentación
                  </span>
                ) : state === 'Entregada' ? (
                  <span className="bg-emerald-50 text-emerald-600 py-1 px-3.5 rounded-full text-[10px] font-bold uppercase tracking-wide inline-flex items-center gap-1">
                    <Check size={12} /> Entregado Regular
                  </span>
                ) : (
                  <span className="bg-amber-50 text-amber-600 py-1 px-3.5 rounded-full text-[10px] font-bold uppercase tracking-wide inline-flex items-center gap-1">
                    <AlertTriangle size={12} /> Entregado con demora
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// 5.6 UploadCertificatePage - Subir comprobante médico drag and drop
function UploadCertificatePage(props: PadreViewsProps & { selectedChild: Student; activeChildId: string; onChildSelect: (id: string) => void }) {
  const { selectedChild, activeChildId, onChildSelect, students, attendances, setAttendances } = props;

  const [selectedAttendanceId, setSelectedAttendanceId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [simulatedFileName, setSimulatedFileName] = useState('');

  const unexcused = attendances.filter(a => a.studentId === activeChildId && a.estado === 'ausente' && !a.justificada);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const dropped = e.dataTransfer.files[0];
      setFile(dropped);
      setSimulatedFileName(dropped.name);
    }
  };

  const selectSimulatedFile = () => {
    setSimulatedFileName('comprobante_reposo_tomas.pdf');
    setFile(new File([''], 'comprobante_reposo_tomas.pdf', { type: 'application/pdf' }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAttendanceId || !simulatedFileName) return;

    // Simulate upload by assigning certificateUrl to the attendance item but keeping justified=false (needs preceptor approval)
    setAttendances(attendances.map(a => a.id === selectedAttendanceId ? { 
      ...a, 
      certificadoUrl: simulatedFileName 
    } : a));

    setUploadSuccess(true);
    setTimeout(() => {
      setUploadSuccess(false);
      setSelectedAttendanceId('');
      setFile(null);
      setSimulatedFileName('');
    }, 2500);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h2 className="font-display text-2xl font-extrabold text-slate-800">Presentar Certificado Médico</h2>
        <p className="text-sm text-slate-500 mt-0.5 font-medium">Justifique constitucionalmente las inasistencias inasistidas del menor.</p>
      </div>

      <ChildSelector students={students} activeChildId={activeChildId} onChildSelect={onChildSelect} />

      {uploadSuccess && (
        <div className="p-4 bg-emerald-50 text-emerald-700 font-semibold border border-emerald-100 rounded-2xl text-xs flex items-center gap-2">
          <CheckCircle size={16} />
          Se ha cargado el archivo satisfactoriamente. Pendiente de justificación por Preceptoría.
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-xl space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 block uppercase ml-1">Seleccionar Inasistencia a Justificar</label>
          <select 
            value={selectedAttendanceId}
            onChange={e => setSelectedAttendanceId(e.target.value)}
            className="w-full bg-slate-50 border-0 rounded-2xl py-3.5 px-4 text-sm text-slate-600 focus:ring-2 focus:ring-fuchsia-500 outline-none cursor-pointer font-semibold"
            required
          >
            <option value="">-- Escoger de inasistencias injustificadas del alumno --</option>
            {unexcused.map(a => (
              <option key={a.id} value={a.id}>Ausencia injustificada del: {a.fecha}</option>
            ))}
          </select>
          {unexcused.length === 0 && (
            <p className="text-[10px] text-emerald-600 font-bold ml-1">
              ✓ No registra inasistencias injustificadas. No requiere subir ningún archivo.
            </p>
          )}
        </div>

        {/* Drag & Drop Module */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 block uppercase ml-1">Subir Comprobante escaneado</label>
          <div 
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={selectSimulatedFile}
            className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center flex flex-col items-center justify-center transition-all ${
              dragActive ? 'border-fuchsia-500 bg-fuchsia-50/20' : 'border-slate-200 hover:border-fuchsia-300 hover:bg-slate-50/20'
            }`}
          >
            <UploadCloud size={44} className="text-slate-400 block mb-3.5" />
            <p className="text-sm font-bold text-slate-700">Arrastre y suelte su archivo aquí</p>
            <p className="text-xs text-slate-400 mt-1">Formatos admitidos: JPG, PNG o PDF (Peso máximo: 5MB)</p>

            {simulatedFileName && (
              <div className="mt-4 p-2 bg-emerald-50 text-emerald-700 text-xs font-mono font-bold rounded-lg border border-emerald-100 max-w-xs truncate flex items-center gap-1">
                <FileText size={14} /> {simulatedFileName}
              </div>
            )}
            {!simulatedFileName && (
              <button 
                type="button"
                className="mt-4 text-xs font-bold bg-fuchsia-50 text-fuchsia-700 py-2 px-4 rounded-xl border border-fuchsia-100"
              >
                Comportamiento Simular Archivo
              </button>
            )}
          </div>
        </div>

        <button 
          type="submit"
          disabled={!selectedAttendanceId || !simulatedFileName}
          className="w-full bg-slate-950 hover:bg-slate-800 disabled:opacity-50 text-white rounded-full py-3.5 font-semibold text-sm transition-transform active:scale-95 cursor-pointer shadow-md"
        >
          Presentar Certificado Médico
        </button>
      </form>
    </div>
  );
}
