const { Router } = require('express');
const { body } = require('express-validator');
const controller = require('./admin-stats.controller');
const authMiddleware = require('../../middlewares/authMiddleware');
const roleMiddleware = require('../../middlewares/roleMiddleware');
const validationMiddleware = require('../../middlewares/validationMiddleware');

const router = Router();
router.use(authMiddleware);
router.use(roleMiddleware('admin'));

router.get('/', controller.getStats);
router.post(
  '/page-visit',
  validationMiddleware([
    body('page').optional().isString().trim().escape().withMessage('page debe ser un texto'),
  ]),
  controller.recordPageVisit
);

module.exports = router;
