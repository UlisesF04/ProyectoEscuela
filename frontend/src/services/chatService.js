import api from './api';

export const chatService = {
  async getMyChats() {
    const { data: res } = await api.get('/chats');
    return res.data;
  },

  async createChat(participantId) {
    const { data: res } = await api.post('/chats', { participant_id: participantId });
    return { chat: res.data, created: res.status === 201, message: res.message };
  },

  async getChatMessages(chatId) {
    const { data: res } = await api.get(`/chats/${chatId}/messages`);
    return res.data;
  },

  async sendMessage(chatId, content) {
    const { data: res } = await api.post(`/chats/${chatId}/messages`, { content });
    return res.data;
  },

  async deleteChat(chatId) {
    const { data: res } = await api.delete(`/chats/${chatId}`);
    return res;
  },

  async getAvailableUsers() {
    const { data: res } = await api.get('/chats/users');
    return res.data;
  },
};
