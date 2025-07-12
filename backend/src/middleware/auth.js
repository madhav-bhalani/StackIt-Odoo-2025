const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { sendError } = require('../utils/response');

const prisma = new PrismaClient();

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request object
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 401, 'Access denied. No token provided.');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (!token) {
      return sendError(res, 401, 'Access denied. No token provided.');
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    if (!user) {
      return sendError(res, 401, 'Invalid token. User not found.');
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return sendError(res, 401, 'Invalid token.');
    }
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 401, 'Token expired.');
    }
    return sendError(res, 500, 'Authentication error.');
  }
};

/**
 * Optional authentication middleware
 * Attaches user if token is provided, but doesn't require it
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.substring(7);
    
    if (!token) {
      req.user = null;
      return next();
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    req.user = user || null;
    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

/**
 * Role-based authorization middleware
 * @param {string[]} roles - Array of allowed roles
 */
const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 401, 'Access denied. Authentication required.');
    }

    if (roles.length && !roles.includes(req.user.role)) {
      return sendError(res, 403, 'Access denied. Insufficient permissions.');
    }

    next();
  };
};

/**
 * Owner authorization middleware
 * Checks if the current user owns the resource
 * @param {Function} getResourceOwnerId - Function to get resource owner ID
 */
const authorizeOwner = (getResourceOwnerId) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return sendError(res, 401, 'Access denied. Authentication required.');
      }

      const ownerId = await getResourceOwnerId(req);
      
      if (!ownerId) {
        return sendError(res, 404, 'Resource not found.');
      }

      if (req.user.id !== ownerId && req.user.role !== 'ADMIN') {
        return sendError(res, 403, 'Access denied. You can only modify your own resources.');
      }

      next();
    } catch (error) {
      return sendError(res, 500, 'Authorization error.');
    }
  };
};

module.exports = {
  authenticate,
  optionalAuth,
  authorize,
  authorizeOwner
}; 