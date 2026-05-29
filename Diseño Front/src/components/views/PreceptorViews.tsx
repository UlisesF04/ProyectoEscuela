/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Course, Student, Attendance } from '../../types';
import { 
  Check, X, Clock, Search, Filter, Calendar, CheckSquare, List, Award, FileText, CheckCircle, ShieldAlert, AlertTriangle 
} from 'lucide-react';

interface PreceptorViewsProps {
  currentView: string;
  courses: Course[];
  students: Student[];
  attendances: Attendance[];
  setAttendances: React.Dispatch<React.SetStateAction<Attendance[]>>;
}

export default function PreceptorViews(props: PreceptorViewsProps) {
  const { currentView } = props;

  switch (currentView) {
    case 'register':
      return <AttendanceRegisterPage {...props} />;
    case 'history':
      return <AttendanceHistoryPage {...props} />;
    case 'justify':
      return <PendingCertificatesPage {...props} />;
    default:
      return <AttendanceRegisterPage {...props} />;
  }
}

// 3.2 AttendanceRegisterPage - Registro diario
function AttendanceRegisterPage({ courses, students, attendances, setAttendances }: PreceptorViewsProps) {
  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id || '');
  const [selectedDate, setSelectedDate] = useState('2026-05-29'); // default today
  const [saveSuccess, setSaveSuccess] = useState(false);

  const courseStudents = students.filter(s => s.courseId === selectedCourseId && s.is_active);

  // Get status of student on selected date, fallback to 'presente' if not registered
  const getStudentStatus = (studentId: string) => {
    const record = attendances.find(a => a.studentId === studentId && a.fecha === selectedDate);
    return record ? record.estado : 'presente';
  };

  const handleStatusChange = (studentId: string, studentName: string, state: 'presente' | 'ausente' | 'tarde') => {
    const existingIndex = attendances.findIndex(a => a.studentId === studentId && a.fecha === selectedDate);
    
    if (existingIndex > -1) {
      // Modify
      const updated = [...attendances];
      updated[existingIndex] = {
        ...updated[existingIndex],
        estado: state,
        registradaPor: 'Marta Gómez (Preceptora)'
      };
      setAttendances(updated);
    } else {
      // Create new
      const newRecord: Attendance = {
        id: 'att_' + Date.now() + '_' + studentId,
        studentId,
        studentName,
        courseId: selectedCourseId,
        fecha: selectedDate,
        estado: state,
        registradaPor: 'Marta Gómez (Preceptora)',
        justificada: false
      };
      setAttendances([...attendances, newRecord]);
    }
  };

  const saveAll = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-extrabold text-slate-800">Toma de Asistencia Diaria</h2>
        <p className="text-sm text-slate-500 mt-0.5">Registre de manera presencial o remota el ingreso del alumnado.</p>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 text-emerald-700 font-semibold border border-emerald-100 rounded-2xl text-xs flex items-center gap-2">
          <CheckCircle size={16} />
          Se ha guardado el registro de asistencia correspondiente.
        </div>
      )}

      {/* Selector ribbon */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <label className="text-xs font-bold text-slate-400 block mb-1.5 uppercase ml-1">Filtro Curso Sección</label>
          <select 
            value={selectedCourseId}
            onChange={e => setSelectedCourseId(e.target.value)}
            className="w-full bg-slate-50 border-0 rounded-2xl py-3 px-4 text-sm text-slate-600 focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer font-semibold"
          >
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.nombre} div "{c.division}" ({c.nivel})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-400 block mb-1.5 uppercase ml-1">Fecha Curricular de Toma</label>
          <div className="relative">
            <Calendar size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input 
              type="date" 
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="w-full bg-slate-50 border-0 rounded-2xl py-3 pl-11 pr-4 text-xs text-slate-600 focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer font-semibold font-sans"
            />
          </div>
        </div>

        <div className="flex items-end">
          <button 
            onClick={saveAll}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-full py-3 text-sm font-semibold shadow-md active:translate-y-0 transition-transform active:scale-95 cursor-pointer"
          >
            Guardar Planilla Asistencia
          </button>
        </div>
      </div>

      {/* Student register lists */}
      <div className="bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-lg">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
              <th className="py-4 px-6">Alumno matriculado</th>
              <th className="py-4 px-6 text-center">Registro de Estado (Toggles táctiles)</th>
              <th className="py-4 px-6 text-right">Información de Auditoría</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
            {courseStudents.map(student => {
              const currentStatus = getStudentStatus(student.id);
              return (
                <tr key={student.id} className="hover:bg-slate-50/50">
                  <td className="py-4.5 px-6 font-bold">{student.apellido}, {student.nombre}</td>
                  <td className="py-4.5 px-6 text-center">
                    <div className="inline-flex p-1 bg-slate-50 rounded-full border border-slate-100 gap-1 select-none">
                      <button 
                        onClick={() => handleStatusChange(student.id, `${student.nombre} ${student.apellido}`, 'presente')}
                        className={`py-2 px-5 rounded-full text-xs font-bold cursor-pointer transition-colors flex items-center gap-1 ${currentStatus === 'presente' ? 'bg-emerald-500 text-white shadow-sm' : 'hover:bg-slate-200 text-slate-400'}`}
                      >
                        <Check size={14} /> Presente
                      </button>
                      <button 
                        onClick={() => handleStatusChange(student.id, `${student.nombre} ${student.apellido}`, 'ausente')}
                        className={`py-2 px-5 rounded-full text-xs font-bold cursor-pointer transition-colors flex items-center gap-1 ${currentStatus === 'ausente' ? 'bg-rose-500 text-white shadow-sm' : 'hover:bg-slate-200 text-slate-400'}`}
                      >
                        <X size={14} /> Ausente
                      </button>
                      <button 
                        onClick={() => handleStatusChange(student.id, `${student.nombre} ${student.apellido}`, 'tarde')}
                        className={`py-2 px-5 rounded-full text-xs font-bold cursor-pointer transition-colors flex items-center gap-1 ${currentStatus === 'tarde' ? 'bg-amber-500 text-white shadow-sm' : 'hover:bg-slate-200 text-slate-400'}`}
                      >
                        <Clock size={14} /> Tarde
                      </button>
                    </div>
                  </td>
                  <td className="py-4.5 px-6 text-right font-mono text-[10px] text-slate-400 italic">
                    {attendances.find(a => a.studentId === student.id && a.fecha === selectedDate)?.registradaPor || 'No registrado aún'}
                  </td>
                </tr>
              );
            })}
            {courseStudents.length === 0 && (
              <tr>
                <td colSpan={3} className="py-12 text-center text-slate-400 italic">
                  No hay alumnos inscriptos en este curso sección.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// 3.3 AttendanceHistoryPage - Historial de inasistencias
function AttendanceHistoryPage({ students, attendances }: PreceptorViewsProps) {
  const [selectedStudentId, setSelectedStudentId] = useState('');
  
  const student = students.find(s => s.id === selectedStudentId);
  const studentAttendances = attendances.filter(a => a.studentId === selectedStudentId);

  // Calc statistics
  const totRecords = studentAttendances.length;
  const totPresents = studentAttendances.filter(a => a.estado === 'presente').length;
  const totLate = studentAttendances.filter(a => a.estado === 'tarde').length;
  const totAbsents = studentAttendances.filter(a => a.estado === 'ausente').length;
  const totJustified = studentAttendances.filter(a => a.estado === 'ausente' && a.justificada).length;
  const attendanceRatio = totRecords > 0 ? Math.round(((totPresents + totLate + totJustified) / totRecords) * 100) : 100;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-extrabold text-slate-800">Historial de Inasistencias</h2>
        <p className="text-sm text-slate-500 mt-0.5">Consulte el desglose de faltas y el porcentaje oficial de asistencia.</p>
      </div>

      {/* Student dropdown picker */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
        <label className="text-xs font-bold text-slate-400 block mb-1.5 uppercase ml-1">Elegir alumno matriculado</label>
        <select 
          value={selectedStudentId}
          onChange={e => setSelectedStudentId(e.target.value)}
          className="w-full max-w-md bg-slate-50 border-0 rounded-2xl py-3 px-4 text-sm text-slate-600 focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer font-semibold font-sans"
        >
          <option value="">-- Seleccionar Alumno --</option>
          {students.map(s => (
            <option key={s.id} value={s.id}>{s.apellido}, {s.nombre} (DNI: {s.dni})</option>
          ))}
        </select>
      </div>

      {selectedStudentId && student ? (
        <div className="space-y-6">
          {/* Statistics boxes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-3xl p-5 border border-slate-50 shadow-md">
              <span className="text-[10px] bg-slate-100 text-slate-450 text-slate-500 py-1 px-2.5 rounded-full font-bold uppercase block w-fit">Asistencia Global</span>
              <p className="font-display text-4xl font-extrabold text-slate-800 mt-3">{attendanceRatio}%</p>
              <p className="text-[10px] text-slate-400 mt-1 font-semibold">{attendanceRatio < 80 ? '⚠️ Alumna debajo del 80% mínimo' : '✅ Porcentaje saludable'}</p>
            </div>
            <div className="bg-white rounded-3xl p-5 border border-slate-50 shadow-md">
              <span className="text-[10px] bg-emerald-50 text-emerald-600 py-1 px-2.5 rounded-full font-bold uppercase block w-fit">Días Presente</span>
              <p className="font-display text-4xl font-extrabold text-slate-800 mt-3">{totPresents}</p>
              <p className="text-[10px] text-slate-400 mt-1 font-semibold">De un total de {totRecords} registros</p>
            </div>
            <div className="bg-white rounded-3xl p-5 border border-slate-50 shadow-md">
              <span className="text-[10px] bg-rose-50 text-rose-600 py-1 px-2.5 rounded-full font-bold uppercase block w-fit">Inasistencias</span>
              <p className="font-display text-4xl font-extrabold text-slate-800 mt-3">{totAbsents}</p>
              <p className="text-[10px] text-slate-400 mt-1 font-semibold">{totJustified} justificadas por certificado médico</p>
            </div>
            <div className="bg-white rounded-3xl p-5 border border-slate-50 shadow-md">
              <span className="text-[10px] bg-amber-50 text-amber-600 py-1 px-2.5 rounded-full font-bold uppercase block w-fit">Llegadas Tarde</span>
              <p className="font-display text-4xl font-extrabold text-slate-800 mt-3">{totLate}</p>
              <p className="text-[10px] text-slate-400 mt-1 font-semibold">Toma de ingreso diferido</p>
            </div>
          </div>

          {/* Records Table */}
          <div className="bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-lg">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">Fecha</th>
                    <th className="py-4 px-6">Estado tomado</th>
                    <th className="py-4 px-6">¿Inasistencia Justificada?</th>
                    <th className="py-4 px-6 text-right">Archivos adjuntos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {studentAttendances.map(record => (
                  <tr key={record.id} className="hover:bg-slate-50">
                    <td className="py-4.5 px-6 font-bold">{record.fecha}</td>
                    <td className="py-4.5 px-6">
                      <span className={`text-[10px] font-bold uppercase py-1 px-3 rounded-full ${
                        record.estado === 'presente' ? 'bg-emerald-50 text-emerald-600' :
                        record.estado === 'ausente' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {record.estado}
                      </span>
                    </td>
                    <td className="py-4.5 px-6">
                      {record.estado === 'ausente' && (
                        <span>
                          {record.justificada ? (
                            <span className="text-emerald-600 font-bold text-xs inline-flex items-center gap-1">✓ Faltas justificadas</span>
                          ) : (
                            <span className="text-rose-500 font-bold text-xs inline-flex items-center gap-1">✗ Faltas sin justificar</span>
                          )}
                        </span>
                      )}
                      {record.estado !== 'ausente' && <span className="text-slate-400">—</span>}
                    </td>
                    <td className="py-4.5 px-6 text-right font-mono text-xs">
                      {record.certificadoUrl ? (
                        <a href="#cert" className="text-emerald-600 hover:underline font-bold inline-flex items-center gap-1">
                          <FileText size={14} /> ver_certificado.pdf
                        </a>
                      ) : (
                        <span className="text-slate-400">Sin archivo adjunto</span>
                      )}
                    </td>
                  </tr>
                ))}
                {studentAttendances.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-400 italic">
                      No hay registros tomados en este período para el estudiante seleccionado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-[32px] border border-slate-100 text-slate-400">
          Por favor seleccione un alumno de arriba para ver el gráfico acumulativo y la tabla analítica.
        </div>
      )}
    </div>
  );
}

// 3.4 PendingCertificatesPage - Justificación de inasistencias por certificados
function PendingCertificatesPage({ attendances, setAttendances }: PreceptorViewsProps) {
  const [showConfirmId, setShowConfirmId] = useState<string | null>(null);

  const pendingList = attendances.filter(a => a.estado === 'ausente' && !a.justificada && a.certificadoUrl);
  const justifiedList = attendances.filter(a => a.estado === 'ausente' && a.justificada);

  const confirmJustification = (id: string) => {
    setAttendances(attendances.map(a => a.id === id ? { ...a, justificada: true } : a));
    setShowConfirmId(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-extrabold text-slate-800">Certificados Pendientes (Justificar)</h2>
        <p className="text-sm text-slate-500 mt-0.5">Revisión de comprobantes adjuntos por familiares del menor para justificar inasistencias.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left pending list */}
        <div className="bg-white rounded-[32px] border border-slate-100 p-6 shadow-md lg:col-span-2 space-y-4">
          <h3 className="font-display text-lg font-bold text-slate-800">Revisión de Certificados Médicos</h3>
          <div className="space-y-4">
            {pendingList.map(item => (
              <div key={item.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                  <h4 className="font-bold text-slate-800 text-base">{item.studentName}</h4>
                  <p className="text-xs text-rose-500 font-bold mt-1 inline-flex items-center gap-1">
                    Inasistencia registrada el día: {item.fecha}
                  </p>
                  <p className="text-xs text-slate-400 mt-2 font-mono flex items-center gap-1 select-all">
                    📄 Documento: <span className="text-emerald-600 hover:underline cursor-pointer font-bold inline-flex items-center gap-0.5">{item.certificadoUrl}</span>
                  </p>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => setShowConfirmId(item.id)}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full py-2.5 px-5 text-xs font-bold transition-transform active:scale-95 cursor-pointer shadow-sm flex items-center gap-1"
                  >
                    <Check size={14} className="stroke-[3]" /> Justificar Falta
                  </button>
                </div>
              </div>
            ))}
            {pendingList.length === 0 && (
              <div className="text-center py-12 text-slate-400 font-mono text-xs">
                Totalmente al día. No hay certificados pendientes de revisión o aprobación.
              </div>
            )}
          </div>
        </div>

        {/* Right justified list */}
        <div className="bg-white rounded-[32px] border border-slate-100 p-6 shadow-md">
          <h3 className="font-display text-lg font-bold text-slate-800 mb-4">Justificadas Recientes</h3>
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {justifiedList.map(item => (
              <div key={item.id} className="p-4 bg-emerald-500/5 border border-emerald-100 rounded-2xl">
                <h4 className="font-bold text-slate-800 text-xs">{item.studentName}</h4>
                <p className="text-[10px] text-emerald-600 font-bold mt-0.5">Fecha de Falta: {item.fecha}</p>
                <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-2">
                  <CheckCircle size={12} className="text-emerald-500" />
                  <span>Justificada exitosa</span>
                </div>
              </div>
            ))}
            {justifiedList.length === 0 && (
              <div className="text-center py-12 text-slate-400 text-xs italic">
                Aun no se registran inasistencias justificadas.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Irreversible pop warning modal as specified in RN-07 */}
      {showConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] p-8 w-full max-w-sm shadow-2xl border border-rose-100 relative">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
              <AlertTriangle size={24} />
            </div>
            <h3 className="font-display text-xl font-bold text-slate-800">¿Justificar inasistencia?</h3>
            <p className="text-slate-500 text-xs mt-2 leading-relaxed">
              De conformidad con las normativas (<b>Regla RN-07</b>), esta acción modificará la situación del menor y es de carácter <b>irreversible</b>.
            </p>

            <div className="flex gap-2 mt-6">
              <button 
                onClick={() => confirmJustification(showConfirmId)}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white rounded-full py-3 text-xs font-bold transition-transform active:scale-95 cursor-pointer"
              >
                Sí, Justificar Falta
              </button>
              <button 
                onClick={() => setShowConfirmId(null)}
                className="flex-1 border-2 border-slate-200 hover:bg-slate-50 text-slate-600 rounded-full py-3 text-xs font-semibold cursor-pointer"
              >
                No, Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
