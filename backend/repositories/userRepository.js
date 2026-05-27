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

  async delete(id) {
    const user = await User.findByPk(id);
    if (!user) return null;
    return user.destroy();
  },

  async findByRole(role) {
    return User.findAll({ where: { role } });
  },
};

module.exports = userRepository;
