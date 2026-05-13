/**
 * Role-based Access Control Middleware
 * Protects routes based on user roles
 * Usage: router.get('/admin-only', authMiddleware, roleMiddleware('admin'), controller)
 */

const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        code: 'AUTH_REQUIRED',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
        code: 'FORBIDDEN',
        requiredRole: allowedRoles,
        userRole: req.user.role,
      });
    }

    next();
  };
};

module.exports = roleMiddleware;
