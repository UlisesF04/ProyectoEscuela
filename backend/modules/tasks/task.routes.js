import { Router } from 'express';
import { authenticate, authorize } from '../auth/auth.middleware.js';
import * as TaskController from './task.controller.js';
import models from '../../models/index.js';

const { Estudiante, Tutor } = models;

const router = Router();

router.use(authenticate);

/**
 * Middleware: verify the user can access this student's data (RN-16).
 * - admin/preceptor: all students
 * - docente: any student
 * - tutor: only their own children
 */
async function canAccessStudent(req, res, next) {
  try {
    const studentId = parseInt(req.params.id, 10);
    const user = req.user;

    if (user.rol === 'admin' || user.rol === 'preceptor') return next();

    if (user.rol === 'docente') {
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

// ── Student-specific (must be before /:id to avoid param collision) ──

// GET /api/tasks/student/:id — All tasks for a student (admin, docente, tutor) — RN-16
router.get('/student/:id', authorize('admin', 'docente', 'tutor'), canAccessStudent, TaskController.getStudentTasks);

// GET /api/tasks/student/:id/consecutive-missed — RN-06 (admin, docente)
router.get('/student/:id/consecutive-missed', authorize('admin', 'docente'), TaskController.getConsecutiveMissed);

// ── Task CRUD ──

// POST /api/tasks — Create task (docente only)
router.post('/', authorize('docente'), TaskController.create);

// GET /api/tasks — List tasks (admin, docente)
router.get('/', authorize('admin', 'docente'), TaskController.list);

// GET /api/tasks/:id — Get task detail with entregas (admin, docente)
router.get('/:id', authorize('admin', 'docente'), TaskController.getById);

// PUT /api/tasks/:id — Update task (docente only)
router.put('/:id', authorize('docente'), TaskController.update);

// DELETE /api/tasks/:id — Delete task (admin only)
router.delete('/:id', authorize('admin'), TaskController.remove);

// ── Student Submissions ──

// GET /api/tasks/:id/submissions — All students' entregas for a task (docente)
router.get('/:id/submissions', authorize('admin', 'docente'), TaskController.getSubmissions);

// PUT /api/tasks/:id/students/:estudianteId — Update submission (docente)
router.put('/:id/students/:estudianteId', authorize('docente'), TaskController.updateSubmission);

export default router;
