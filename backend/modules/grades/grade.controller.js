import * as GradeModel from './grade.model.js';
import models from '../../models/index.js';

export async function create(req, res, next) {
  try {
    const { estudiante_id, materia_id, nota, periodo, fecha } = req.body;

    if (!estudiante_id || !materia_id || nota === undefined || !periodo || !fecha) {
      return res.status(400).json({ message: 'Todos los campos son requeridos: estudiante_id, materia_id, nota, periodo, fecha' });
    }

    const docente = await models.Docente.findOne({ where: { usuario_id: req.user.id } });
    if (!docente) {
      return res.status(403).json({ message: 'El usuario no tiene perfil de docente' });
    }

    const result = await GradeModel.createGrade({
      estudiante_id,
      materia_id,
      docente_id: docente.id,
      nota,
      periodo,
      fecha,
    });

    return res.status(201).json({
      message: result.isCritical
        ? 'Calificación registrada. Nota crítica (<=4) — se generará alerta (RN-04)'
        : 'Calificación registrada',
      data: result.grade,
      alerta: result.isCritical ? { tipo: 'RN-04', descripcion: 'Nota igual o inferior a 4' } : null,
    });
  } catch (error) {
    if (error.message.includes('no está asignado') || error.message.includes('debe estar entre')) {
      return res.status(400).json({ message: error.message });
    }
    if (error.message === 'Docente no encontrado' || error.message.includes('no tiene perfil')) {
      return res.status(403).json({ message: error.message });
    }
    next(error);
  }
}

export async function getByStudent(req, res, next) {
  try {
    const studentId = parseInt(req.params.id, 10);
    const result = await GradeModel.getStudentGrades(studentId);
    return res.json(result);
  } catch (error) {
    if (error.message === 'Estudiante no encontrado') {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
}

export async function getStudentAverage(req, res, next) {
  try {
    const studentId = parseInt(req.params.id, 10);
    const result = await GradeModel.getStudentAverage(studentId);
    return res.json(result);
  } catch (error) {
    if (error.message === 'Estudiante no encontrado') {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
}

export async function getByCourse(req, res, next) {
  try {
    const courseId = parseInt(req.params.id, 10);
    const students = await GradeModel.getCourseGrades(courseId);
    return res.json({ curso_id: courseId, total_estudiantes: students.length, estudiantes: students });
  } catch (error) {
    next(error);
  }
}

export async function getCriticalGrades(req, res, next) {
  try {
    const grades = await GradeModel.getCriticalGrades();
    return res.json({
      message: grades.length > 0
        ? `${grades.length} calificación(es) crítica(s) encontrada(s)`
        : 'No hay calificaciones críticas',
      total: grades.length,
      data: grades,
    });
  } catch (error) {
    next(error);
  }
}

export async function getLowAverageStudents(req, res, next) {
  try {
    const threshold = parseInt(req.query.umbral, 10) || 6;
    const students = await GradeModel.getLowAverageStudents(threshold);
    return res.json({
      message: students.length > 0
        ? `${students.length} alumno(s) con promedio bajo`
        : 'No hay alumnos con promedio bajo',
      umbral: threshold,
      total: students.length,
      data: students,
    });
  } catch (error) {
    next(error);
  }
}

export async function getTeacherSubjects(req, res, next) {
  try {
    // Admin sees all subjects; docente sees only their assigned subjects
    const subjects = await GradeModel.getTeacherSubjects(req.user.id, req.user.rol);
    return res.json({ data: subjects });
  } catch (error) {
    next(error);
  }
}
