const { Router } = require('express');
const { body, param } = require('express-validator');
const coursesController = require('./courses.controller');
const authMiddleware = require('../../middlewares/authMiddleware');
const roleMiddleware = require('../../middlewares/roleMiddleware');
const validationMiddleware = require('../../middlewares/validationMiddleware');

const router = Router();

const courseValidations = [
  body('name')
    .notEmpty().withMessage('El nombre del curso es obligatorio')
    .isLength({ min: 2 }).withMessage('El nombre debe tener al menos 2 caracteres')
    .trim().escape(),
  body('year')
    .notEmpty().withMessage('El año es obligatorio')
    .isInt({ min: 1900, max: 2100 }).withMessage('El año debe estar entre 1900 y 2100'),
  body('division')
    .optional()
    .isString().withMessage('La división debe ser un texto')
    .trim().escape(),
  body('level')
    .optional()
    .isString().withMessage('El nivel debe ser un texto')
    .trim().escape(),
];

const updateCourseValidations = [
  body('name')
    .optional()
    .isLength({ min: 2 }).withMessage('El nombre debe tener al menos 2 caracteres')
    .trim().escape(),
  body('year')
    .optional()
    .isInt({ min: 1900, max: 2100 }).withMessage('El año debe estar entre 1900 y 2100'),
  body('division')
    .optional()
    .isString().withMessage('La división debe ser un texto')
    .trim().escape(),
  body('level')
    .optional()
    .isString().withMessage('El nivel debe ser un texto')
    .trim().escape(),
];

const subjectValidations = [
  body('name')
    .notEmpty().withMessage('El nombre de la materia es obligatorio')
    .isLength({ min: 2 }).withMessage('El nombre debe tener al menos 2 caracteres')
    .trim().escape(),
];

const idValidation = [
  param('id')
    .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo'),
];

router.post(
  '/',
  authMiddleware,
  roleMiddleware('admin'),
  validationMiddleware(courseValidations),
  coursesController.createCourse
);

router.get(
  '/',
  authMiddleware,
  roleMiddleware('admin', 'preceptor'),
  coursesController.getAllCourses
);

router.get(
  '/:id',
  authMiddleware,
  roleMiddleware('admin'),
  validationMiddleware(idValidation),
  coursesController.getCourseById
);

router.put(
  '/:id',
  authMiddleware,
  roleMiddleware('admin'),
  validationMiddleware([...idValidation, ...updateCourseValidations]),
  coursesController.updateCourse
);

router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware('admin'),
  validationMiddleware(idValidation),
  coursesController.deleteCourse
);

router.post(
  '/:id/subjects',
  authMiddleware,
  roleMiddleware('admin'),
  validationMiddleware([...idValidation, ...subjectValidations]),
  coursesController.createSubject
);

router.get(
  '/:id/subjects',
  authMiddleware,
  roleMiddleware('admin', 'preceptor'),
  validationMiddleware(idValidation),
  coursesController.getSubjects
);

module.exports = router;
