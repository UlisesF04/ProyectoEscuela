const { Router } = require('express');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const authController = require('./auth.controller');
const authMiddleware = require('../../middlewares/authMiddleware');
const validationMiddleware = require('../../middlewares/validationMiddleware');

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'test' ? 100 : 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Demasiados intentos. Intente más tarde.',
  },
});

const loginValidations = [
  body('email')
    .notEmpty().withMessage('El email es obligatorio')
    .isEmail().withMessage('El email no es válido')
    .normalizeEmail().trim().escape(),
  body('password')
    .notEmpty().withMessage('La contraseña es obligatoria')
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
];

router.post('/login', loginLimiter, validationMiddleware(loginValidations), authController.login);
router.post('/logout', authMiddleware, authController.logout);
router.get('/me', authMiddleware, authController.me);

router.put(
  '/password',
  authMiddleware,
  validationMiddleware([
    body('current_password').notEmpty().withMessage('Contraseña actual requerida'),
    body('new_password').isLength({ min: 8 }).withMessage('Nueva contraseña debe tener al menos 8 caracteres'),
  ]),
  authController.changePassword
);

const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Demasiadas solicitudes de refresh. Intente nuevamente en 15 minutos.',
  },
});

router.post(
  '/refresh',
  refreshLimiter,
  validationMiddleware([
    body('refreshToken').notEmpty().withMessage('Refresh token requerido'),
  ]),
  authController.refresh
);

module.exports = router;
