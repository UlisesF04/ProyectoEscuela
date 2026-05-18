import { Router } from 'express';
import { authenticate, authorize } from '../auth/auth.middleware.js';
import * as AnalyticsController from './analytics.controller.js';
import models from '../../models/index.js';

const { Estudiante, Tutor, DocenteMateria } = models;

const router = Router();
router.use(authenticate);

/**
 * Middleware: verify the user can access this student's data (RN-16).
 * - admin/preceptor: all students
 * - docente: any student (they teach somewhere in the school)
 * - tutor: only their own children
 */
async function canAccessStudent(req, res, next) {
  try {
    const studentId = parseInt(req.params.id, 10);
    const user = req.user;

    if (user.rol === 'admin' || user.rol === 'preceptor') {
      return next();
    }

    if (user.rol === 'docente') {
      // Verify student exists
      const student = await Estudiante.findByPk(studentId, { attributes: ['id'], raw: true });
      if (!student) return res.status(404).json({ message: 'Estudiante no encontrado' });
      return next();
    }

    if (user.rol === 'tutor') {
      const tutor = await Tutor.findOne({
        where: { usuario_id: user.id },
        include: [{ model: Estudiante, where: { id: studentId }, attributes: ['id'] }],
      });
      if (tutor) return next();
      return res.status(403).json({ message: 'No tienes acceso a los datos de este estudiante' });
    }

    return res.status(403).json({ message: 'Acceso denegado' });
  } catch (error) {
    next(error);
  }
}

// GET /api/analytics/student/:id — Full analytics dashboard
router.get('/student/:id', authorize('admin', 'preceptor', 'docente', 'tutor'), canAccessStudent, async (req, res, next) => {
  try {
    const studentId = parseInt(req.params.id, 10);
    const data = await AnalyticsController.getFullAnalytics(studentId);
    return res.json(data);
  } catch (error) {
    if (error.message === 'Estudiante no encontrado') {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
});

// GET /api/analytics/student/:id/absences — Absence analytics only
router.get('/student/:id/absences', authorize('admin', 'preceptor', 'docente', 'tutor'), canAccessStudent, async (req, res, next) => {
  try {
    const studentId = parseInt(req.params.id, 10);
    const data = await AnalyticsController.getAbsenceAnalyticsOnly(studentId);
    return res.json(data);
  } catch (error) {
    if (error.message === 'Estudiante no encontrado') {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
});

// GET /api/analytics/student/:id/grades — Grade analytics only
router.get('/student/:id/grades', authorize('admin', 'preceptor', 'docente', 'tutor'), canAccessStudent, async (req, res, next) => {
  try {
    const studentId = parseInt(req.params.id, 10);
    const data = await AnalyticsController.getGradeAnalyticsOnly(studentId);
    return res.json(data);
  } catch (error) {
    if (error.message === 'Estudiante no encontrado') {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
});

export default router;
