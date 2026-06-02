import api from './api';

export const notificationsService = {
  async getAll(params = {}) {
    const { data } = await api.get('/notifications', { params });
    return data;
  },

  async getTypes() {
    const { data } = await api.get('/notifications/types');
    return data;
  },

  async getAlertTypes() {
    const { data } = await api.get('/notifications/alert-types');
    return data;
  },
};
