const authService = require('./auth.service');

const authController = {
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  logout(req, res) {
    res.status(200).json({ message: 'Sesión cerrada exitosamente' });
  },

  async me(req, res, next) {
    try {
      const user = await authService.getMe(req.user.id);
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = authController;
