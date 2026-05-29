const { Router } = require('express');
const { body, param } = require('express-validator');
const subjectsController = require('./subjects.controller');
const authMiddleware = require('../../middlewares/authMiddleware');
const roleMiddleware = require('../../middlewares/roleMiddleware');
const validationMiddleware = require('../../middlewares/validationMiddleware');

const router = Router();

const assignTeacherValidations = [
  body('user_id')
    .notEmpty().withMessage('El ID del usuario es obligatorio')
    .isInt({ min: 1 }).withMessage('El ID del usuario debe ser un número entero positivo'),
];

const removeTeacherValidations = [
  body('user_id')
    .notEmpty().withMessage('El ID del usuario es obligatorio')
    .isInt({ min: 1 }).withMessage('El ID del usuario debe ser un número entero positivo'),
];

const idValidation = [
  param('id')
    .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo'),
];

// Get subjects assigned to the authenticated teacher
router.get(
  '/my',
  authMiddleware,
  roleMiddleware('docente'),
  subjectsController.getMySubjects
);

// Get courses with students for the authenticated teacher
router.get(
  '/my/courses',
  authMiddleware,
  roleMiddleware('docente'),
  subjectsController.getMyCoursesWithStudents
);

router.get(
  '/:id',
  authMiddleware,
  roleMiddleware('admin'),
  validationMiddleware(idValidation),
  subjectsController.getSubjectById
);

router.get(
  '/:id/teachers',
  authMiddleware,
  roleMiddleware('admin', 'preceptor', 'docente'),
  validationMiddleware(idValidation),
  subjectsController.getTeachers
);

router.post(
  '/:id/teachers',
  authMiddleware,
  roleMiddleware('admin', 'preceptor'),
  validationMiddleware([...idValidation, ...assignTeacherValidations]),
  subjectsController.assignTeacher
);

router.delete(
  '/:id/teachers',
  authMiddleware,
  roleMiddleware('admin', 'preceptor'),
  validationMiddleware([...idValidation, ...removeTeacherValidations]),
  subjectsController.removeTeacher
);

module.exports = router;
