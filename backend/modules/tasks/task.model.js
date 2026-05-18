import models from '../../models/index.js';
import { Op } from 'sequelize';

const { Tarea, EntregaTarea, Materia, Curso, Docente, Estudiante, DocenteMateria } = models;

export async function createTask({ docente_id, materia_id, nombre, descripcion, fecha_asignacion, fecha_entrega }) {
  // Verify teacher is assigned to this subject
  const assignment = await DocenteMateria.findOne({
    where: { docente_id, materia_id },
  });
  if (!assignment) {
    throw new Error('El docente no está asignado a esta materia');
  }

  const task = await Tarea.create({
    docente_id, materia_id, nombre,
    descripcion: descripcion || null,
    fecha_asignacion, fecha_entrega,
  });

  return task;
}

export async function getTasks(filters = {}) {
  const where = {};
  if (filters.materia_id) where.materia_id = filters.materia_id;
  if (filters.docente_id) where.docente_id = filters.docente_id;

  const tasks = await Tarea.findAll({
    where,
    include: [
      { model: Materia, as: 'Materium', attributes: ['nombre'] },
      { model: Docente, attributes: ['nombre', 'apellido'] },
    ],
    order: [['fecha_asignacion', 'DESC']],
  });

  return tasks.map(t => ({
    id: t.id,
    nombre: t.nombre,
    descripcion: t.descripcion,
    materia: t.Materium?.nombre || 'N/A',
    docente: t.Docente ? `${t.Docente.nombre} ${t.Docente.apellido}` : 'N/A',
    fecha_asignacion: t.fecha_asignacion,
    fecha_entrega: t.fecha_entrega,
    created_at: t.createdAt,
  }));
}

export async function getTaskById(taskId) {
  const task = await Tarea.findByPk(taskId, {
    include: [
      { model: Materia, as: 'Materium', attributes: ['nombre'] },
      { model: Docente, attributes: ['nombre', 'apellido'] },
      { model: EntregaTarea, include: [{ model: Estudiante, attributes: ['nombre', 'apellido', 'dni'] }] },
    ],
  });
  if (!task) throw new Error('Tarea no encontrada');

  return {
    id: task.id,
    nombre: task.nombre,
    descripcion: task.descripcion,
    materia: task.Materium?.nombre || 'N/A',
    docente: task.Docente ? `${task.Docente.nombre} ${task.Docente.apellido}` : 'N/A',
    fecha_asignacion: task.fecha_asignacion,
    fecha_entrega: task.fecha_entrega,
    entregas: (task.EntregaTareas || []).map(e => ({
      id: e.id,
      estudiante: e.Estudiante ? `${e.Estudiante.nombre} ${e.Estudiante.apellido}` : null,
      entregada: e.entregada,
      fecha_entrega_real: e.fecha_entrega_real,
    })),
  };
}

export async function updateTask(taskId, data) {
  const task = await Tarea.findByPk(taskId);
  if (!task) throw new Error('Tarea no encontrada');

  const allowed = ['nombre', 'descripcion', 'fecha_asignacion', 'fecha_entrega'];
  for (const field of allowed) {
    if (data[field] !== undefined) task[field] = data[field];
  }

  await task.save();
  return task;
}

export async function deleteTask(taskId) {
  const task = await Tarea.findByPk(taskId);
  if (!task) throw new Error('Tarea no encontrada');

  // Delete associated submissions first
  await EntregaTarea.destroy({ where: { tarea_id: taskId } });
  await task.destroy();
  return true;
}
