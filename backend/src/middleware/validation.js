const Joi = require('joi');

/**
 * Middleware for validating request body against a Joi schema
 * @param {Object} schema - Joi validation schema
 * @returns {Function} Express middleware function
 */
exports.validateBody = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);

    if (error) {
      return res.status(400).json({
        status: 'error',
        message: error.details[0].message.replace(/\"/g, ''),
      });
    }

    next();
  };
};

/**
 * Middleware for validating request params against a Joi schema
 * @param {Object} schema - Joi validation schema
 * @returns {Function} Express middleware function
 */
exports.validateParams = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.params);

    if (error) {
      return res.status(400).json({
        status: 'error',
        message: error.details[0].message.replace(/\"/g, ''),
      });
    }

    next();
  };
};

/**
 * Middleware for validating request query against a Joi schema
 * @param {Object} schema - Joi validation schema
 * @returns {Function} Express middleware function
 */
exports.validateQuery = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.query);

    if (error) {
      return res.status(400).json({
        status: 'error',
        message: error.details[0].message.replace(/\"/g, ''),
      });
    }

    next();
  };
};
