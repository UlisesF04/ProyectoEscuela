import * as AbsenceModel from './absence.model.js';

export async function register(req, res, next) {
  try {
    const { estudiante_ids, fecha, curso_id } = req.body;
    if (!estudiante_ids || !Array.isArray(estudiante_ids) || estudiante_ids.length === 0) {
      return res.status(400).json({ message: 'estudiante_ids debe ser un array no vacío' });
    }
    if (!fecha) {
      return res.status(400).json({ message: 'fecha es requerida' });
    }

    const result = await AbsenceModel.registerAbsences({
      estudiante_ids,
      fecha,
      registrado_por: req.user.id,
      curso_id,
    });

    return res.status(201).json({
      message: 'Inasistencias registradas',
      registradas: result.created.length,
      omitidas: result.skipped.length,
      data: result,
    });
  } catch (error) {
    if (error.message.startsWith('Solo se pueden') || error.message.startsWith('No se pueden')) {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
}

export async function getByStudent(req, res, next) {
  try {
    const studentId = parseInt(req.params.id, 10);
    const result = await AbsenceModel.getAbsencesByStudent(studentId);
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
    const { fecha } = req.query;
    const students = await AbsenceModel.getAbsencesByCourse(courseId, fecha);
    return res.json({ curso_id: courseId, fecha: fecha || new Date().toISOString().split('T')[0], estudiantes: students });
  } catch (error) {
    next(error);
  }
}

export async function update(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    const { fecha, justificada } = req.body;

    const absence = await AbsenceModel.updateAbsence(id, { fecha, justificada }, req.user.id);
    return res.json({ message: 'Inasistencia actualizada', data: absence });
  } catch (error) {
    if (error.message === 'Inasistencia no encontrada') {
      return res.status(404).json({ message: error.message });
    }
    if (error.message.startsWith('Solo se pueden')) {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
}

export async function markJustified(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    const { certificado_id } = req.body;

    const absence = await AbsenceModel.markAsJustified(id, certificado_id, req.user.id);
    return res.json({ message: 'Inasistencia marcada como justificada', data: absence });
  } catch (error) {
    if (error.message === 'Inasistencia no encontrada') {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
}

export async function getRiskReport(req, res, next) {
  try {
    const threshold = parseInt(req.query.umbral, 10) || 20;
    const students = await AbsenceModel.getStudentsAtRisk(threshold);
    return res.json({
      message: students.length > 0
        ? `${students.length} alumno(s) en riesgo de regularidad`
        : 'No hay alumnos en riesgo',
      umbral: threshold,
      total: students.length,
      data: students,
    });
  } catch (error) {
    next(error);
  }
}

export async function getMonthlyReport(req, res, next) {
  try {
    const studentId = parseInt(req.params.id, 10);
    const year = parseInt(req.query.anio, 10) || new Date().getFullYear();
    const month = parseInt(req.query.mes, 10) || (new Date().getMonth() + 1);

    const report = await AbsenceModel.getMonthlyReport(studentId, year, month);
    return res.json(report);
  } catch (error) {
    next(error);
  }
}
