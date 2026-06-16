const { Router } = require('express');
const { body, param } = require('express-validator');
const controller = require('./licences.controller');
const authMiddleware = require('../../middlewares/authMiddleware');
const roleMiddleware = require('../../middlewares/roleMiddleware');
const validationMiddleware = require('../../middlewares/validationMiddleware');
const upload = require('../../config/multerLicences');

const router = Router();

router.use(authMiddleware);

const createLicenceValidations = [
  body('title')
    .notEmpty().withMessage('El título es obligatorio')
    .trim().escape()
    .isString().withMessage('El título debe ser un texto'),
];

const downloadParamValidation = [
  param('id')
    .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo'),
];

router.get(
  '/admin',
  roleMiddleware('admin'),
  controller.getAllForAdmin,
);

router.get(
  '/from-parents',
  roleMiddleware('preceptor'),
  controller.getFromParents,
);

router.get(
  '/me',
  roleMiddleware('docente', 'preceptor', 'padre'),
  controller.getMyLicences,
);

router.post(
  '/',
  roleMiddleware('docente', 'preceptor', 'padre'),
  upload.single('file'),
  validationMiddleware(createLicenceValidations),
  controller.create,
);

router.get(
  '/:id/download',
  roleMiddleware('admin', 'docente', 'preceptor', 'padre'),
  validationMiddleware(downloadParamValidation),
  controller.download,
);

module.exports = router;
