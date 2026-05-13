const { ZodError } = require('zod');

/**
 * Standardized error response format:
 * {
 *   success: false,
 *   error: "Error message",
 *   code: "ERROR_CODE",
 *   details: [], // Validation errors
 *   timestamp: ISO string
 * }
 */

const errorMiddleware = (error, req, res, next) => {
  const timestamp = new Date().toISOString();

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const details = error.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
      code: issue.code,
    }));
    
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      code: 'VALIDATION_ERROR',
      details,
      timestamp,
    });
  }

  // Handle MongoDB validation errors
  if (error.name === 'ValidationError') {
    const details = Object.entries(error.errors).map(([path, err]) => ({
      path,
      message: err.message,
    }));
    
    return res.status(400).json({
      success: false,
      error: 'Database validation error',
      code: 'DB_VALIDATION_ERROR',
      details,
      timestamp,
    });
  }

  // Handle MongoDB duplicate key errors
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    return res.status(409).json({
      success: false,
      error: `${field} already exists`,
      code: 'DUPLICATE_KEY_ERROR',
      field,
      timestamp,
    });
  }

  // Handle authentication errors
  if (error.name === 'JsonWebTokenError' || error.message === 'Unauthorized') {
    return res.status(401).json({
      success: false,
      error: 'Authentication failed',
      code: 'AUTH_ERROR',
      timestamp,
    });
  }

  // Handle authorization errors
  if (error.message === 'Forbidden') {
    return res.status(403).json({
      success: false,
      error: 'Access forbidden',
      code: 'FORBIDDEN_ERROR',
      timestamp,
    });
  }

  // Handle not found errors
  if (error.message === 'Not found' || error.status === 404) {
    return res.status(404).json({
      success: false,
      error: 'Resource not found',
      code: 'NOT_FOUND_ERROR',
      timestamp,
    });
  }

  // Default error handling
  console.error('❌ Error:', error.message, error.stack);

  const status = error.status || error.statusCode || 500;
  const message = error.message || 'Internal server error';
  const code = error.code || 'INTERNAL_SERVER_ERROR';

  res.status(status).json({
    success: false,
    error: message,
    code,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    timestamp,
  });
};

module.exports = errorMiddleware;
