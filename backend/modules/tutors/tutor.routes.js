import { Router } from 'express';
import { authenticate, authorize } from '../auth/auth.middleware.js';
import * as TutorController from './tutor.controller.js';

const router = Router();

router.use(authenticate);

// GET /api/tutors/children — List tutor's children (tutor only)
router.get('/children', authorize('tutor'), TutorController.getChildren);

// GET /api/tutors/children/:id/summary — Consolidated summary for a child (tutor only)
router.get('/children/:id/summary', authorize('tutor'), TutorController.getChildSummary);

export default router;
