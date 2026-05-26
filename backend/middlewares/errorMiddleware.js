const AppError = require('../utils/AppError');

const errorMiddleware = (err, req, res, next) => {
  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', err);
  }

  // If it's our custom AppError, use its status code
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }

  // Handle Sequelize validation errors
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      status: 'error',
      message: 'Error de validación',
      errors: err.errors.map((e) => e.message),
    });
  }

  // Default 500 for unhandled errors
  res.status(err.status || 500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'production'
      ? 'Error interno del servidor'
      : err.message,
  });
};

module.exports = errorMiddleware;
