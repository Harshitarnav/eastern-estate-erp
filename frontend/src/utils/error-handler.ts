/**
 * Error Handler Utility
 * Provides user-friendly error messages and form validation
 */

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  email?: boolean;
  phone?: boolean;
  pattern?: RegExp;
  custom?: (value: any) => boolean;
  label?: string;
}

export interface ValidationRules {
  [field: string]: ValidationRule;
}

/**
 * Handle API errors and return user-friendly messages
 */
export const handleApiError = (error: any): string => {
  // Network error (no response from server)
  if (error.request && !error.response) {
    return 'No response from server. Please check your internet connection.';
  }

  // Server responded with error
  if (error.response) {
    const { status, data } = error.response;

    // Return validation errors if available
    if (data?.errors && Array.isArray(data.errors) && data.errors.length > 0) {
      return data.errors.join('\n• ');
    }

    // Return server message if available (but not generic validation message)
    if (data?.message && data.message !== 'Please fix the following errors and try again.') {
      return data.message;
    }

    // If we have generic validation message but no errors array, return helpful message
    if (data?.message === 'Please fix the following errors and try again.' && !data?.errors) {
      return 'Invalid input. Please check all required fields.';
    }

    // Default messages by status code
    const errorMessages: Record<number, string> = {
      400: 'Invalid request. Please check your input and try again.',
      401: 'Please log in to continue.',
      403: "You don't have permission to perform this action.",
      404: 'The requested resource was not found.',
      409: 'This record already exists or conflicts with existing data.',
      422: 'The data provided is invalid. Please check and try again.',
      429: 'Too many requests. Please slow down and try again later.',
      500: 'Server error. Please try again later.',
      502: 'Bad gateway. The server is temporarily unavailable.',
      503: 'Service temporarily unavailable. Please try again later.',
    };

    return errorMessages[status] || `An error occurred (${status}). Please try again.`;
  }

  // Unknown error
  if (error.message) {
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
};

/**
 * Validate form data against rules
 */
export const validateForm = (
  data: Record<string, any>,
  rules: ValidationRules,
): string[] => {
  const errors: string[] = [];

  Object.keys(rules).forEach((field) => {
    const value = data[field];
    const rule = rules[field];
    const label = rule.label || field.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());

    // Required validation
    if (rule.required && (value === undefined || value === null || value === '')) {
      errors.push(`${label} is required`);
      return;
    }

    // Skip other validations if value is empty and not required
    if (!value && !rule.required) return;

    // String length validations
    if (typeof value === 'string') {
      if (rule.minLength && value.length < rule.minLength) {
        errors.push(`${label} must be at least ${rule.minLength} characters`);
      }
      if (rule.maxLength && value.length > rule.maxLength) {
        errors.push(`${label} must not exceed ${rule.maxLength} characters`);
      }
    }

    // Number validations
    if (typeof value === 'number' || !isNaN(Number(value))) {
      const numValue = Number(value);
      if (rule.min !== undefined && numValue < rule.min) {
        errors.push(`${label} must be at least ${rule.min}`);
      }
      if (rule.max !== undefined && numValue > rule.max) {
        errors.push(`${label} must not exceed ${rule.max}`);
      }
    }

    // Email validation
    if (rule.email && !isValidEmail(value)) {
      errors.push(`${label} must be a valid email address`);
    }

    // Phone validation
    if (rule.phone && !isValidPhone(value)) {
      errors.push(`${label} must be a valid phone number`);
    }

    // Pattern validation
    if (rule.pattern && !rule.pattern.test(value)) {
      errors.push(`${label} format is invalid`);
    }

    // Custom validation
    if (rule.custom && !rule.custom(value)) {
      errors.push(`${label} is invalid`);
    }
  });

  return errors;
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate Indian phone number
 */
export const isValidPhone = (phone: string): boolean => {
  // Remove spaces, dashes, and parentheses
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  
  // Indian phone number patterns
  // +91XXXXXXXXXX or 91XXXXXXXXXX or XXXXXXXXXX (10 digits)
  const phoneRegex = /^(\+91|91)?[6-9]\d{9}$/;
  return phoneRegex.test(cleaned);
};

/**
 * Format validation errors for display
 */
export const formatValidationErrors = (errors: string[]): string => {
  if (errors.length === 0) return '';
  if (errors.length === 1) return errors[0];
  return errors.join('\n• ');
};

/**
 * Check if error is a validation error
 */
export const isValidationError = (error: any): boolean => {
  return error?.response?.status === 422 || error?.response?.status === 400;
};

/**
 * Check if error is an authentication error
 */
export const isAuthError = (error: any): boolean => {
  return error?.response?.status === 401;
};

/**
 * Check if error is a permission error
 */
export const isPermissionError = (error: any): boolean => {
  return error?.response?.status === 403;
};

/**
 * Show error notification (to be used with toast library)
 */
export const showErrorNotification = (error: any, fallbackMessage?: string): string => {
  const message = handleApiError(error) || fallbackMessage || 'An error occurred';
  
  // In a real app, you would use a toast library here
  // toast.error(message);
  
  return message;
};

/**
 * Common validation rules for reuse
 */
export const commonRules = {
  email: {
    required: true,
    email: true,
    label: 'Email',
  },
  phone: {
    required: true,
    phone: true,
    label: 'Phone Number',
  },
  name: {
    required: true,
    minLength: 2,
    maxLength: 100,
    label: 'Name',
  },
  amount: {
    required: true,
    min: 0,
    label: 'Amount',
  },
  date: {
    required: true,
    label: 'Date',
  },
  description: {
    maxLength: 500,
    label: 'Description',
  },
};
