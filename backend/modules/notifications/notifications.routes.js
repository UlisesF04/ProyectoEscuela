const { Router } = require('express');
const controller = require('./notifications.controller');
const authMiddleware = require('../../middlewares/authMiddleware');
const roleMiddleware = require('../../middlewares/roleMiddleware');
const serviceAuthMiddleware = require('../../middlewares/serviceAuthMiddleware');

const router = Router();

router.post('/trigger', serviceAuthMiddleware, controller.triggerNotifications);
router.get('/', authMiddleware, roleMiddleware('admin'), controller.getAll);
router.get('/types', authMiddleware, roleMiddleware('admin'), controller.getTypes);
router.get('/alert-types', authMiddleware, roleMiddleware('admin'), controller.getAlertTypes);

module.exports = router;
