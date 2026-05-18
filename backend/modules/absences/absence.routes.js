import { Router } from 'express';
import { authenticate, authorize } from '../auth/auth.middleware.js';
import * as AbsenceController from './absence.controller.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// POST /api/absences/register — Register daily absences (admin, preceptor)
router.post('/register', authorize('admin', 'preceptor'), AbsenceController.register);

// GET /api/absences/course/:id — Get absences by course+date (admin, preceptor, docente)
router.get('/course/:id', authorize('admin', 'preceptor', 'docente'), AbsenceController.getByCourse);

// GET /api/absences/student/:id — Get history by student
router.get('/student/:id', authorize('admin', 'preceptor', 'docente', 'tutor'), AbsenceController.getByStudent);

// GET /api/absences/risk — Students at risk of losing regularity
router.get('/risk', authorize('admin', 'preceptor', 'docente'), AbsenceController.getRiskReport);

// GET /api/absences/student/:id/monthly — Monthly report for a student
router.get('/student/:id/monthly', authorize('admin', 'preceptor', 'docente', 'tutor'), AbsenceController.getMonthlyReport);

// PUT /api/absences/:id — Update absence
router.put('/:id', authorize('admin', 'preceptor'), AbsenceController.update);

// PATCH /api/absences/:id/justify — Mark as justified
router.patch('/:id/justify', authorize('admin', 'preceptor'), AbsenceController.markJustified);

export default router;
