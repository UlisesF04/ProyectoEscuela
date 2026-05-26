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
};

module.exports = courseRepository;
