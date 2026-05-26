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
    .isEmail().withMessage('El email no es válido'),
  body('password')
    .notEmpty().withMessage('La contraseña es obligatoria')
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
];

router.post('/login', loginLimiter, validationMiddleware(loginValidations), authController.login);
router.post('/logout', authMiddleware, authController.logout);
router.get('/me', authMiddleware, authController.me);

module.exports = router;
