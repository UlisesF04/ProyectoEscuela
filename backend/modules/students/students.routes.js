const { Router } = require('express');
const { body, param } = require('express-validator');
const studentsController = require('./students.controller');
const authMiddleware = require('../../middlewares/authMiddleware');
const roleMiddleware = require('../../middlewares/roleMiddleware');
const validationMiddleware = require('../../middlewares/validationMiddleware');

const router = Router();

const createStudentValidations = [
  body('first_name')
    .notEmpty().withMessage('El nombre es obligatorio')
    .isLength({ min: 2 }).withMessage('El nombre debe tener al menos 2 caracteres'),
  body('last_name')
    .notEmpty().withMessage('El apellido es obligatorio')
    .isLength({ min: 2 }).withMessage('El apellido debe tener al menos 2 caracteres'),
  body('dni')
    .optional()
    .isString().withMessage('El DNI debe ser un texto'),
  body('birth_date')
    .optional()
    .isDate().withMessage('La fecha de nacimiento no es válida'),
  body('course_id')
    .notEmpty().withMessage('El curso es obligatorio')
    .isInt({ min: 1 }).withMessage('El ID del curso debe ser un número entero positivo'),
];

const updateStudentValidations = [
  body('first_name')
    .optional()
    .isLength({ min: 2 }).withMessage('El nombre debe tener al menos 2 caracteres'),
  body('last_name')
    .optional()
    .isLength({ min: 2 }).withMessage('El apellido debe tener al menos 2 caracteres'),
  body('dni')
    .optional()
    .isString().withMessage('El DNI debe ser un texto'),
  body('birth_date')
    .optional()
    .isDate().withMessage('La fecha de nacimiento no es válida'),
  body('course_id')
    .optional()
    .isInt({ min: 1 }).withMessage('El ID del curso debe ser un número entero positivo'),
];

const linkParentValidations = [
  body('user_id')
    .notEmpty().withMessage('El ID del usuario es obligatorio')
    .isInt({ min: 1 }).withMessage('El ID del usuario debe ser un número entero positivo'),
  body('relationship')
    .optional()
    .isString().withMessage('El parentesco debe ser un texto'),
];

const idValidation = [
  param('id')
    .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo'),
];

router.post(
  '/',
  authMiddleware,
  roleMiddleware('admin', 'preceptor'),
  validationMiddleware(createStudentValidations),
  studentsController.createStudent
);

router.get(
  '/',
  authMiddleware,
  roleMiddleware('admin', 'preceptor'),
  studentsController.getAllStudents
);

router.get(
  '/:id',
  authMiddleware,
  roleMiddleware('admin', 'preceptor'),
  validationMiddleware(idValidation),
  studentsController.getStudentById
);

router.put(
  '/:id',
  authMiddleware,
  roleMiddleware('admin', 'preceptor'),
  validationMiddleware([...idValidation, ...updateStudentValidations]),
  studentsController.updateStudent
);

router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware('admin', 'preceptor'),
  validationMiddleware(idValidation),
  studentsController.deactivateStudent
);

router.put(
  '/:id/reactivate',
  authMiddleware,
  roleMiddleware('admin'),
  validationMiddleware(idValidation),
  studentsController.reactivateStudent
);

router.delete(
  '/:id/permanent',
  authMiddleware,
  roleMiddleware('admin'),
  validationMiddleware(idValidation),
  studentsController.permanentDeleteStudent
);

router.post(
  '/:id/parents',
  authMiddleware,
  roleMiddleware('admin', 'preceptor'),
  validationMiddleware([...idValidation, ...linkParentValidations]),
  studentsController.linkParent
);

router.get(
  '/:id/parents',
  authMiddleware,
  roleMiddleware('admin', 'preceptor'),
  validationMiddleware(idValidation),
  studentsController.getParents
);

// Parent: get my children
router.get(
  '/me/children',
  authMiddleware,
  roleMiddleware('padre'),
  studentsController.getMyChildren
);

// Get grade evolution for a student
// C-07 grades-evolution: padre of student, docente of assigned subject(s), or admin
router.get(
  '/:id/evolution',
  authMiddleware,
  roleMiddleware('padre', 'docente', 'admin'),
  validationMiddleware(idValidation),
  studentsController.getStudentEvolution
);

module.exports = router;
