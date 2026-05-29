const bcrypt = require('bcrypt');
const userRepository = require('../../repositories/userRepository');
const { ParentStudent, TeacherSubject } = require('../../models');
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

    const users = await userRepository.findAll({ role, is_active: true });

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
   * Deactivate a user by ID (soft delete)
   * @param {Number} userId - The user ID
   * @returns {void}
   */
  async deactivateUser(userId) {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    // Prevent admin users from being deactivated
    if (user.role === 'admin') {
      throw new AppError('No se pueden desactivar usuarios con rol de administrador', 400);
    }

    // Prevent already deactivated users
    if (!user.is_active) {
      throw new AppError('El usuario ya está desactivado', 409);
    }

    await userRepository.deactivate(userId);
  },

  /**
   * Permanently delete a user (hard delete).
   * Only allowed if the user is already deactivated (is_active = false).
   * Cleans up parent_student and teacher_subject references before deletion.
   * Admin users can never be permanently deleted.
   * @param {Number} userId - The user ID
   * @returns {void}
   */
  async permanentDeleteUser(userId) {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    // Prevent admin users from being deleted
    if (user.role === 'admin') {
      throw new AppError('No se pueden eliminar usuarios con rol de administrador', 400);
    }

    // Require soft-delete first (safety measure)
    if (user.is_active) {
      throw new AppError('Debe desactivar el usuario antes de eliminarlo definitivamente', 400);
    }

    // Cleanup FK references
    await ParentStudent.destroy({ where: { user_id: userId }, force: true });
    await TeacherSubject.destroy({ where: { user_id: userId }, force: true });

    await userRepository.destroy(userId);
  },

  /**
   * Get all users (excluding admins). Includes both active and inactive.
   * @returns {Array} List of non-admin users
   */
  async getAllUsers(filters = {}) {
    const { Op } = require('sequelize');
    const where = {
      role: { [Op.ne]: 'admin' },
    };

    if (filters.is_active !== undefined) {
      where.is_active = filters.is_active === 'true' || filters.is_active === true;
    }

    const users = await userRepository.findAll(where);

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
