const authService = require('./auth.service');

const authController = {
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      res.cookie('authToken', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 8 * 60 * 60 * 1000, // 8 hours
      });
      res.status(200).json({ user: result.user });
    } catch (error) {
      next(error);
    }
  },

  async logout(req, res, next) {
    try {
      if (req.user && req.user.id) {
        const { User } = require('../models');
        await User.update({ refresh_token_hash: null }, { where: { id: req.user.id } });
      }
    } catch (err) {
      // Non-blocking: continue even if DB update fails
    }
    res.clearCookie('authToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
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

  async changePassword(req, res, next) {
    try {
      const { current_password, new_password } = req.body;
      const result = await authService.changePassword(req.user.id, current_password, new_password);
      res.json(result);
    } catch (err) { next(err); }
  },

  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refresh(refreshToken);
      res.cookie('authToken', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 8 * 60 * 60 * 1000,
      });
      res.json({ user: result.user });
    } catch (err) { next(err); }
  },
};

module.exports = authController;
