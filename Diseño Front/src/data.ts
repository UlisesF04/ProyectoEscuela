/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  User, 
  Course, 
  Subject, 
  Student, 
  TeacherAssignment, 
  ParentLink, 
  TeacherLeave, 
  NotificationLog, 
  Task, 
  Submission, 
  Attendance 
} from './types';

// Courses
export const initialCourses: Course[] = [
  { id: 'c1', nombre: '1º', division: 'A', nivel: 'Secundaria' },
  { id: 'c2', nombre: '2º', division: 'B', nivel: 'Secundaria' },
  { id: 'c3', nombre: '3º', division: 'A', nivel: 'Secundaria' },
  { id: 'c4', nombre: '4º', division: 'C', nivel: 'Secundaria' },
];

// Subjects
export const initialSubjects: Subject[] = [
  { id: 's1', nombre: 'Matemática I', courseId: 'c1' },
  { id: 's2', nombre: 'Lengua y Literatura', courseId: 'c1' },
  { id: 's3', nombre: 'Historia Mundial', courseId: 'c1' },
  { id: 's4', nombre: 'Biología General', courseId: 'c1' },
  
  { id: 's5', nombre: 'Matemática II', courseId: 'c2' },
  { id: 's6', nombre: 'Física Química', courseId: 'c2' },
  
  { id: 's7', nombre: 'Análisis Matemático', courseId: 'c3' },
  { id: 's8', nombre: 'Geografía Humana', courseId: 'c3' },
];

// Users (Admins, Preceptors, Teachers, Parents)
export const initialUsers: User[] = [
  // Admins
  { id: 'u1', email: 'admin@educonnect.com', nombre: 'EduConnect', apellido: 'Admin', rol: 'admin', telefono: '+54 11 4059-4820', is_active: true },
  { id: 'u2', email: 'pablo.perez@educonnect.com', nombre: 'Pablo', apellido: 'Perez', rol: 'admin', telefono: '+54 11 5029-9231', is_active: true },
  
  // Preceptors
  { id: 'u3', email: 'marta.gomez@school.edu', nombre: 'Marta', apellido: 'Gómez', rol: 'preceptor', telefono: '+54 9 11 3928-1122', is_active: true },
  { id: 'u4', email: 'lucas.sosa@school.edu', nombre: 'Lucas', apellido: 'Sosa', rol: 'preceptor', telefono: '+54 9 11 4422-9900', is_active: true },
  
  // Teachers (Docentes)
  { id: 'u5', email: 'mariana.lopez@school.edu', nombre: 'Mariana', apellido: 'López', rol: 'docente', telefono: '+54 9 11 5566-7788', is_active: true },
  { id: 'u6', email: 'fer.ruiz@school.edu', nombre: 'Fernando', apellido: 'Ruiz', rol: 'docente', telefono: '+54 9 11 3456-7890', is_active: true },
  { id: 'u7', email: 'silvia.martinez@school.edu', nombre: 'Silvia', apellido: 'Martínez', rol: 'docente', telefono: '+54 9 11 6020-3040', is_active: true },
  
  // Parents (Padres)
  { id: 'u8', email: 'ana.rodriguez@gmail.com', nombre: 'Ana', apellido: 'Rodríguez', rol: 'padre', telefono: '+54 9 11 8830-1049', is_active: true },
  { id: 'u9', email: 'julio.gomez@gmail.com', nombre: 'Julio', apellido: 'Gómez', rol: 'padre', telefono: '+54 9 11 7733-1122', is_active: true },
  { id: 'u10', email: 'claudia.flores@hotmail.com', nombre: 'Claudia', apellido: 'Flores', rol: 'padre', telefono: '+54 9 11 2021-3040', is_active: true },
  { id: 'u11', email: 'roberto.sanchez@gmail.com', nombre: 'Roberto', apellido: 'Sánchez', rol: 'padre', telefono: '+54 9 11 6633-5511', is_active: true },
];

// Students
export const initialStudents: Student[] = [
  { id: 'st1', nombre: 'Tomás', apellido: 'Rodríguez', dni: '44.894.202', fechaNacimiento: '2010-04-12', courseId: 'c1', is_active: true, parents: [] }, // Ana's son
  { id: 'st2', nombre: 'Sofía', apellido: 'Gómez', dni: '45.102.394', fechaNacimiento: '2011-09-05', courseId: 'c1', is_active: true, parents: [] }, // Julio's daughter
  { id: 'st3', nombre: 'Lucas', apellido: 'Flores', dni: '43.902.112', fechaNacimiento: '2010-02-18', courseId: 'c2', is_active: true, parents: [] }, // Claudia's son
  { id: 'st4', nombre: 'Milena', apellido: 'Sánchez', dni: '45.890.301', fechaNacimiento: '2011-12-01', courseId: 'c2', is_active: true, parents: [] }, // Roberto's daughter
  { id: 'st5', nombre: 'Juan Ignacio', apellido: 'Gómez', dni: '44.204.305', fechaNacimiento: '2010-08-25', courseId: 'c1', is_active: true, parents: [] }, // Julio's son
];

// Teacher Subject Assignments
export const initialAssignments: TeacherAssignment[] = [
  { id: 'as1', teacherId: 'u5', subjectId: 's1', courseId: 'c1' }, // Mariana Math 1
  { id: 'as2', teacherId: 'u5', subjectId: 's5', courseId: 'c2' }, // Mariana Math 2
  { id: 'as3', teacherId: 'u6', subjectId: 's2', courseId: 'c1' }, // Fernando Language 1
  { id: 'as4', teacherId: 'u6', subjectId: 's3', courseId: 'c1' }, // Fernando History 1
  { id: 'as5', teacherId: 'u7', subjectId: 's4', courseId: 'c1' }, // Silvia Biology 1
  { id: 'as6', teacherId: 'u7', subjectId: 's6', courseId: 'c2' }, // Silvia PhysChem
];

// Parent Student Relationships
export const initialParentLinks: ParentLink[] = [
  { id: 'pl1', parentId: 'u8', studentId: 'st1', relacion: 'Madre' },
  { id: 'pl2', parentId: 'u9', studentId: 'st2', relacion: 'Padre' },
  { id: 'pl3', parentId: 'u9', studentId: 'st5', relacion: 'Padre' },
  { id: 'pl4', parentId: 'u10', studentId: 'st3', relacion: 'Tutor' },
  { id: 'pl5', parentId: 'u11', studentId: 'st4', relacion: 'Padre' },
];

// Teacher Leaves
export const initialLeaves: TeacherLeave[] = [
  { 
    id: 'l1', 
    teacherId: 'u5', 
    teacherName: 'Mariana López', 
    tipo: 'Enfermedad', 
    fechaInicio: '2026-06-01', 
    fechaFin: '2026-06-03', 
    dias: 3, 
    status: 'pendiente', 
    notas: 'Certificado de reposo por cuadro de laringitis.', 
    fechaSolicitud: '2026-05-28' 
  },
  { 
    id: 'l2', 
    teacherId: 'u6', 
    teacherName: 'Fernando Ruiz', 
    tipo: 'Personal', 
    fechaInicio: '2026-05-10', 
    fechaFin: '2026-05-11', 
    dias: 2, 
    status: 'aprobado', 
    notas: 'Trámite notarial impostergable fuera de la provincia.', 
    fechaSolicitud: '2026-05-02' 
  },
  { 
    id: 'l3', 
    teacherId: 'u7', 
    teacherName: 'Silvia Martínez', 
    tipo: 'Gremial', 
    fechaInicio: '2026-05-15', 
    fechaFin: '2026-05-15', 
    dias: 1, 
    status: 'rechazado', 
    notas: 'Asamblea extraordinaria del sindicato docente.', 
    fechaSolicitud: '2026-05-14' 
  },
];

// Alertas / Notification Logs from python background monitoring
export const initialNotificationLogs: NotificationLog[] = [
  {
    id: 'n1',
    fecha: '2026-05-29 18:04:12',
    destinatario: 'ana.rodriguez@gmail.com',
    alumno: 'Tomás Rodríguez',
    tipo: 'Ausencias Críticas',
    canal: 'Email',
    estado: 'enviado',
    mensaje: 'ALERTA: Tomás acumuló 12 ausentes no justificados en el primer trimestre. Se requiere citación.'
  },
  {
    id: 'n2',
    fecha: '2026-05-29 18:10:01',
    destinatario: '+5491188301049',
    alumno: 'Tomás Rodríguez',
    tipo: 'Ausencias Críticas',
    canal: 'SMS',
    estado: 'enviado',
    mensaje: 'ALERTA: Alumno Tomas Rodriguez llego al limite critico de 12 inasistencias en 1er año div A.'
  },
  {
    id: 'n3',
    fecha: '2026-05-28 14:22:15',
    destinatario: 'julio.gomez@gmail.com',
    alumno: 'Sofía Gómez',
    tipo: 'Calificación Baja',
    canal: 'WhatsApp',
    estado: 'enviado',
    mensaje: 'Notificación: Sofía Gómez obtuvo una nota de 3.50 en el examen de Matemática I.'
  },
  {
    id: 'n4',
    fecha: '2026-05-27 19:30:50',
    destinatario: 'claudia.flores@hotmail.com',
    alumno: 'Lucas Flores',
    tipo: 'Falta de entrega',
    canal: 'Email',
    estado: 'fallido',
    mensaje: 'Aviso: Lucas Flores no realizó la entrega de Tarea: "Ecuaciones Diferenciales simples".',
    error: 'SMTP Gateway Timeout: Host unreachable.'
  }
];

// Tasks / Homeworks
export const initialTasks: Task[] = [
  {
    id: 't1',
    titulo: 'Ecuaciones Fraccionarias Práctica',
    descripcion: 'Resolver los ejercicios 1 al 15 de la guía interactiva, subir desarrollo escaneado.',
    materiaId: 's1',
    materiaNombre: 'Matemática I',
    cursoId: 'c1',
    cursoNombre: '1º A',
    fechaVencimiento: '2026-06-05'
  },
  {
    id: 't2',
    titulo: 'Informe sobre la Revolución de Mayo',
    descripcion: 'Redactar un ensayo crítico de 3 páginas analizando las causas económicas externas e internas.',
    materiaId: 's3',
    materiaNombre: 'Historia Mundial',
    cursoId: 'c1',
    cursoNombre: '1º A',
    fechaVencimiento: '2026-06-02'
  },
  {
    id: 't3',
    titulo: 'Maqueta de Célula Procariota',
    descripcion: 'Construir una representación tridimensional de una célula bacteriana identificando ribosomas, plásmidos y flagelos.',
    materiaId: 's4',
    materiaNombre: 'Biología General',
    cursoId: 'c1',
    cursoNombre: '1º A',
    fechaVencimiento: '2026-05-30'
  },
  {
    id: 't4',
    titulo: 'Ecuaciones de Segundo Grado',
    descripcion: 'Resolver los 10 problemas del capítulo 4 del libro de texto.',
    materiaId: 's5',
    materiaNombre: 'Matemática II',
    cursoId: 'c2',
    cursoNombre: '2º B',
    fechaVencimiento: '2026-05-25'
  }
];

// Submissions for Tasks
export const initialSubmissions: Submission[] = [
  // Task 1 submissions
  { id: 'sub1', taskId: 't1', studentId: 'st1', studentName: 'Tomás Rodríguez', estado: 'Pendiente' },
  { id: 'sub2', taskId: 't1', studentId: 'st2', studentName: 'Sofía Gómez', estado: 'Entregada', fechaEntrega: '2026-05-28', nota: 8.5 },
  { id: 'sub3', taskId: 't1', studentId: 'st5', studentName: 'Juan Ignacio Gómez', estado: 'Pendiente' },
  
  // Task 2 submissions
  { id: 'sub4', taskId: 't2', studentId: 'st1', studentName: 'Tomás Rodríguez', estado: 'Entregada', fechaEntrega: '2026-05-29', nota: 7 },
  { id: 'sub5', taskId: 't2', studentId: 'st2', studentName: 'Sofía Gómez', estado: 'Tarde', fechaEntrega: '2026-06-03', nota: 6 },
  { id: 'sub6', taskId: 't2', studentId: 'st5', studentName: 'Juan Ignacio Gómez', estado: 'Pendiente' },
  
  // Task 3 submissions
  { id: 'sub7', taskId: 't3', studentId: 'st1', studentName: 'Tomás Rodríguez', estado: 'Entregada', fechaEntrega: '2026-05-29' },
  { id: 'sub8', taskId: 't3', studentId: 'st2', studentName: 'Sofía Gómez', estado: 'Entregada', fechaEntrega: '2026-05-27', nota: 10 },
  { id: 'sub9', taskId: 't3', studentId: 'st5', studentName: 'Juan Ignacio Gómez', estado: 'Pendiente' }
];

// Attendance Record Mockup
export const initialAttendances: Attendance[] = [
  // 1º A on 2026-05-29 (Today)
  { id: 'att1', studentId: 'st1', studentName: 'Tomás Rodríguez', courseId: 'c1', fecha: '2026-05-29', estado: 'ausente', registradaPor: 'Marta Gómez', justificada: false },
  { id: 'att2', studentId: 'st2', studentName: 'Sofía Gómez', courseId: 'c1', fecha: '2026-05-29', estado: 'presente', registradaPor: 'Marta Gómez', justificada: false },
  { id: 'att3', studentId: 'st5', studentName: 'Juan Ignacio Gómez', courseId: 'c1', fecha: '2026-05-29', estado: 'tarde', registradaPor: 'Marta Gómez', justificada: false },
  
  // Previous dates for Tomas (Ana) to demonstrate high absentee alert 
  { id: 'att10', studentId: 'st1', studentName: 'Tomás Rodríguez', courseId: 'c1', fecha: '2026-05-28', estado: 'ausente', registradaPor: 'Marta Gómez', justificada: false },
  { id: 'att11', studentId: 'st1', studentName: 'Tomás Rodríguez', courseId: 'c1', fecha: '2026-05-27', estado: 'ausente', registradaPor: 'Marta Gómez', justificada: false },
  { id: 'att12', studentId: 'st1', studentName: 'Tomás Rodríguez', courseId: 'c1', fecha: '2026-05-26', estado: 'ausente', registradaPor: 'Marta Gómez', justificada: true, certificadoUrl: 'dummy-medical-certificate.pdf' },
  { id: 'att13', studentId: 'st1', studentName: 'Tomás Rodríguez', courseId: 'c1', fecha: '2026-05-22', estado: 'ausente', registradaPor: 'Marta Gómez', justificada: false },
  { id: 'att14', studentId: 'st1', studentName: 'Tomás Rodríguez', courseId: 'c1', fecha: '2026-05-21', estado: 'ausente', registradaPor: 'Santiago Díaz', justificada: false },
  { id: 'att15', studentId: 'st1', studentName: 'Tomás Rodríguez', courseId: 'c1', fecha: '2026-05-20', estado: 'ausente', registradaPor: 'Santiago Díaz', justificada: false },
  { id: 'att16', studentId: 'st1', studentName: 'Tomás Rodríguez', courseId: 'c1', fecha: '2026-05-19', estado: 'ausente', registradaPor: 'Santiago Díaz', justificada: false },
  { id: 'att17', studentId: 'st1', studentName: 'Tomás Rodríguez', courseId: 'c1', fecha: '2026-05-18', estado: 'ausente', registradaPor: 'Santiago Díaz', justificada: false },
  { id: 'att18', studentId: 'st1', studentName: 'Tomás Rodríguez', courseId: 'c1', fecha: '2026-05-15', estado: 'ausente', registradaPor: 'Marta Gómez', justificada: false },
  { id: 'att19', studentId: 'st1', studentName: 'Tomás Rodríguez', courseId: 'c1', fecha: '2026-05-14', estado: 'ausente', registradaPor: 'Marta Gómez', justificada: false },
  { id: 'att20', studentId: 'st1', studentName: 'Tomás Rodríguez', courseId: 'c1', fecha: '2026-05-13', estado: 'ausente', registradaPor: 'Marta Gómez', justificada: false },
  
  // Luces Flores (Claudia)
  { id: 'att4', studentId: 'st3', studentName: 'Lucas Flores', courseId: 'c2', fecha: '2026-05-29', estado: 'presente', registradaPor: 'Marta Gómez', justificada: false },
  { id: 'att5', studentId: 'st3', studentName: 'Lucas Flores', courseId: 'c2', fecha: '2026-05-28', estado: 'presente', registradaPor: 'Marta Gómez', justificada: false },
  
  // Previous dates for Sofia (Julio) (Excellent attendance)
  { id: 'att6', studentId: 'st2', studentName: 'Sofía Gómez', courseId: 'c1', fecha: '2026-05-28', estado: 'presente', registradaPor: 'Marta Gómez', justificada: false },
  { id: 'att7', studentId: 'st2', studentName: 'Sofía Gómez', courseId: 'c1', fecha: '2026-05-27', estado: 'presente', registradaPor: 'Marta Gómez', justificada: false },
  { id: 'att8', studentId: 'st2', studentName: 'Sofía Gómez', courseId: 'c1', fecha: '2026-05-26', estado: 'presente', registradaPor: 'Marta Gómez', justificada: false },
  { id: 'att9', studentId: 'st2', studentName: 'Sofía Gómez', courseId: 'c1', fecha: '2026-05-25', estado: 'presente', registradaPor: 'Santiago Díaz', justificada: false }
];

// Default configuration settings
export const initialConfig = {
  umbralAusenciasCriticas: 10,
  horarioNotificaciones: '18:00',
  alertasHabilitadas: {
    ausenciasCriticas: true,
    notasBajas: true,
    faltaEntregas: true
  }
};
