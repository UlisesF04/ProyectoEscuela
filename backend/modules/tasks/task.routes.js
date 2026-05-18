import { Router } from 'express';
import { authenticate, authorize } from '../auth/auth.middleware.js';
import * as TaskController from './task.controller.js';

const router = Router();

router.use(authenticate);

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

// ── Student-specific ──

// GET /api/tasks/student/:id — All tasks for a student (admin, docente, tutor)
router.get('/student/:id', authorize('admin', 'docente', 'tutor'), TaskController.getStudentTasks);

// GET /api/tasks/student/:id/consecutive-missed — RN-06 (admin, docente)
router.get('/student/:id/consecutive-missed', authorize('admin', 'docente'), TaskController.getConsecutiveMissed);

export default router;
