import { Router } from 'express';
import { authenticate, authorize } from '../auth/auth.middleware.js';
import * as GradeController from './grade.controller.js';
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

// POST /api/grades — Create a grade (docente only)
router.post('/', authorize('docente'), GradeController.create);

// GET /api/grades/subjects — Subjects assigned to logged teacher
router.get('/subjects', authorize('admin', 'docente'), GradeController.getTeacherSubjects);

// GET /api/grades/student/:id — All grades for a student (RN-16: tutors can only see own children)
router.get('/student/:id', authorize('admin', 'docente', 'tutor'), canAccessStudent, GradeController.getByStudent);

// GET /api/grades/student/:id/average — Average per subject + general (RN-16)
router.get('/student/:id/average', authorize('admin', 'docente', 'tutor'), canAccessStudent, GradeController.getStudentAverage);

// GET /api/grades/course/:id — Grades by course
router.get('/course/:id', authorize('admin', 'docente'), GradeController.getByCourse);

// GET /api/grades/critical — Grades <= 4 (RN-04)
router.get('/critical', authorize('admin', 'docente'), GradeController.getCriticalGrades);

// GET /api/grades/low-average — Students with avg < 6 (RN-05)
router.get('/low-average', authorize('admin', 'docente'), GradeController.getLowAverageStudents);

export default router;
