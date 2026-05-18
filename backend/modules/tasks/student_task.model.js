import models from '../../models/index.js';
import { Op } from 'sequelize';

const { Tarea, EntregaTarea, Materia, Curso, Estudiante, Docente, DocenteMateria } = models;

export async function getStudentTasks(studentId) {
  const student = await Estudiante.findByPk(studentId, {
    include: [{ model: Curso, attributes: ['nombre', 'anio', 'division'] }],
  });
  if (!student) throw new Error('Estudiante no encontrado');

  const tareas = await Tarea.findAll({
    include: [
      { model: Materia, as: 'Materium', attributes: ['id', 'nombre'] },
      { model: EntregaTarea, where: { estudiante_id: studentId }, required: false },
    ],
    order: [['fecha_asignacion', 'DESC']],
  });

  const total = tareas.length;
  const entregadas = tareas.filter(t => t.EntregaTareas?.[0]?.entregada).length;
  const pendientes = total - entregadas;

  return {
    student: {
      id: student.id,
      nombre: student.nombre,
      apellido: student.apellido,
      curso: student.Curso ? `${student.Curso.nombre} ${student.Curso.anio}${student.Curso.division}` : null,
    },
    summary: { total, entregadas, pendientes },
    tareas: tareas.map(t => ({
      id: t.id,
      nombre: t.nombre,
      materia: t.Materium?.nombre || 'N/A',
      fecha_asignacion: t.fecha_asignacion,
      fecha_entrega: t.fecha_entrega,
      entregada: t.EntregaTareas?.[0]?.entregada || false,
      fecha_entrega_real: t.EntregaTareas?.[0]?.fecha_entrega_real || null,
    })),
  };
}

export async function updateSubmission(taskId, estudianteId, entregada) {
  const task = await Tarea.findByPk(taskId);
  if (!task) throw new Error('Tarea no encontrada');

  const student = await Estudiante.findByPk(estudianteId);
  if (!student) throw new Error('Estudiante no encontrado');

  const [submission, created] = await EntregaTarea.findOrCreate({
    where: { tarea_id: taskId, estudiante_id: estudianteId },
    defaults: { tarea_id: taskId, estudiante_id: estudianteId, entregada },
  });

  if (!created) {
    submission.entregada = entregada;
    if (entregada) submission.fecha_entrega_real = new Date();
    await submission.save();
  }

  return { ...submission.toJSON(), created };
}

export async function getTaskSubmissions(taskId) {
  const task = await Tarea.findByPk(taskId, {
    include: [{ model: Materia, as: 'Materium', attributes: ['nombre'] }],
  });
  if (!task) throw new Error('Tarea no encontrada');

  // Get all students enrolled in the subject's course
  const materia = await Materia.findByPk(task.materia_id);
  if (!materia) throw new Error('Materia no encontrada');

  const students = await Estudiante.findAll({
    where: { curso_id: materia.curso_id },
    include: [{
      model: EntregaTarea,
      where: { tarea_id: taskId },
      required: false,
    }],
    order: [['apellido', 'ASC']],
  });

  return {
    tarea: task.nombre,
    materia: task.Materium?.nombre || 'N/A',
    estudiantes: students.map(s => ({
      id: s.id,
      nombre: s.nombre,
      apellido: s.apellido,
      entregada: s.EntregaTareas?.[0]?.entregada || false,
      fecha_entrega_real: s.EntregaTareas?.[0]?.fecha_entrega_real || null,
    })),
  };
}

// RN-06: Detect 2+ consecutive tasks not submitted in the same subject
export async function getConsecutiveMissed(studentId) {
  const student = await Estudiante.findByPk(studentId);
  if (!student) throw new Error('Estudiante no encontrado');

  // Get all tasks ordered by materia + fecha_asignacion
  const tasks = await Tarea.findAll({
    include: [
      { model: Materia, as: 'Materium', attributes: ['id', 'nombre'] },
      {
        model: EntregaTarea,
        where: { estudiante_id: studentId },
        required: false,
      },
    ],
    order: [['materia_id', 'ASC'], ['fecha_asignacion', 'ASC']],
  });

  // Group by subject and detect consecutive missed
  const bySubject = {};
  for (const t of tasks) {
    const matId = t.materia_id;
    if (!bySubject[matId]) {
      bySubject[matId] = {
        materia: t.Materium?.nombre || 'N/A',
        tareas: [],
      };
    }
    bySubject[matId].tareas.push({
      id: t.id,
      nombre: t.nombre,
      fecha_asignacion: t.fecha_asignacion,
      fecha_entrega: t.fecha_entrega,
      entregada: t.EntregaTareas?.[0]?.entregada || false,
    });
  }

  const alerts = [];
  for (const [, group] of Object.entries(bySubject)) {
    let consecutiveMissed = 0;
    const missedTasks = [];
    for (const tarea of group.tareas) {
      if (!tarea.entregada) {
        consecutiveMissed++;
        missedTasks.push(tarea);
        if (consecutiveMissed >= 2) {
          alerts.push({
            materia: group.materia,
            tipo: 'RN-06',
            descripcion: `${consecutiveMissed} tareas consecutivas no entregadas en ${group.materia}`,
            tareas: missedTasks.slice(-consecutiveMissed).map(t => t.nombre),
            total_consecutivas: consecutiveMissed,
          });
        }
      } else {
        consecutiveMissed = 0;
        missedTasks.length = 0;
      }
    }
  }

  return {
    student: { id: student.id, nombre: student.nombre, apellido: student.apellido },
    alerts: alerts.length > 0 ? alerts : null,
    total_alertas: alerts.length,
  };
}
