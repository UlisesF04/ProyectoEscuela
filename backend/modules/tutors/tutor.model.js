import models from '../../models/index.js';
import { Op } from 'sequelize';

const { Tutor, Estudiante, Curso, Inasistencia, Calificacion, Materia, Tarea, EntregaTarea } = models;

const ESTIMATED_CLASSES = 180;

export async function getTutorByUser(userId) {
  const tutor = await Tutor.findOne({
    where: { usuario_id: userId },
    include: [{
      model: Estudiante,
      include: [{ model: Curso, attributes: ['nombre', 'anio', 'division'] }],
    }],
  });
  if (!tutor) throw new Error('Tutor no encontrado');
  return tutor;
}

export async function getChildren(userId) {
  const tutor = await getTutorByUser(userId);

  const children = (tutor.Estudiantes || []).map(e => ({
    id: e.id,
    nombre: e.nombre,
    apellido: e.apellido,
    dni: e.dni,
    curso: e.Curso ? `${e.Curso.nombre} ${e.Curso.anio}${e.Curso.division}` : null,
  }));

  return {
    tutor: { id: tutor.id, nombre: tutor.nombre, apellido: tutor.apellido },
    total_hijos: children.length,
    hijos: children,
  };
}

export async function getChildSummary(userId, childId) {
  const tutor = await getTutorByUser(userId);

  // Verify this child belongs to this tutor (RN-09)
  const isMyChild = (tutor.Estudiantes || []).some(e => e.id === childId);
  if (!isMyChild) throw new Error('El estudiante no está registrado como hijo del tutor');

  const student = await Estudiante.findByPk(childId, {
    include: [{ model: Curso, attributes: ['nombre', 'anio', 'division'] }],
  });
  if (!student) throw new Error('Estudiante no encontrado');

  // ── Inasistencias ──
  const absences = await Inasistencia.findAll({
    where: { estudiante_id: childId },
    order: [['fecha', 'DESC']],
  });
  const totalAusencias = absences.length;
  const justificadas = absences.filter(a => a.justificada).length;
  const noJustificadas = totalAusencias - justificadas;
  const porcentajeAusencias = Number(((totalAusencias / ESTIMATED_CLASSES) * 100).toFixed(1));
  const riesgoRegularidad = porcentajeAusencias > 20;

  // ── Calificaciones ──
  const grades = await Calificacion.findAll({
    where: { estudiante_id: childId },
    include: [{ model: Materia, as: 'Materium', attributes: ['nombre'] }],
    order: [['fecha', 'DESC']],
  });

  // Group by subject
  const bySubject = {};
  for (const g of grades) {
    const subj = g.Materium?.nombre || 'N/A';
    if (!bySubject[subj]) bySubject[subj] = [];
    bySubject[subj].push(g.nota);
  }

  const materias = Object.entries(bySubject).map(([nombre, notas]) => ({
    materia: nombre,
    promedio: Number((notas.reduce((a, b) => a + b, 0) / notas.length).toFixed(1)),
    cantidad_notas: notas.length,
    criticas: notas.filter(n => n <= 4).length,
  }));

  const allGrades = grades.map(g => g.nota);
  const promedioGeneral = allGrades.length > 0
    ? Number((allGrades.reduce((a, b) => a + b, 0) / allGrades.length).toFixed(1))
    : null;

  // ── Tareas pendientes ──
  const pendingTasks = await Tarea.findAll({
    include: [
      { model: Materia, as: 'Materium', attributes: ['nombre'] },
      {
        model: EntregaTarea,
        where: { estudiante_id: childId, entregada: false },
        required: false,
      },
    ],
    order: [['fecha_entrega', 'ASC']],
  });

  const tareasPendientes = pendingTasks
    .filter(t => t.EntregaTareas?.[0]?.entregada === false || !t.EntregaTareas?.length)
    .map(t => ({
      id: t.id,
      nombre: t.nombre,
      materia: t.Materium?.nombre || 'N/A',
      fecha_asignacion: t.fecha_asignacion,
      fecha_entrega: t.fecha_entrega,
      entregada: t.EntregaTareas?.[0]?.entregada || false,
    }));

  return {
    estudiante: {
      id: student.id,
      nombre: student.nombre,
      apellido: student.apellido,
      dni: student.dni,
      curso: student.Curso ? `${student.Curso.nombre} ${student.Curso.anio}${student.Curso.division}` : null,
    },
    inasistencias: {
      total: totalAusencias,
      justificadas,
      no_justificadas: noJustificadas,
      porcentaje: porcentajeAusencias,
      riesgo_regularidad: riesgoRegularidad,
    },
    calificaciones: {
      promedio_general: promedioGeneral,
      riesgo_academico: promedioGeneral !== null && promedioGeneral < 6,
      materias,
    },
    tareas_pendientes: {
      total: tareasPendientes.length,
      lista: tareasPendientes,
    },
  };
}
