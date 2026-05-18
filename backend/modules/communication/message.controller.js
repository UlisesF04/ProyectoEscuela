import models from '../../models/index.js';
import { Op } from 'sequelize';

const { Mensaje, Usuario } = models;

/**
 * Validate RN-14: Destinatarios permitidos.
 * Tutor → Tutor está bloqueado (no conversaciones entre familias).
 */
function validateRecipient(senderRol, recipientRol) {
  if (senderRol === 'tutor' && recipientRol === 'tutor') {
    throw new Error('No puedes enviar mensajes a otro tutor');
  }
  return true;
}

// ─── Send message ───

export async function sendMessage({ emisorId, receptorId, asunto, cuerpo }) {
  if (!receptorId || !asunto || !cuerpo) {
    throw new Error('receptor_id, asunto y cuerpo son requeridos');
  }

  // Get sender role
  const sender = await Usuario.findByPk(emisorId, { attributes: ['rol'], raw: true });
  if (!sender) throw new Error('Emisor no encontrado');

  // Get recipient
  const recipient = await Usuario.findByPk(receptorId, { attributes: ['rol'], raw: true });
  if (!recipient) throw new Error('Receptor no encontrado');

  // RN-14 validation
  validateRecipient(sender.rol, recipient.rol);

  const message = await Mensaje.create({
    emisor_id: emisorId,
    receptor_id: receptorId,
    asunto,
    cuerpo,
  });

  return message;
}

// ─── List conversations ───

export async function getConversations(userId) {
  // Find all unique users the current user has exchanged messages with
  const sentTo = await Mensaje.findAll({
    where: { emisor_id: userId },
    attributes: ['receptor_id'],
    group: ['receptor_id'],
    raw: true,
  });

  const receivedFrom = await Mensaje.findAll({
    where: { receptor_id: userId },
    attributes: ['emisor_id'],
    group: ['emisor_id'],
    raw: true,
  });

  const userIds = new Set();
  sentTo.forEach(m => userIds.add(m.receptor_id));
  receivedFrom.forEach(m => userIds.add(m.emisor_id));

  if (userIds.size === 0) return [];

  // Get user info for each conversation partner
  const users = await Usuario.findAll({
    where: { id: { [Op.in]: [...userIds] } },
    attributes: ['id', 'email', 'rol'],
    raw: true,
  });

  // Get last message and unread count for each conversation
  const conversations = await Promise.all([...userIds].map(async (partnerId) => {
    const lastMessage = await Mensaje.findOne({
      where: {
        [Op.or]: [
          { emisor_id: userId, receptor_id: partnerId },
          { emisor_id: partnerId, receptor_id: userId },
        ],
      },
      order: [['createdAt', 'DESC']],
      raw: true,
    });

    const unreadCount = await Mensaje.count({
      where: { emisor_id: partnerId, receptor_id: userId, leido: false },
    });

    const partner = users.find(u => u.id === partnerId);

    return {
      usuario: partner || { id: partnerId, email: 'Desconocido' },
      ultimo_mensaje: lastMessage ? {
        asunto: lastMessage.asunto,
        cuerpo: lastMessage.cuerpo?.substring(0, 100),
        created_at: lastMessage.createdAt,
      } : null,
      no_leidos: unreadCount,
    };
  }));

  // Sort by most recent message first
  conversations.sort((a, b) => {
    if (!a.ultimo_mensaje) return 1;
    if (!b.ultimo_mensaje) return -1;
    return new Date(b.ultimo_mensaje.created_at) - new Date(a.ultimo_mensaje.created_at);
  });

  return conversations;
}

// ─── Get conversation messages ───

export async function getConversationMessages(userId, partnerId) {
  const partner = await Usuario.findByPk(partnerId, { attributes: ['id', 'email', 'rol'] });
  if (!partner) throw new Error('Usuario no encontrado');

  const messages = await Mensaje.findAll({
    where: {
      [Op.or]: [
        { emisor_id: userId, receptor_id: partnerId },
        { emisor_id: partnerId, receptor_id: userId },
      ],
    },
    include: [
      { model: Usuario, as: 'Emisor', attributes: ['id', 'email', 'rol'] },
    ],
    order: [['createdAt', 'ASC']],
  });

  return {
    partner: { id: partner.id, email: partner.email, rol: partner.rol },
    messages: messages.map(m => ({
      id: m.id,
      emisor: m.Emisor ? { id: m.Emisor.id, email: m.Emisor.email, rol: m.Emisor.rol } : null,
      asunto: m.asunto,
      cuerpo: m.cuerpo,
      leido: m.leido,
      created_at: m.createdAt,
    })),
    total: messages.length,
  };
}

// ─── Mark message as read ───

export async function markAsRead(messageId, userId) {
  const message = await Mensaje.findByPk(messageId);
  if (!message) throw new Error('Mensaje no encontrado');

  // Only the recipient can mark as read
  if (message.receptor_id !== userId) {
    throw new Error('No puedes marcar como leído un mensaje que no recibiste');
  }

  await message.update({ leido: true, leido_at: new Date() });
  return message;
}
