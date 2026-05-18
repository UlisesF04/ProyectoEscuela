import * as TeacherModel from './teacher.model.js';

export async function getLicense(req, res, next) {
  try {
    const info = await TeacherModel.getLicenseInfo(req.user.id);
    return res.json(info);
  } catch (error) {
    if (error.message === 'Docente no encontrado') {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
}

export async function getStudentAbsences(req, res, next) {
  try {
    const filters = {};
    if (req.query.desde) filters.desde = req.query.desde;
    if (req.query.hasta) filters.hasta = req.query.hasta;

    const data = await TeacherModel.getTeacherStudentAbsences(req.user.id, filters);
    return res.json(data);
  } catch (error) {
    if (error.message === 'Docente no encontrado') {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
}
