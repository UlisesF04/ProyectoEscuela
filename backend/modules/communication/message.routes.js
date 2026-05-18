import { Router } from 'express';
import { authenticate, authorize } from '../auth/auth.middleware.js';
import * as MessageController from './message.controller.js';

const router = Router();
router.use(authenticate);

// POST /api/communication/messages — Send a message
router.post('/messages', authorize('admin', 'docente', 'tutor'), async (req, res, next) => {
  try {
    const message = await MessageController.sendMessage({
      emisorId: req.user.id,
      receptorId: req.body.receptor_id,
      asunto: req.body.asunto,
      cuerpo: req.body.cuerpo,
    });
    return res.status(201).json({ message: 'Mensaje enviado', data: message });
  } catch (error) {
    if (error.message === 'Receptor no encontrado' || error.message === 'Emisor no encontrado') {
      return res.status(404).json({ message: error.message });
    }
    if (error.message === 'No puedes enviar mensajes a otro tutor' ||
        error.message === 'receptor_id, asunto y cuerpo son requeridos') {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
});

// GET /api/communication/conversations — List current user's conversations
router.get('/conversations', authorize('admin', 'docente', 'tutor'), async (req, res, next) => {
  try {
    const conversations = await MessageController.getConversations(req.user.id);
    return res.json({ total: conversations.length, conversaciones: conversations });
  } catch (error) {
    next(error);
  }
});

// GET /api/communication/conversations/:userId/messages — Get message thread
router.get('/conversations/:userId/messages', authorize('admin', 'docente', 'tutor'), async (req, res, next) => {
  try {
    const partnerId = parseInt(req.params.userId, 10);
    const data = await MessageController.getConversationMessages(req.user.id, partnerId);
    return res.json(data);
  } catch (error) {
    if (error.message === 'Usuario no encontrado') {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
});

// PUT /api/communication/messages/:id/read — Mark message as read
router.put('/messages/:id/read', authorize('admin', 'docente', 'tutor'), async (req, res, next) => {
  try {
    const messageId = parseInt(req.params.id, 10);
    const message = await MessageController.markAsRead(messageId, req.user.id);
    return res.json({ message: 'Mensaje marcado como leido', data: message });
  } catch (error) {
    if (error.message === 'Mensaje no encontrado') {
      return res.status(404).json({ message: error.message });
    }
    if (error.message === 'No puedes marcar como leído un mensaje que no recibiste') {
      return res.status(403).json({ message: error.message });
    }
    next(error);
  }
});

export default router;
