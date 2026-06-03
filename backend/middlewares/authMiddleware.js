const jwt = require('jsonwebtoken');
const { User } = require('../models');
const AppError = require('../utils/AppError');

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  let token = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies && req.cookies.authToken) {
    token = req.cookies.authToken;
  }

  if (!token) {
    return next(new AppError('Token no proporcionado', 401));
  }

  try {
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      throw new AppError('JWT_SECRET no configurado', 500);
    }
    const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
    const user = await User.findByPk(decoded.id);
    if (!user || !user.is_active) {
      return next(new AppError('Usuario no encontrado o inactivo', 401));
    }
    req.user = { id: user.id, role: user.role, email: user.email };
    next();
  } catch (error) {
    return next(new AppError('Token inválido o expirado', 401));
  }
};

module.exports = authMiddleware;
