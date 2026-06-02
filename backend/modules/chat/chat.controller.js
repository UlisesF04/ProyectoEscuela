const chatService = require('./chat.service');

const chatController = {
  async createChat(req, res, next) {
    try {
      const { participant_id } = req.body;
      const { chat, created } = await chatService.createChat(req.user.id, participant_id);
      res.status(created ? 201 : 200).json({
        status: 'success',
        data: chat,
        message: created ? 'Chat creado' : 'Chat existente',
      });
    } catch (error) {
      next(error);
    }
  },

  async getMyChats(req, res, next) {
    try {
      const chats = await chatService.getMyChats(req.user.id);
      res.status(200).json({ status: 'success', data: chats });
    } catch (error) {
      next(error);
    }
  },

  async getChatMessages(req, res, next) {
    try {
      const { id } = req.params;
      const messages = await chatService.getChatMessages(parseInt(id), req.user.id);
      res.status(200).json({ status: 'success', data: messages });
    } catch (error) {
      next(error);
    }
  },

  async sendMessage(req, res, next) {
    try {
      const { id } = req.params;
      const { content } = req.body;
      const message = await chatService.sendMessage(parseInt(id), req.user.id, content);
      res.status(201).json({ status: 'success', data: message });
    } catch (error) {
      next(error);
    }
  },

  async deleteChat(req, res, next) {
    try {
      const { id } = req.params;
      await chatService.deleteChat(parseInt(id), req.user.id);
      res.status(200).json({ status: 'success', message: 'Chat eliminado' });
    } catch (error) {
      next(error);
    }
  },

  async getAvailableUsers(req, res, next) {
    try {
      const users = await chatService.getAvailableUsers(req.user.id);
      res.status(200).json({ status: 'success', data: users });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = chatController;
