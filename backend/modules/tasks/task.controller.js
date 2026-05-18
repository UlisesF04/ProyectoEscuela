import models from '../../models/index.js';
import * as TaskModel from './task.model.js';
import * as StudentTaskModel from './student_task.model.js';

// ── Task CRUD ──

export async function create(req, res, next) {
  try {
    const { materia_id, nombre, descripcion, fecha_asignacion, fecha_entrega } = req.body;
    if (!materia_id || !nombre || !fecha_asignacion || !fecha_entrega) {
      return res.status(400).json({ message: 'Campos requeridos: materia_id, nombre, fecha_asignacion, fecha_entrega' });
    }

    const docente = await models.Docente.findOne({
      where: { usuario_id: req.user.id },
    });
    if (!docente) {
      return res.status(403).json({ message: 'El usuario no tiene perfil de docente' });
    }

    const task = await TaskModel.createTask({
      docente_id: docente.id, materia_id, nombre, descripcion,
      fecha_asignacion, fecha_entrega,
    });

    return res.status(201).json({ message: 'Tarea creada', data: task });
  } catch (error) {
    if (error.message.includes('no está asignado')) {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
}

export async function list(req, res, next) {
  try {
    const filters = {};
    if (req.query.materia_id) filters.materia_id = parseInt(req.query.materia_id, 10);
    if (req.query.docente_id) filters.docente_id = parseInt(req.query.docente_id, 10);

    const tasks = await TaskModel.getTasks(filters);
    return res.json({ total: tasks.length, data: tasks });
  } catch (error) {
    next(error);
  }
}

export async function getById(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    const task = await TaskModel.getTaskById(id);
    return res.json(task);
  } catch (error) {
    if (error.message === 'Tarea no encontrada') {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
}

export async function update(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    const task = await TaskModel.updateTask(id, req.body);
    return res.json({ message: 'Tarea actualizada', data: task });
  } catch (error) {
    if (error.message === 'Tarea no encontrada') {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
}

export async function remove(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    await TaskModel.deleteTask(id);
    return res.json({ message: 'Tarea eliminada' });
  } catch (error) {
    if (error.message === 'Tarea no encontrada') {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
}

// ── Student Submissions ──

export async function getSubmissions(req, res, next) {
  try {
    const taskId = parseInt(req.params.id, 10);
    const result = await StudentTaskModel.getTaskSubmissions(taskId);
    return res.json(result);
  } catch (error) {
    if (error.message === 'Tarea no encontrada' || error.message === 'Materia no encontrada') {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
}

export async function updateSubmission(req, res, next) {
  try {
    const taskId = parseInt(req.params.id, 10);
    const estudianteId = parseInt(req.params.estudianteId, 10);
    const { entregada } = req.body;

    if (entregada === undefined) {
      return res.status(400).json({ message: 'Campo requerido: entregada (boolean)' });
    }

    const result = await StudentTaskModel.updateSubmission(taskId, estudianteId, entregada);
    return res.json({
      message: result.created ? 'Entrega registrada' : 'Entrega actualizada',
      data: result,
    });
  } catch (error) {
    if (error.message.includes('no encontrada') || error.message.includes('no encontrado')) {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
}

export async function getStudentTasks(req, res, next) {
  try {
    const studentId = parseInt(req.params.id, 10);
    const result = await StudentTaskModel.getStudentTasks(studentId);
    return res.json(result);
  } catch (error) {
    if (error.message === 'Estudiante no encontrado') {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
}

export async function getConsecutiveMissed(req, res, next) {
  try {
    const studentId = parseInt(req.params.id, 10);
    const result = await StudentTaskModel.getConsecutiveMissed(studentId);
    return res.json(result);
  } catch (error) {
    if (error.message === 'Estudiante no encontrado') {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
}
