/**
 * Centralized error handling utilities for consistent API error management
 */
import { useState } from 'react';

/**
 * Handle API errors with consistent user feedback
 * @param {Error} error - The error object from API call
 * @param {Function} toast - Chakra UI toast function
 * @param {Object} options - Additional options for error handling
 */
export const handleAPIError = (error, toast, options = {}) => {
  const {
    defaultMessage = 'An unexpected error occurred',
    showToast = true,
    redirectOnAuth = true
  } = options;

  // Handle network errors
  if (!error.response) {
    if (showToast) {
      toast({
        title: 'Network Error',
        description: 'Please check your internet connection and try again.',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    }
    return {
      type: 'NETWORK_ERROR',
      message: 'Network error occurred'
    };
  }

  const { status, data } = error.response;

  // Handle authentication errors
  if (status === 401) {
    if (redirectOnAuth) {
      // Clear authentication data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirect to login
      window.location.href = '/login';
    }
    
    if (showToast) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to continue.',
        status: 'warning',
        duration: 3000,
        isClosable: true
      });
    }
    
    return {
      type: 'AUTH_ERROR',
      message: 'Authentication required'
    };
  }

  // Handle authorization errors
  if (status === 403) {
    if (showToast) {
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to perform this action.',
        status: 'error',
        duration: 4000,
        isClosable: true
      });
    }
    
    return {
      type: 'AUTHORIZATION_ERROR',
      message: 'Access denied'
    };
  }

  // Handle validation errors
  if (status === 400) {
    const message = data?.message || 'Invalid data provided';
    
    if (showToast) {
      toast({
        title: 'Validation Error',
        description: message,
        status: 'error',
        duration: 4000,
        isClosable: true
      });
    }
    
    return {
      type: 'VALIDATION_ERROR',
      message,
      errors: data?.errors || []
    };
  }

  // Handle not found errors
  if (status === 404) {
    const message = data?.message || 'The requested resource was not found';
    
    if (showToast) {
      toast({
        title: 'Not Found',
        description: message,
        status: 'error',
        duration: 4000,
        isClosable: true
      });
    }
    
    return {
      type: 'NOT_FOUND_ERROR',
      message
    };
  }

  // Handle rate limiting
  if (status === 429) {
    if (showToast) {
      toast({
        title: 'Too Many Requests',
        description: 'Please wait a moment before trying again.',
        status: 'warning',
        duration: 5000,
        isClosable: true
      });
    }
    
    return {
      type: 'RATE_LIMIT_ERROR',
      message: 'Rate limit exceeded'
    };
  }

  // Handle server errors
  if (status >= 500) {
    if (showToast) {
      toast({
        title: 'Server Error',
        description: 'Something went wrong on our end. Please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    }
    
    return {
      type: 'SERVER_ERROR',
      message: 'Server error occurred'
    };
  }

  // Handle other errors
  const message = data?.message || defaultMessage;
  
  if (showToast) {
    toast({
      title: 'Error',
      description: message,
      status: 'error',
      duration: 4000,
      isClosable: true
    });
  }
  
  return {
    type: 'UNKNOWN_ERROR',
    message
  };
};

/**
 * Show success message with toast
 * @param {Function} toast - Chakra UI toast function
 * @param {string} title - Success title
 * @param {string} description - Success description
 */
export const showSuccessMessage = (toast, title, description) => {
  toast({
    title,
    description,
    status: 'success',
    duration: 3000,
    isClosable: true
  });
};

/**
 * Show loading toast that can be updated
 * @param {Function} toast - Chakra UI toast function
 * @param {string} message - Loading message
 * @returns {string} - Toast ID for updating
 */
export const showLoadingToast = (toast, message = 'Loading...') => {
  return toast({
    title: message,
    status: 'loading',
    duration: null,
    isClosable: false
  });
};

/**
 * Update existing toast
 * @param {Function} toast - Chakra UI toast function
 * @param {string} id - Toast ID to update
 * @param {Object} options - New toast options
 */
export const updateToast = (toast, id, options) => {
  toast.update(id, {
    duration: 3000,
    isClosable: true,
    ...options
  });
};

/**
 * Custom hook for API operations with built-in error handling
 * @returns {Object} - Object with execute function and state
 */
export const useAPIOperation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const execute = async (operation, errorOptions = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await operation();
      return result;
    } catch (error) {
      const errorInfo = handleAPIError(error, null, { 
        showToast: false, 
        ...errorOptions 
      });
      setError(errorInfo);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  return { execute, loading, error };
};

/**
 * Validate form data before API submission
 * @param {Object} data - Form data to validate
 * @param {Object} rules - Validation rules
 * @returns {Object} - Validation result with errors
 */
export const validateFormData = (data, rules) => {
  const errors = {};
  
  Object.keys(rules).forEach(field => {
    const rule = rules[field];
    const value = data[field];
    
    // Required field validation
    if (rule.required && (!value || (typeof value === 'string' && !value.trim()))) {
      errors[field] = rule.requiredMessage || `${field} is required`;
      return;
    }
    
    // Skip other validations if field is empty and not required
    if (!value) return;
    
    // Minimum length validation
    if (rule.minLength && value.length < rule.minLength) {
      errors[field] = rule.minLengthMessage || `${field} must be at least ${rule.minLength} characters`;
      return;
    }
    
    // Maximum length validation
    if (rule.maxLength && value.length > rule.maxLength) {
      errors[field] = rule.maxLengthMessage || `${field} must be no more than ${rule.maxLength} characters`;
      return;
    }
    
    // Email validation
    if (rule.email && !/\S+@\S+\.\S+/.test(value)) {
      errors[field] = rule.emailMessage || 'Please enter a valid email address';
      return;
    }
    
    // Custom validation function
    if (rule.custom && typeof rule.custom === 'function') {
      const customError = rule.custom(value, data);
      if (customError) {
        errors[field] = customError;
        return;
      }
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Retry failed API operations with exponential backoff
 * @param {Function} operation - The operation to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} baseDelay - Base delay in milliseconds
 * @returns {Promise} - Promise that resolves with operation result
 */
export const retryOperation = async (operation, maxRetries = 3, baseDelay = 1000) => {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Don't retry on client errors (4xx) except 429 (rate limit)
      if (error.response?.status >= 400 && error.response?.status < 500 && error.response?.status !== 429) {
        throw error;
      }
      
      // Don't retry on last attempt
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Wait before retrying with exponential backoff
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};