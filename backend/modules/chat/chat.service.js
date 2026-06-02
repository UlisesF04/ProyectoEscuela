const { Chat, Message, User } = require('../../models');
const { Op } = require('sequelize');
const AppError = require('../../utils/AppError');

const ALLOWED_ROLES = ['admin', 'preceptor', 'docente'];

const chatService = {
  async createChat(userId, participantId) {
    const user = await User.findByPk(userId);
    if (!user || !ALLOWED_ROLES.includes(user.role)) {
      throw new AppError('No tienes permiso para crear chats', 403);
    }

    const participant = await User.findByPk(participantId);
    if (!participant || !ALLOWED_ROLES.includes(participant.role)) {
      throw new AppError('El usuario seleccionado no puede participar en chats', 400);
    }

    const [user1Id, user2Id] = userId < participantId
      ? [userId, participantId]
      : [participantId, userId];

    const [chat, created] = await Chat.findOrCreate({
      where: { user1_id: user1Id, user2_id: user2Id },
      defaults: { user1_id: user1Id, user2_id: user2Id },
    });

    return { chat, created };
  },

  async getMyChats(userId) {
    const chats = await Chat.findAll({
      where: {
        [Op.or]: [{ user1_id: userId }, { user2_id: userId }],
      },
      include: [
        {
          model: User,
          as: 'user1',
          attributes: ['id', 'first_name', 'last_name', 'role'],
        },
        {
          model: User,
          as: 'user2',
          attributes: ['id', 'first_name', 'last_name', 'role'],
        },
      ],
      order: [['last_message_at', 'DESC']],
    });

    return chats.map((chat) => {
      const participant = chat.user1_id === userId ? chat.user2 : chat.user1;
      return {
        id: chat.id,
        participant: {
          id: participant.id,
          name: `${participant.first_name} ${participant.last_name}`,
          role: participant.role,
        },
        last_message: chat.last_message,
        last_message_at: chat.last_message_at,
      };
    });
  },

  async getChatMessages(chatId, userId) {
    const chat = await Chat.findByPk(chatId);
    if (!chat) throw new AppError('Chat no encontrado', 404);
    if (chat.user1_id !== userId && chat.user2_id !== userId) {
      throw new AppError('No tienes acceso a este chat', 403);
    }

    const messages = await Message.findAll({
      where: { chat_id: chatId },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'first_name', 'last_name', 'role'],
        },
      ],
      order: [['created_at', 'ASC']],
    });

    return messages.map((m) => ({
      id: m.id,
      sender: {
        id: m.sender.id,
        name: `${m.sender.first_name} ${m.sender.last_name}`,
        role: m.sender.role,
      },
      content: m.content,
      created_at: m.created_at,
    }));
  },

  async sendMessage(chatId, userId, content) {
    const chat = await Chat.findByPk(chatId);
    if (!chat) throw new AppError('Chat no encontrado', 404);
    if (chat.user1_id !== userId && chat.user2_id !== userId) {
      throw new AppError('No tienes acceso a este chat', 403);
    }

    if (!content || !content.trim()) {
      throw new AppError('El mensaje no puede estar vacío', 400);
    }

    const message = await Message.create({
      chat_id: chatId,
      sender_id: userId,
      content: content.trim(),
    });

    await chat.update({
      last_message: content.trim().substring(0, 100),
      last_message_at: new Date(),
    });

    const fullMessage = await Message.findByPk(message.id, {
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'first_name', 'last_name', 'role'],
        },
      ],
    });

    return {
      id: fullMessage.id,
      sender: {
        id: fullMessage.sender.id,
        name: `${fullMessage.sender.first_name} ${fullMessage.sender.last_name}`,
        role: fullMessage.sender.role,
      },
      content: fullMessage.content,
      created_at: fullMessage.created_at,
    };
  },

  async deleteChat(chatId, userId) {
    const chat = await Chat.findByPk(chatId);
    if (!chat) throw new AppError('Chat no encontrado', 404);
    if (chat.user1_id !== userId && chat.user2_id !== userId) {
      throw new AppError('No tienes acceso a este chat', 403);
    }

    await chat.destroy();
  },

  async getAvailableUsers(userId) {
    const user = await User.findByPk(userId);
    if (!user) throw new AppError('Usuario no encontrado', 404);

    const users = await User.findAll({
      where: {
        id: { [Op.ne]: userId },
        role: { [Op.in]: ALLOWED_ROLES },
        is_active: true,
      },
      attributes: ['id', 'first_name', 'last_name', 'role'],
      order: [['first_name', 'ASC']],
    });

    return users.map((u) => ({
      id: u.id,
      name: `${u.first_name} ${u.last_name}`,
      role: u.role,
    }));
  },
};

module.exports = chatService;
