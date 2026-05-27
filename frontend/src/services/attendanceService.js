import api from './api';

export const attendanceService = {
  async register(data) {
    const { data: res } = await api.post('/attendances', data);
    return res.data;
  },

  async batchRegister(records) {
    const { data: res } = await api.post('/attendances/batch', { records });
    return res.data;
  },

  async update(id, data) {
    const { data: res } = await api.put(`/attendances/${id}`, data);
    return res.data;
  },

  async justify(id, data) {
    const { data: res } = await api.put(`/attendances/${id}/justify`, data);
    return res.data;
  },

  async getStudentHistory(studentId, params = {}) {
    const { data: res } = await api.get(`/attendances/students/${studentId}`, { params });
    return { records: res.data, summary: res.summary };
  },

  async uploadCertificate(formData) {
    const { data: res } = await api.post('/attendances/certificates/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
};
