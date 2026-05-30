const { Router } = require('express');
const controller = require('./licences.controller');
const authMiddleware = require('../../middlewares/authMiddleware');
const roleMiddleware = require('../../middlewares/roleMiddleware');
const upload = require('../../config/multerLicences');

const router = Router();

router.use(authMiddleware);

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
  roleMiddleware('docente', 'preceptor'),
  controller.getMyLicences,
);

router.post(
  '/',
  roleMiddleware('docente', 'preceptor', 'padre'),
  upload.single('file'),
  controller.create,
);

router.get(
  '/:id/download',
  controller.download,
);

module.exports = router;
