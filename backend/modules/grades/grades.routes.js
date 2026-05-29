const { Router } = require('express');
const { body, param, query } = require('express-validator');
const gradesController = require('./grades.controller');
const authMiddleware = require('../../middlewares/authMiddleware');
const roleMiddleware = require('../../middlewares/roleMiddleware');
const validationMiddleware = require('../../middlewares/validationMiddleware');

const router = Router();

const createGradeValidations = [
  body('student_id').isInt({ min: 1 }).withMessage('ID de estudiante inválido'),
  body('subject_id').isInt({ min: 1 }).withMessage('ID de materia inválido'),
  body('grade').isFloat({ min: 0, max: 10 }).withMessage('La nota debe ser entre 0 y 10'),
  body('type').optional().isIn(['examen', 'trabajo', 'tarea', 'oral', 'otro']).withMessage('Tipo de nota inválido'),
  body('description').optional().isString(),
  body('date').optional({ values: 'null' }).isDate().withMessage('Fecha inválida'),
];

const updateGradeValidations = [
  body('grade').optional().isFloat({ min: 0, max: 10 }).withMessage('La nota debe ser entre 0 y 10'),
  body('type').optional().isIn(['examen', 'trabajo', 'tarea', 'oral', 'otro']).withMessage('Tipo de nota inválido'),
  body('description').optional().isString(),
];

// Create grade (teacher for their subject, or admin)
router.post(
  '/',
  authMiddleware,
  roleMiddleware('docente', 'admin'),
  validationMiddleware(createGradeValidations),
  gradesController.createGrade
);

// Get grades for a student (teacher, parent, admin)
router.get(
  '/students/:studentId',
  authMiddleware,
  roleMiddleware('docente', 'admin', 'padre'),
  validationMiddleware([param('studentId').isInt({ min: 1 })]),
  gradesController.getStudentGrades
);

// Update grade (teacher or admin)
router.put(
  '/:id',
  authMiddleware,
  roleMiddleware('docente', 'admin'),
  validationMiddleware([param('id').isInt({ min: 1 }), ...updateGradeValidations]),
  gradesController.updateGrade
);

// Delete grade (admin only)
router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware('admin'),
  validationMiddleware([param('id').isInt({ min: 1 })]),
  gradesController.deleteGrade
);

// Get all grades for a subject (teacher or admin)
router.get(
  '/subjects/:subjectId',
  authMiddleware,
  roleMiddleware('docente', 'admin'),
  validationMiddleware([param('subjectId').isInt({ min: 1 })]),
  gradesController.getSubjectGrades
);

module.exports = router;
