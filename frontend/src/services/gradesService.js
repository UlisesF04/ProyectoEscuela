import api from './api';

export const gradesService = {
  async createGrade(data) {
    const { data: res } = await api.post('/grades', data);
    return res.data;
  },

  async getStudentGrades(studentId, params = {}) {
    const { data: res } = await api.get(`/grades/students/${studentId}`, { params });
    return res.data;
  },

  async updateGrade(id, data) {
    const { data: res } = await api.put(`/grades/${id}`, data);
    return res.data;
  },

  async deleteGrade(id) {
    const { data: res } = await api.delete(`/grades/${id}`);
    return res.data;
  },

  async getSubjectGrades(subjectId) {
    const { data: res } = await api.get(`/grades/subjects/${subjectId}`);
    return res.data;
  },
};
