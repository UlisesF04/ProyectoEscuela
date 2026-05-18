import * as TutorModel from './tutor.model.js';

export async function getChildren(req, res, next) {
  try {
    const data = await TutorModel.getChildren(req.user.id);
    return res.json(data);
  } catch (error) {
    if (error.message === 'Tutor no encontrado') {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
}

export async function getChildSummary(req, res, next) {
  try {
    const childId = parseInt(req.params.id, 10);
    const data = await TutorModel.getChildSummary(req.user.id, childId);
    return res.json(data);
  } catch (error) {
    if (error.message === 'El estudiante no está registrado como hijo del tutor') {
      return res.status(403).json({ message: error.message });
    }
    if (error.message === 'Estudiante no encontrado' || error.message === 'Tutor no encontrado') {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
}
