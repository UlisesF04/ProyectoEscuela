const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const userRepository = require('../../repositories/userRepository');
const { User } = require('../../models');
const AppError = require('../../utils/AppError');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '8h';
const LOCKOUT_THRESHOLD = 5;
const LOCKOUT_DURATION_MS = 30 * 60 * 1000;

const authService = {
  async login(email, password) {
    const user = await User.scope('withPassword').findOne({ where: { email } });

    if (!user) {
      throw new AppError('Credenciales inválidas', 401);
    }

    if (!user.is_active) {
      throw new AppError('Tu cuenta ha sido desactivada', 401);
    }

    if (user.failed_attempts >= LOCKOUT_THRESHOLD && user.locked_until && new Date() < new Date(user.locked_until)) {
      const remaining = Math.ceil((new Date(user.locked_until) - new Date()) / 60000);
      throw new AppError(`Cuenta bloqueada. Intente nuevamente en ${remaining} minuto(s)`, 423);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      const attempts = (user.failed_attempts || 0) + 1;
      const updateData = { failed_attempts: attempts };
      if (attempts >= LOCKOUT_THRESHOLD) {
        updateData.locked_until = new Date(Date.now() + LOCKOUT_DURATION_MS);
      }
      await user.update(updateData);
      throw new AppError('Credenciales inválidas', 401);
    }

    await user.update({ failed_attempts: 0, locked_until: null });

    const payload = { id: user.id, role: user.role };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    const refreshToken = crypto.randomBytes(40).toString('hex');
    const refreshHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    await user.update({ refresh_token_hash: refreshHash });

    return {
      token,
      refreshToken,
      user: {
        id: user.id,
        role: user.role,
        first_name: user.first_name,
        last_name: user.last_name,
      },
    };
  },

  async getMe(userId) {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    const { password_hash, refresh_token_hash, failed_attempts, locked_until, ...userData } = user.toJSON();
    return userData;
  },

  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.scope('withPassword').findByPk(userId);
    if (!user) throw new AppError('Usuario no encontrado', 404);

    const valid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!valid) throw new AppError('Contraseña actual incorrecta', 401);

    if (newPassword.length < 8) {
      throw new AppError('La nueva contraseña debe tener al menos 8 caracteres', 400);
    }

    const newHash = await bcrypt.hash(newPassword, 12);
    await user.update({ password_hash: newHash, failed_attempts: 0, locked_until: null });
    return { message: 'Contraseña actualizada exitosamente' };
  },

  async refresh(refreshToken) {
    const hash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const user = await User.scope('withPassword').findOne({
      where: { refresh_token_hash: hash },
    });

    if (!user) {
      throw new AppError('Refresh token inválido', 401);
    }

    if (!user.is_active) {
      throw new AppError('Tu cuenta ha sido desactivada', 401);
    }

    const payload = { id: user.id, role: user.role };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    const newRefreshToken = crypto.randomBytes(40).toString('hex');
    const newRefreshHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex');
    await user.update({ refresh_token_hash: newRefreshHash });

    return {
      token,
      refreshToken: newRefreshToken,
      user: {
        id: user.id,
        role: user.role,
        first_name: user.first_name,
        last_name: user.last_name,
      },
    };
  },
};

module.exports = authService;
