import api from './api';

export const licencesService = {
  async getAllForAdmin() {
    const { data } = await api.get('/licences/admin');
    return data;
  },

  async getMyLicences() {
    const { data } = await api.get('/licences/me');
    return data;
  },

  async getFromParents() {
    const { data } = await api.get('/licences/from-parents');
    return data;
  },

  async create(formData) {
    const { data } = await api.post('/licences', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      transformRequest: [(d) => d],
    });
    return data;
  },

  async download(id) {
    const response = await api.get(`/licences/${id}/download`, {
      responseType: 'blob',
    });
    return response;
  },
};
