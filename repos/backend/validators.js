/**
 * Input validation framework
 * Provides utilities for validating and sanitizing user input
 */

/**
 * Validation result object
 */
class ValidationResult {
  constructor() {
    this.errors = [];
    this.valid = true;
  }

  addError(field, message) {
    this.errors.push({ field, message });
    this.valid = false;
  }

  getErrors() {
    return this.errors;
  }

  isValid() {
    return this.valid;
  }
}

/**
 * String validators
 */
const string = {
  required: (value, fieldName) => {
    if (typeof value !== 'string' || value.trim().length === 0) {
      return `${fieldName} is required`;
    }
    return null;
  },

  minLength: (value, min, fieldName) => {
    if (typeof value !== 'string' || value.length < min) {
      return `${fieldName} must be at least ${min} characters`;
    }
    return null;
  },

  maxLength: (value, max, fieldName) => {
    if (typeof value !== 'string' || value.length > max) {
      return `${fieldName} must be at most ${max} characters`;
    }
    return null;
  },

  pattern: (value, regex, fieldName, message) => {
    if (typeof value !== 'string' || !regex.test(value)) {
      return message || `${fieldName} has invalid format`;
    }
    return null;
  },

  email: (value, fieldName) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (typeof value !== 'string' || !emailRegex.test(value)) {
      return `${fieldName} must be a valid email address`;
    }
    return null;
  },

  alphanumeric: (value, fieldName) => {
    const alphanumericRegex = /^[a-zA-Z0-9]+$/;
    if (typeof value !== 'string' || !alphanumericRegex.test(value)) {
      return `${fieldName} must contain only letters and numbers`;
    }
    return null;
  },

  noSpecialChars: (value, fieldName) => {
    const specialCharsRegex = /[<>\"'&]/;
    if (typeof value === 'string' && specialCharsRegex.test(value)) {
      return `${fieldName} contains invalid characters`;
    }
    return null;
  },
};

/**
 * Number validators
 */
const number = {
  required: (value, fieldName) => {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      return `${fieldName} must be a valid number`;
    }
    return null;
  },

  min: (value, min, fieldName) => {
    if (typeof value !== 'number' || value < min) {
      return `${fieldName} must be at least ${min}`;
    }
    return null;
  },

  max: (value, max, fieldName) => {
    if (typeof value !== 'number' || value > max) {
      return `${fieldName} must be at most ${max}`;
    }
    return null;
  },

  integer: (value, fieldName) => {
    if (typeof value !== 'number' || !Number.isInteger(value)) {
      return `${fieldName} must be an integer`;
    }
    return null;
  },

  positive: (value, fieldName) => {
    if (typeof value !== 'number' || value <= 0) {
      return `${fieldName} must be positive`;
    }
    return null;
  },
};

/**
 * Boolean validators
 */
const boolean = {
  required: (value, fieldName) => {
    if (typeof value !== 'boolean') {
      return `${fieldName} must be a boolean`;
    }
    return null;
  },
};

/**
 * Object validators
 */
const object = {
  required: (value, fieldName) => {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      return `${fieldName} must be an object`;
    }
    return null;
  },

  hasKeys: (value, keys, fieldName) => {
    if (typeof value !== 'object' || value === null) {
      return `${fieldName} must be an object`;
    }
    const missingKeys = keys.filter(key => !(key in value));
    if (missingKeys.length > 0) {
      return `${fieldName} is missing required keys: ${missingKeys.join(', ')}`;
    }
    return null;
  },
};

/**
 * Array validators
 */
const array = {
  required: (value, fieldName) => {
    if (!Array.isArray(value)) {
      return `${fieldName} must be an array`;
    }
    return null;
  },

  minLength: (value, min, fieldName) => {
    if (!Array.isArray(value) || value.length < min) {
      return `${fieldName} must contain at least ${min} items`;
    }
    return null;
  },

  maxLength: (value, max, fieldName) => {
    if (!Array.isArray(value) || value.length > max) {
      return `${fieldName} must contain at most ${max} items`;
    }
    return null;
  },
};

/**
 * Sanitization utilities
 */
const sanitize = {
  /**
   * Remove HTML tags from string
   */
  stripHtml: (value) => {
    if (typeof value !== 'string') return value;
    return value.replace(/<[^>]*>/g, '');
  },

  /**
   * Escape HTML special characters
   */
  escapeHtml: (value) => {
    if (typeof value !== 'string') return value;
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },

  /**
   * Trim whitespace
   */
  trim: (value) => {
    if (typeof value !== 'string') return value;
    return value.trim();
  },

  /**
   * Convert to lowercase
   */
  toLowerCase: (value) => {
    if (typeof value !== 'string') return value;
    return value.toLowerCase();
  },

  /**
   * Remove SQL injection patterns
   */
  sanitizeSql: (value) => {
    if (typeof value !== 'string') return value;
    // Remove common SQL injection patterns
    return value.replace(/('|(--)|;|\/\*|\*\/|xp_|exec|execute|select|insert|update|delete|drop|create|alter)/gi, '');
  },
};

/**
 * Validate an object against a schema
 * @param {Object} data - Data to validate
 * @param {Object} schema - Validation schema
 * @returns {ValidationResult}
 *
 * Example schema:
 * {
 *   username: [
 *     (v) => string.required(v, 'username'),
 *     (v) => string.minLength(v, 3, 'username'),
 *     (v) => string.alphanumeric(v, 'username')
 *   ],
 *   age: [
 *     (v) => number.required(v, 'age'),
 *     (v) => number.min(v, 0, 'age'),
 *     (v) => number.integer(v, 'age')
 *   ]
 * }
 */
function validate(data, schema) {
  const result = new ValidationResult();

  for (const [field, validators] of Object.entries(schema)) {
    const value = data[field];

    for (const validator of validators) {
      const error = validator(value);
      if (error) {
        result.addError(field, error);
        break; // Stop at first error for this field
      }
    }
  }

  return result;
}

/**
 * Common validation schemas
 */
const schemas = {
  login: {
    username: [
      (v) => string.required(v, 'username'),
      (v) => string.minLength(v, 1, 'username'),
      (v) => string.maxLength(v, 100, 'username'),
      (v) => string.noSpecialChars(v, 'username'),
    ],
    password: [
      (v) => string.required(v, 'password'),
      (v) => string.minLength(v, 1, 'password'),
      (v) => string.maxLength(v, 1000, 'password'),
    ],
  },

  task: {
    title: [
      (v) => string.required(v, 'title'),
      (v) => string.minLength(v, 1, 'title'),
      (v) => string.maxLength(v, 500, 'title'),
    ],
  },

  exception: {
    rule_id: [
      (v) => string.required(v, 'rule_id'),
      (v) => string.maxLength(v, 200, 'rule_id'),
    ],
    subject_type: [
      (v) => string.required(v, 'subject_type'),
      (v) => string.maxLength(v, 100, 'subject_type'),
    ],
    subject_id: [
      (v) => string.required(v, 'subject_id'),
      (v) => string.maxLength(v, 200, 'subject_id'),
    ],
    reason: [
      (v) => string.required(v, 'reason'),
      (v) => string.maxLength(v, 2000, 'reason'),
    ],
    org_id: [
      (v) => number.required(v, 'org_id'),
      (v) => number.integer(v, 'org_id'),
    ],
    requested_by: [
      (v) => number.required(v, 'requested_by'),
      (v) => number.integer(v, 'requested_by'),
    ],
  },
};

module.exports = {
  ValidationResult,
  string,
  number,
  boolean,
  object,
  array,
  sanitize,
  validate,
  schemas,
};
