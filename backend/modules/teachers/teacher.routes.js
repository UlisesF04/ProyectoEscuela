import { Router } from 'express';
import { authenticate, authorize } from '../auth/auth.middleware.js';
import * as TeacherController from './teacher.controller.js';

const router = Router();

router.use(authenticate);

// GET /api/teachers/license — License status (docente only)
router.get('/license', authorize('docente'), TeacherController.getLicense);

// GET /api/teachers/students/absences — Absences of teacher's students (docente only)
router.get('/students/absences', authorize('docente'), TeacherController.getStudentAbsences);

export default router;
