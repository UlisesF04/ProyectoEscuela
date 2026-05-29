import api from './api';

export const parentService = {
  async getMyChildren() {
    const { data: res } = await api.get('/students/me/children');
    return res.data;
  },
};
