import api from './api';

export const teacherService = {
  async getMyCourses() {
    const { data: res } = await api.get('/subjects/my/courses');
    return res.data;
  },
};
