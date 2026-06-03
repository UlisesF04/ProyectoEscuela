const { Router } = require('express');
const { query } = require('express-validator');
const controller = require('./notifications.controller');
const authMiddleware = require('../../middlewares/authMiddleware');
const roleMiddleware = require('../../middlewares/roleMiddleware');
const serviceAuthMiddleware = require('../../middlewares/serviceAuthMiddleware');
const validationMiddleware = require('../../middlewares/validationMiddleware');

const router = Router();

const listNotificationsValidations = [
  query('type').optional().isString().trim().escape(),
  query('alert_type').optional().isString().trim().escape(),
  query('status').optional().isString().trim().escape(),
  query('from').optional().isISO8601().toDate(),
  query('to').optional().isISO8601().toDate(),
];

router.post('/trigger', serviceAuthMiddleware, controller.triggerNotifications);
router.get('/', authMiddleware, roleMiddleware('admin'), validationMiddleware(listNotificationsValidations), controller.getAll);
router.get('/types', authMiddleware, roleMiddleware('admin'), controller.getTypes);
router.get('/alert-types', authMiddleware, roleMiddleware('admin'), controller.getAlertTypes);

module.exports = router;
