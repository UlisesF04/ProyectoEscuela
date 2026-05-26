const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userRepository = require('../../repositories/userRepository');
const AppError = require('../../utils/AppError');

const JWT_SECRET = process.env.JWT_SECRET || 'secret-dev-key';
const JWT_EXPIRES_IN = '8h';

const authService = {
  async login(email, password) {
    const user = await userRepository.findByEmail(email);

    if (!user) {
      throw new AppError('Credenciales inválidas', 401);
    }

    if (!user.is_active) {
      throw new AppError('Tu cuenta ha sido desactivada', 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      throw new AppError('Credenciales inválidas', 401);
    }

    const payload = { id: user.id, role: user.role, email: user.email };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return {
      token,
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

    const { password_hash, ...userData } = user.toJSON();
    return userData;
  },
};

module.exports = authService;
