const AppError = require('../utils/AppError');

const roleMiddleware = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('No tienes permisos para acceder a este recurso', 403));
    }
    next();
  };
};

module.exports = roleMiddleware;
