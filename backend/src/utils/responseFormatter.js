/**
 * Response Utility - Standardized response formats
 */

const successResponse = (data, message = 'Success', code = 'SUCCESS') => {
  return {
    success: true,
    message,
    code,
    data,
    timestamp: new Date().toISOString(),
  };
};

const errorResponse = (error, code = 'ERROR', status = 500) => {
  const response = {
    success: false,
    error,
    code,
    timestamp: new Date().toISOString(),
  };
  return { response, status };
};

module.exports = {
  successResponse,
  errorResponse,
};
