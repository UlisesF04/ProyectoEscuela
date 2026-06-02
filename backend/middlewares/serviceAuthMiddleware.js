const AppError = require('../utils/AppError');

const serviceAuthMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('Se requiere token de servicio', 401);
  }

  const token = authHeader.split(' ')[1];
  const serviceKey = process.env.SERVICE_API_KEY;

  if (!serviceKey || token !== serviceKey) {
    throw new AppError('Token de servicio inválido', 401);
  }

  next();
};

module.exports = serviceAuthMiddleware;
