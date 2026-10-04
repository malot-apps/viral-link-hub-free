/**
 * Admin JWT Authentication Middleware
 * Enforces Bearer token validation for all administrative and modification endpoints
 */
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'viral_link_hub_jwt_super_secret_key_2026';

const adminAuthMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      error: 'Access denied. Missing Authorization header.',
    });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({
      success: false,
      error: 'Invalid Authorization header format. Expected "Bearer <token>".',
    });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded.isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden. Admin privileges required.',
      });
    }

    req.admin = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Session expired. Please log in again.',
      });
    }

    return res.status(401).json({
      success: false,
      error: 'Invalid token signature.',
    });
  }
};

module.exports = adminAuthMiddleware;
