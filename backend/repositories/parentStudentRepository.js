const { ParentStudent } = require('../models');

const parentStudentRepository = {
  async findById(id) {
    return ParentStudent.findByPk(id);
  },

  async findAll(filter = {}) {
    return ParentStudent.findAll({ where: filter });
  },

  async create(data) {
    return ParentStudent.create(data);
  },

  async delete(id) {
    const link = await ParentStudent.findByPk(id);
    if (!link) return null;
    return link.destroy();
  },

  async findByStudent(studentId) {
    return ParentStudent.findAll({ where: { student_id: studentId } });
  },

  async findByParent(userId) {
    return ParentStudent.findAll({ where: { user_id: userId } });
  },
};

module.exports = parentStudentRepository;
