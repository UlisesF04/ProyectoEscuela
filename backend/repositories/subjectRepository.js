const { Subject } = require('../models');

const subjectRepository = {
  async findById(id) {
    return Subject.findByPk(id);
  },

  async findByCourseId(courseId) {
    return Subject.findAll({ where: { course_id: courseId } });
  },

  async findAll(filter = {}) {
    return Subject.findAll({ where: filter });
  },

  async create(data) {
    return Subject.create(data);
  },

  async update(id, data) {
    const subject = await Subject.findByPk(id);
    if (!subject) return null;
    return subject.update(data);
  },

  async destroy(id) {
    const subject = await Subject.findByPk(id);
    if (!subject) return null;
    return subject.destroy();
  },
};

module.exports = subjectRepository;
