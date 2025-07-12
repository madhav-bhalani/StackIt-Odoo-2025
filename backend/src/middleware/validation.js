const { validationResult } = require('express-validator');
const { sendValidationError } = require('../utils/response');

/**
 * Validation middleware
 * Checks for validation errors and returns them if any
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value
    }));
    
    return sendValidationError(res, errorMessages);
  }
  
  next();
};

/**
 * Custom validation for pagination parameters
 */
const validatePagination = (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;
  
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  
  if (isNaN(pageNum) || pageNum < 1) {
    return sendValidationError(res, [{
      field: 'page',
      message: 'Page must be a positive integer',
      value: page
    }]);
  }
  
  if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
    return sendValidationError(res, [{
      field: 'limit',
      message: 'Limit must be between 1 and 100',
      value: limit
    }]);
  }
  
  req.pagination = {
    page: pageNum,
    limit: limitNum,
    skip: (pageNum - 1) * limitNum
  };
  
  next();
};

/**
 * Custom validation for search parameters
 */
const validateSearch = (req, res, next) => {
  const { q, tags, sort, filter } = req.query;
  
  // Validate search query length
  if (q && q.length > 200) {
    return sendValidationError(res, [{
      field: 'q',
      message: 'Search query too long (max 200 characters)',
      value: q
    }]);
  }
  
  // Validate tags format (comma-separated)
  if (tags && !/^[a-zA-Z0-9,\s]+$/.test(tags)) {
    return sendValidationError(res, [{
      field: 'tags',
      message: 'Tags contain invalid characters',
      value: tags
    }]);
  }
  
  // Validate sort parameter
  const validSortOptions = ['newest', 'oldest', 'votes', 'answers', 'views'];
  if (sort && !validSortOptions.includes(sort)) {
    return sendValidationError(res, [{
      field: 'sort',
      message: 'Invalid sort option',
      value: sort
    }]);
  }
  
  // Validate filter parameter
  const validFilterOptions = ['all', 'unanswered', 'answered', 'accepted'];
  if (filter && !validFilterOptions.includes(filter)) {
    return sendValidationError(res, [{
      field: 'filter',
      message: 'Invalid filter option',
      value: filter
    }]);
  }
  
  next();
};

/**
 * Custom validation for vote parameters
 */
const validateVote = (req, res, next) => {
  const { voteType } = req.body;
  
  if (!voteType || !['UP', 'DOWN'].includes(voteType)) {
    return sendValidationError(res, [{
      field: 'voteType',
      message: 'Vote type must be either UP or DOWN',
      value: voteType
    }]);
  }
  
  next();
};

/**
 * Custom validation for content length
 */
const validateContentLength = (maxLength = 10000) => {
  return (req, res, next) => {
    const { content, description } = req.body;
    const textToCheck = content || description;
    
    if (textToCheck && textToCheck.length > maxLength) {
      return sendValidationError(res, [{
        field: content ? 'content' : 'description',
        message: `Content too long (max ${maxLength} characters)`,
        value: textToCheck.substring(0, 100) + '...'
      }]);
    }
    
    next();
  };
};

module.exports = {
  validate,
  validatePagination,
  validateSearch,
  validateVote,
  validateContentLength
}; 