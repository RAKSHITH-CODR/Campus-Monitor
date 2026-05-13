/**
 * Pagination Middleware
 * Extracts and validates pagination params from query string
 * Usage: router.get('/endpoint', paginationMiddleware, controller)
 */

const paginationMiddleware = (req, res, next) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 15));

  req.pagination = {
    page,
    limit,
    skip: (page - 1) * limit,
  };

  next();
};

/**
 * Format pagination response
 * @param {Array} data - Array of items
 * @param {Number} total - Total count in database
 * @param {Object} pagination - Pagination object from middleware
 */
const formatPaginatedResponse = (data, total, pagination) => {
  return {
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      pages: Math.ceil(total / pagination.limit),
    },
  };
};

module.exports = { paginationMiddleware, formatPaginatedResponse };
