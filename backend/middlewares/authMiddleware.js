const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Token no proporcionado', 401));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret-dev-key');
    req.user = decoded;
    next();
  } catch (error) {
    return next(new AppError('Token inválido o expirado', 401));
  }
};

module.exports = authMiddleware;
