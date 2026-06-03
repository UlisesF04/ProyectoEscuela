const { Router } = require('express');
const { body } = require('express-validator');
const controller = require('./config.controller');
const authMiddleware = require('../../middlewares/authMiddleware');
const roleMiddleware = require('../../middlewares/roleMiddleware');
const validationMiddleware = require('../../middlewares/validationMiddleware');

const router = Router();
router.use(authMiddleware);
router.use(roleMiddleware('admin'));

router.get('/', controller.getConfig);
router.put(
  '/',
  validationMiddleware([
    body('absence_threshold')
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage('absence_threshold debe estar entre 1 y 50'),
    body('notification_time')
      .optional()
      .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
      .withMessage('notification_time debe ser HH:MM (formato 24h)'),
    body('alerts_enabled')
      .optional()
      .isBoolean()
      .withMessage('alerts_enabled debe ser true o false'),
  ]),
  controller.updateConfig,
);

module.exports = router;
