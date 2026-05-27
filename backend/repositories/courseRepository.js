const { Course } = require('../models');

const courseRepository = {
  async findById(id) {
    return Course.findByPk(id);
  },

  async findAll(filter = {}) {
    return Course.findAll({ where: filter });
  },

  async create(data) {
    return Course.create(data);
  },

  async update(id, data) {
    const course = await Course.findByPk(id);
    if (!course) return null;
    return course.update(data);
  },

  async destroy(id) {
    const course = await Course.findByPk(id);
    if (!course) return null;
    return course.destroy();
  },
};

module.exports = courseRepository;
