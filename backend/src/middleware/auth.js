const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Case = require('../models/Case');
const { verifyToken } = require('../config/jwt');

/**
 * Middleware to protect routes that require authentication
 */
exports.protect = async (req, res, next) => {
  let token;

  // Check if token exists in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Check if token exists
  if (!token) {
    return res.status(401).json({
      status: 'error',
      message: 'Not authorized to access this route'
    });
  }

  try {
    // Verify token
    const decoded = verifyToken(token);

    // Check if user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'The user belonging to this token no longer exists'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        status: 'error',
        message: 'This user account has been deactivated'
      });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      status: 'error',
      message: 'Not authorized to access this route'
    });
  }
};

/**
 * Middleware to restrict access to specific roles
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

/**
 * Optional authentication middleware for routes that can work with or without auth
 */
exports.optionalAuth = async (req, res, next) => {
  let token;

  // Check if token exists in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // If no token, continue without user
  if (!token) {
    req.user = null;
    return next();
  }

  try {
    // Verify token
    const decoded = verifyToken(token);

    // Check if user still exists
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      req.user = null;
      return next();
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    // If token is invalid, continue without user
    req.user = null;
    next();
  }
};

/**
 * Middleware to verify case ownership
 * Must be used after protect middleware
 */
exports.verifyCaseOwnership = async (req, res, next) => {
  try {
    const caseId = req.params.caseId;
    const userId = req.user._id;

    // Find case and verify ownership
    const caseItem = await Case.findOne({
      _id: caseId,
      createdBy: userId
    });

    if (!caseItem) {
      return res.status(404).json({
        status: 'error',
        message: 'Case not found or you do not have access to this case'
      });
    }

    // Attach case to request for use in controllers
    req.case = caseItem;
    next();
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Server error'
    });
  }
};