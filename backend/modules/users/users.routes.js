const { Router } = require('express');
const { body, param } = require('express-validator');
const usersController = require('./users.controller');
const authMiddleware = require('../../middlewares/authMiddleware');
const roleMiddleware = require('../../middlewares/roleMiddleware');
const validationMiddleware = require('../../middlewares/validationMiddleware');

const router = Router();

// ─── Validation schemas ───────────────────────────────────────

const createUserValidations = [
  body('email')
    .notEmpty().withMessage('El email es obligatorio')
    .isEmail().withMessage('El email no es válido'),
  body('password')
    .notEmpty().withMessage('La contraseña es obligatoria')
    .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres'),
  body('first_name')
    .notEmpty().withMessage('El nombre es obligatorio')
    .isLength({ min: 2 }).withMessage('El nombre debe tener al menos 2 caracteres'),
  body('last_name')
    .notEmpty().withMessage('El apellido es obligatorio')
    .isLength({ min: 2 }).withMessage('El apellido debe tener al menos 2 caracteres'),
  body('role')
    .notEmpty().withMessage('El rol es obligatorio')
    .isIn(['docente', 'preceptor', 'padre']).withMessage('El rol debe ser: docente, preceptor o padre'),
  body('phone_whatsapp')
    .optional()
    .matches(/^\+?[1-9]\d{1,14}$/).withMessage('El número de teléfono no es válido'),
];

const updateUserValidations = [
  body('email')
    .optional()
    .isEmail().withMessage('El email no es válido'),
  body('first_name')
    .optional()
    .isLength({ min: 2 }).withMessage('El nombre debe tener al menos 2 caracteres'),
  body('last_name')
    .optional()
    .isLength({ min: 2 }).withMessage('El apellido debe tener al menos 2 caracteres'),
  body('phone_whatsapp')
    .optional()
    .matches(/^\+?[1-9]\d{1,14}$/).withMessage('El número de teléfono no es válido'),
  body('is_active')
    .optional()
    .isBoolean().withMessage('is_active debe ser true o false'),
];

const userIdValidation = [
  param('id')
    .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo'),
];

const roleParamValidation = [
  param('role')
    .isIn(['docente', 'preceptor', 'padre']).withMessage('El rol debe ser: docente, preceptor o padre'),
];

// ─── Routes (all protected with auth + admin role) ───────────────

// Create a new user
router.post(
  '/',
  authMiddleware,
  roleMiddleware('admin'),
  validationMiddleware(createUserValidations),
  usersController.createUser
);

// Get all users
router.get(
  '/',
  authMiddleware,
  roleMiddleware('admin'),
  usersController.getAllUsers
);

// Get users by role
router.get(
  '/role/:role',
  authMiddleware,
  roleMiddleware('admin'),
  validationMiddleware(roleParamValidation),
  usersController.getUsersByRole
);

// Get user by ID
router.get(
  '/:id',
  authMiddleware,
  roleMiddleware('admin'),
  validationMiddleware(userIdValidation),
  usersController.getUserById
);

// Update user
router.put(
  '/:id',
  authMiddleware,
  roleMiddleware('admin'),
  validationMiddleware([...userIdValidation, ...updateUserValidations]),
  usersController.updateUser
);

// Delete user
router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware('admin'),
  validationMiddleware(userIdValidation),
  usersController.deleteUser
);

// Get multiple users by IDs
router.post(
  '/bulk/get',
  authMiddleware,
  roleMiddleware('admin'),
  body('ids')
    .isArray({ min: 1 }).withMessage('ids debe ser un array no vacío')
    .custom((val) => val.every(id => Number.isInteger(id) && id > 0)).withMessage('Todos los IDs deben ser números enteros positivos'),
  validationMiddleware([]),
  usersController.getUsersByIds
);

module.exports = router;
