import api from './api';

export const adminService = {
  // Users
  async createUser(data) {
    const { data: res } = await api.post('/users', data);
    return res.data;
  },

  async getUsers() {
    const { data: res } = await api.get('/users');
    return res.data;
  },

  async getUserById(id) {
    const { data: res } = await api.get(`/users/${id}`);
    return res.data;
  },

  async getUsersByRole(role) {
    const { data: res } = await api.get(`/users/role/${role}`);
    return res.data;
  },

  async updateUser(id, data) {
    const { data: res } = await api.put(`/users/${id}`, data);
    return res.data;
  },

  async deactivateUser(id) {
    const { data: res } = await api.delete(`/users/${id}`);
    return res.data;
  },

  async permanentDeleteUser(id) {
    const { data: res } = await api.delete(`/users/${id}/permanent`);
    return res.data;
  },

  // Courses
  async createCourse(data) {
    const { data: res } = await api.post('/courses', data);
    return res.data;
  },

  async getCourses() {
    const { data: res } = await api.get('/courses');
    return res.data;
  },

  async getCourseById(id) {
    const { data: res } = await api.get(`/courses/${id}`);
    return res.data;
  },

  async updateCourse(id, data) {
    const { data: res } = await api.put(`/courses/${id}`, data);
    return res.data;
  },

  async deleteCourse(id) {
    const { data: res } = await api.delete(`/courses/${id}`);
    return res.data;
  },

  async createSubject(courseId, data) {
    const { data: res } = await api.post(`/courses/${courseId}/subjects`, data);
    return res.data;
  },

  async getSubjects(courseId) {
    const { data: res } = await api.get(`/courses/${courseId}/subjects`);
    return res.data;
  },

  // Students
  async createStudent(data) {
    const { data: res } = await api.post('/students', data);
    return res.data;
  },

  async getStudents() {
    const { data: res } = await api.get('/students');
    return res.data;
  },

  async getStudentById(id) {
    const { data: res } = await api.get(`/students/${id}`);
    return res.data;
  },

  async updateStudent(id, data) {
    const { data: res } = await api.put(`/students/${id}`, data);
    return res.data;
  },

  async deactivateStudent(id) {
    const { data: res } = await api.delete(`/students/${id}`);
    return res.data;
  },

  async permanentDeleteStudent(id) {
    const { data: res } = await api.delete(`/students/${id}/permanent`);
    return res.data;
  },

  async linkParent(studentId, data) {
    const { data: res } = await api.post(`/students/${studentId}/parents`, data);
    return res.data;
  },

  async getParents(studentId) {
    const { data: res } = await api.get(`/students/${studentId}/parents`);
    return res.data;
  },

  // Subjects (teacher assignment)
  async assignTeacher(subjectId, data) {
    const { data: res } = await api.post(`/subjects/${subjectId}/teachers`, data);
    return res.data;
  },

  async getTeachers(subjectId) {
    const { data: res } = await api.get(`/subjects/${subjectId}/teachers`);
    return res.data;
  },
};
