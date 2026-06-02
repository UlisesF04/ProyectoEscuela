const { Router } = require('express');
const controller = require('./config.controller');
const authMiddleware = require('../../middlewares/authMiddleware');
const roleMiddleware = require('../../middlewares/roleMiddleware');

const router = Router();
router.use(authMiddleware);
router.use(roleMiddleware('admin'));

router.get('/', controller.getConfig);
router.put('/', controller.updateConfig);

module.exports = router;
