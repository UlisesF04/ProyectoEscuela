const { Student } = require('../models');

const studentRepository = {
  async findById(id) {
    return Student.findByPk(id);
  },

  async findByCourseId(courseId) {
    return Student.findAll({ where: { course_id: courseId } });
  },

  async findAll(filter = {}) {
    return Student.findAll({ where: filter });
  },

  async create(data) {
    return Student.create(data);
  },

  async update(id, data) {
    const student = await Student.findByPk(id);
    if (!student) return null;
    return student.update(data);
  },

  async deactivate(id) {
    const student = await Student.findByPk(id);
    if (!student) return null;
    return student.update({ is_active: false });
  },

  async reactivate(id) {
    const student = await Student.findByPk(id);
    if (!student) return null;
    return student.update({ is_active: true });
  },

  async findByDni(dni) {
    return Student.findOne({ where: { dni } });
  },

  async destroy(id) {
    const student = await Student.findByPk(id);
    if (!student) return null;
    return student.destroy({ force: true });
  },
};

module.exports = studentRepository;
