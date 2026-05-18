import { Router } from 'express';
import { authenticate, authorize } from '../auth/auth.middleware.js';
import * as GradeController from './grade.controller.js';

const router = Router();

router.use(authenticate);

// POST /api/grades — Create a grade (docente only)
router.post('/', authorize('docente'), GradeController.create);

// GET /api/grades/subjects — Subjects assigned to logged teacher
router.get('/subjects', authorize('docente'), GradeController.getTeacherSubjects);

// GET /api/grades/student/:id — All grades for a student
router.get('/student/:id', authorize('admin', 'docente', 'tutor'), GradeController.getByStudent);

// GET /api/grades/student/:id/average — Average per subject + general
router.get('/student/:id/average', authorize('admin', 'docente', 'tutor'), GradeController.getStudentAverage);

// GET /api/grades/course/:id — Grades by course
router.get('/course/:id', authorize('admin', 'docente'), GradeController.getByCourse);

// GET /api/grades/critical — Grades <= 4 (RN-04)
router.get('/critical', authorize('admin', 'docente'), GradeController.getCriticalGrades);

// GET /api/grades/low-average — Students with avg < 6 (RN-05)
router.get('/low-average', authorize('admin', 'docente'), GradeController.getLowAverageStudents);

export default router;
