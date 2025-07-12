/**
 * Utility functions for standardized API responses
 */

/**
 * Send success response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {*} data - Response data
 * @param {string} message - Success message
 */
const sendSuccess = (res, statusCode = 200, data = null, message = 'Success') => {
  res.status(statusCode).json({
    success: true,
    data,
    message
  });
};

/**
 * Send error response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {*} details - Additional error details
 */
const sendError = (res, statusCode = 500, message = 'Internal Server Error', details = null) => {
  const response = {
    success: false,
    error: message,
    statusCode
  };

  if (details && process.env.NODE_ENV === 'development') {
    response.details = details;
  }

  res.status(statusCode).json(response);
};

/**
 * Send validation error response
 * @param {Object} res - Express response object
 * @param {Array} errors - Validation errors array
 */
const sendValidationError = (res, errors) => {
  res.status(400).json({
    success: false,
    error: 'Validation failed',
    statusCode: 400,
    details: errors
  });
};

/**
 * Send paginated response
 * @param {Object} res - Express response object
 * @param {Array} data - Response data
 * @param {Object} pagination - Pagination info
 * @param {string} message - Success message
 */
const sendPaginated = (res, data, pagination, message = 'Success') => {
  res.status(200).json({
    success: true,
    data,
    pagination,
    message
  });
};

module.exports = {
  sendSuccess,
  sendError,
  sendValidationError,
  sendPaginated
}; 