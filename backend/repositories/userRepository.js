const { User } = require('../models');

const userRepository = {
  async findById(id) {
    return User.findByPk(id);
  },

  async findByEmail(email) {
    return User.findOne({ where: { email } });
  },

  async findAll(filter = {}) {
    return User.findAll({ where: filter });
  },

  async create(data) {
    return User.create(data);
  },

  async update(id, data) {
    const user = await User.findByPk(id);
    if (!user) return null;
    return user.update(data);
  },

  async deactivate(id) {
    const user = await User.findByPk(id);
    if (!user) return null;
    return user.update({ is_active: false });
  },

  async findByRole(role) {
    return User.findAll({ where: { role } });
  },

  async destroy(id) {
    const user = await User.findByPk(id);
    if (!user) return null;
    return user.destroy({ force: true });
  },
};

module.exports = userRepository;
