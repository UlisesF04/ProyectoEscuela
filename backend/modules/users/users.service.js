const bcrypt = require('bcrypt');
const userRepository = require('../../repositories/userRepository');
const AppError = require('../../utils/AppError');

const VALID_ROLES = ['docente', 'preceptor', 'padre'];
const BCRYPT_ROUNDS = 12;

const usersService = {
  /**
   * Create a new user (teacher, preceptor, or parent)
   * @param {Object} data - User data (email, password, first_name, last_name, role, phone_whatsapp)
   * @returns {Object} Created user (without password_hash)
   */
  async createUser(data) {
    const { email, password, first_name, last_name, role, phone_whatsapp } = data;

    // Validate role
    if (!VALID_ROLES.includes(role)) {
      throw new AppError(
        `Rol inválido. Los roles permitidos son: ${VALID_ROLES.join(', ')}`,
        400
      );
    }

    // Check if email already exists
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new AppError('El correo electrónico ya está registrado', 409);
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    // Create user
    const user = await userRepository.create({
      email,
      password_hash,
      first_name,
      last_name,
      role,
      phone_whatsapp: phone_whatsapp || null,
      is_active: true,
    });

    // Return user without password hash
    const { password_hash: _, ...userWithoutPassword } = user.toJSON();
    return userWithoutPassword;
  },

  /**
   * Get all users of a specific role
   * @param {String} role - The role to filter by
   * @returns {Array} List of users
   */
  async getUsersByRole(role) {
    if (!VALID_ROLES.includes(role)) {
      throw new AppError(
        `Rol inválido. Los roles permitidos son: ${VALID_ROLES.join(', ')}`,
        400
      );
    }

    const users = await userRepository.findByRole(role);

    // Remove password_hash from all users
    return users.map((user) => {
      const { password_hash: _, ...userWithoutPassword } = user.toJSON();
      return userWithoutPassword;
    });
  },

  /**
   * Get a specific user by ID
   * @param {Number} userId - The user ID
   * @returns {Object} User data (without password)
   */
  async getUserById(userId) {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    const { password_hash: _, ...userWithoutPassword } = user.toJSON();
    return userWithoutPassword;
  },

  /**
   * Update a user (partial or complete update)
   * @param {Number} userId - The user ID
   * @param {Object} data - Fields to update (email, first_name, last_name, phone_whatsapp, is_active)
   * @returns {Object} Updated user (without password)
   */
  async updateUser(userId, data) {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    // Check if trying to update email and if it's already taken
    if (data.email && data.email !== user.email) {
      const existingUser = await userRepository.findByEmail(data.email);
      if (existingUser) {
        throw new AppError('El correo electrónico ya está registrado', 409);
      }
    }

    // Prevent role changes from service (role is immutable after creation)
    if (data.role) {
      throw new AppError('No se puede cambiar el rol de un usuario', 400);
    }

    // Prevent password changes from this endpoint (separate endpoint should handle this)
    if (data.password_hash || data.password) {
      throw new AppError('Use el endpoint de cambio de contraseña para actualizar la contraseña', 400);
    }

    const updatedUser = await userRepository.update(userId, data);

    const { password_hash: _, ...userWithoutPassword } = updatedUser.toJSON();
    return userWithoutPassword;
  },

  /**
   * Delete a user by ID
   * @param {Number} userId - The user ID
   * @returns {void}
   */
  async deleteUser(userId) {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    // Prevent admin users from being deleted
    if (user.role === 'admin') {
      throw new AppError('No se pueden eliminar usuarios con rol de administrador', 400);
    }

    await userRepository.delete(userId);
  },

  /**
   * Get all users (excluding admins for safety)
   * @returns {Array} List of all non-admin users
   */
  async getAllUsers() {
    const users = await userRepository.findAll({ role: { [require('sequelize').Op.ne]: 'admin' } });

    // Remove password_hash from all users
    return users.map((user) => {
      const { password_hash: _, ...userWithoutPassword } = user.toJSON();
      return userWithoutPassword;
    });
  },

  /**
   * Bulk get multiple users by IDs
   * @param {Array} userIds - Array of user IDs
   * @returns {Array} List of users
   */
  async getUsersByIds(userIds) {
    const { Op } = require('sequelize');
    const users = await userRepository.findAll({ id: { [Op.in]: userIds } });

    return users.map((user) => {
      const { password_hash: _, ...userWithoutPassword } = user.toJSON();
      return userWithoutPassword;
    });
  },
};

module.exports = usersService;
