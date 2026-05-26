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
};

module.exports = studentRepository;
