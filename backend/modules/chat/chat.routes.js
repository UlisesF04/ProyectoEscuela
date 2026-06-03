const { Router } = require('express');
const { body, param } = require('express-validator');
const chatController = require('./chat.controller');
const authMiddleware = require('../../middlewares/authMiddleware');
const roleMiddleware = require('../../middlewares/roleMiddleware');
const validationMiddleware = require('../../middlewares/validationMiddleware');

const router = Router();

const CHAT_ROLES = ['admin', 'preceptor', 'docente'];

router.get(
  '/users',
  authMiddleware,
  roleMiddleware(...CHAT_ROLES),
  chatController.getAvailableUsers
);

router.get(
  '/',
  authMiddleware,
  roleMiddleware(...CHAT_ROLES),
  chatController.getMyChats
);

router.post(
  '/',
  authMiddleware,
  roleMiddleware(...CHAT_ROLES),
  validationMiddleware([
    body('participant_id').isInt({ min: 1 }).withMessage('ID de participante inválido'),
  ]),
  chatController.createChat
);

router.get(
  '/:id/messages',
  authMiddleware,
  roleMiddleware(...CHAT_ROLES),
  validationMiddleware([param('id').isInt({ min: 1 })]),
  chatController.getChatMessages
);

router.post(
  '/:id/messages',
  authMiddleware,
  roleMiddleware(...CHAT_ROLES),
  validationMiddleware([
    param('id').isInt({ min: 1 }),
    body('content').notEmpty().withMessage('El mensaje no puede estar vacío').trim().escape(),
  ]),
  chatController.sendMessage
);

router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware(...CHAT_ROLES),
  validationMiddleware([param('id').isInt({ min: 1 })]),
  chatController.deleteChat
);

module.exports = router;
