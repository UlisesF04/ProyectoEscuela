const { validationResult } = require('express-validator');

const validationMiddleware = (validations) => {
  return async (req, res, next) => {
    for (const validation of validations) {
      await validation.run(req);
    }

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const formattedErrors = errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      }));

      return res.status(400).json({
        status: 'error',
        errors: formattedErrors,
      });
    }

    next();
  };
};

module.exports = validationMiddleware;
