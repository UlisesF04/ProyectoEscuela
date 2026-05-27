const usersService = require('./users.service');

const usersController = {
  /**
   * Create a new user (docente, preceptor, or padre)
   * POST /api/v1/users
   */
  async createUser(req, res, next) {
    try {
      const user = await usersService.createUser(req.body);
      res.status(201).json({
        status: 'success',
        message: 'Usuario creado exitosamente',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get all users of a specific role
   * GET /api/v1/users/role/:role
   */
  async getUsersByRole(req, res, next) {
    try {
      const { role } = req.params;
      const users = await usersService.getUsersByRole(role);
      res.status(200).json({
        status: 'success',
        data: users,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get a specific user by ID
   * GET /api/v1/users/:id
   */
  async getUserById(req, res, next) {
    try {
      const { id } = req.params;
      const user = await usersService.getUserById(id);
      res.status(200).json({
        status: 'success',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get all users (excluding admins)
   * GET /api/v1/users
   */
  async getAllUsers(req, res, next) {
    try {
      const users = await usersService.getAllUsers();
      res.status(200).json({
        status: 'success',
        data: users,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update a user
   * PUT /api/v1/users/:id
   */
  async updateUser(req, res, next) {
    try {
      const { id } = req.params;
      const user = await usersService.updateUser(id, req.body);
      res.status(200).json({
        status: 'success',
        message: 'Usuario actualizado exitosamente',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete a user
   * DELETE /api/v1/users/:id
   */
  async deleteUser(req, res, next) {
    try {
      const { id } = req.params;
      await usersService.deleteUser(id);
      res.status(200).json({
        status: 'success',
        message: 'Usuario eliminado exitosamente',
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get multiple users by IDs
   * POST /api/v1/users/bulk/get
   */
  async getUsersByIds(req, res, next) {
    try {
      const { ids } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({
          status: 'error',
          message: 'ids debe ser un array no vacío',
        });
      }

      const users = await usersService.getUsersByIds(ids);
      res.status(200).json({
        status: 'success',
        data: users,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = usersController;
