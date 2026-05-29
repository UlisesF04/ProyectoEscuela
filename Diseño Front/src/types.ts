/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  rol: 'admin' | 'preceptor' | 'docente' | 'padre';
  telefono?: string;
  is_active: boolean;
}

export interface Course {
  id: string;
  nombre: string; // e.g. "1º"
  division: string; // e.g. "A"
  nivel: 'Primaria' | 'Secundaria' | 'Terciario';
}

export interface Subject {
  id: string;
  nombre: string; // e.g. "Matemática"
  courseId: string;
}

export interface Student {
  id: string;
  nombre: string;
  apellido: string;
  dni: string;
  fechaNacimiento: string;
  courseId: string;
  is_active: boolean;
  parents?: User[];
}

export interface TeacherAssignment {
  id: string; // assignment id
  teacherId: string;
  subjectId: string;
  courseId: string;
}

export interface ParentLink {
  id: string;
  parentId: string;
  studentId: string;
  relacion: 'Padre' | 'Madre' | 'Tutor';
}

export interface TeacherLeave {
  id: string;
  teacherId: string;
  teacherName: string;
  tipo: 'Enfermedad' | 'Personal' | 'Gremial';
  fechaInicio: string;
  fechaFin: string;
  dias: number;
  status: 'pendiente' | 'aprobado' | 'rechazado';
  notas?: string;
  fechaSolicitud: string;
}

export interface NotificationLog {
  id: string;
  fecha: string;
  destinatario: string;
  alumno: string;
  tipo: 'Ausencias Críticas' | 'Calificación Baja' | 'Falta de entrega' | 'Boletín mensual';
  canal: 'SMS' | 'Email' | 'WhatsApp';
  estado: 'enviado' | 'fallido';
  mensaje: string;
  error?: string;
}

export interface Task {
  id: string;
  titulo: string;
  descripcion: string;
  materiaId: string;
  materiaNombre: string;
  cursoId: string;
  cursoNombre: string;
  fechaVencimiento: string;
}

export interface Submission {
  id: string;
  taskId: string;
  studentId: string;
  studentName: string;
  estado: 'Pendiente' | 'Entregada' | 'Tarde';
  fechaEntrega?: string;
  nota?: number;
}

export interface Attendance {
  id: string;
  studentId: string;
  studentName: string;
  courseId: string;
  fecha: string; // YYYY-MM-DD
  estado: 'presente' | 'ausente' | 'tarde';
  registradaPor: string; // preceptor's name
  justificada: boolean;
  certificadoUrl?: string; // dummy url or base64 file representation
}
