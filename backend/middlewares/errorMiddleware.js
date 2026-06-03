const AppError = require('../utils/AppError');

const errorMiddleware = (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    console.error(`[ERROR] ${statusCode} - ${err.message}`);
    if (statusCode >= 500) {
      console.error(`[ERROR] Stack: ${err.stack?.split('\n').slice(0, 3).join('\n')}`);
    }
  } else {
    console.error('Error:', err);
  }

  if (err instanceof AppError) {
    const message = isProduction && statusCode >= 500
      ? 'Error interno del servidor'
      : err.message;
    return res.status(statusCode).json({ status: 'error', message });
  }

  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        status: 'error',
        message: 'El archivo no debe superar los 5MB',
      });
    }
    return res.status(400).json({
      status: 'error',
      message: 'Error al subir el archivo',
    });
  }

  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      status: 'error',
      message: isProduction ? 'Error de validación de datos' : 'Error de validación',
      ...(isProduction ? {} : { errors: err.errors.map((e) => e.message) }),
    });
  }

  const message = isProduction && statusCode >= 500
    ? 'Error interno del servidor'
    : (err.message || 'Error interno del servidor');

  res.status(statusCode).json({
    status: 'error',
    message,
    ...(isProduction ? {} : { details: err.message }),
  });
};

module.exports = errorMiddleware;
