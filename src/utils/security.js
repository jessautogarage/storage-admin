import DOMPurify from 'dompurify';

/**
 * Security utilities for input validation and sanitization
 */

// Rate limiting storage (in-memory, use Redis in production)
const rateLimitStore = new Map();

/**
 * Input sanitization utilities
 */
export const sanitize = {
  // HTML sanitization
  html: (input) => {
    if (!input) return '';
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'u', 'br', 'p'],
      ALLOWED_ATTR: []
    });
  },

  // Plain text sanitization
  text: (input) => {
    if (!input) return '';
    return String(input)
      .replace(/[<>]/g, '') // Remove < and >
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .trim();
  },

  // Email sanitization
  email: (input) => {
    if (!input) return '';
    return String(input)
      .toLowerCase()
      .trim()
      .replace(/[^\w@.-]/g, ''); // Only allow word chars, @, ., -
  },

  // Phone number sanitization
  phone: (input) => {
    if (!input) return '';
    return String(input)
      .replace(/[^\d+()-\s]/g, '') // Only allow digits, +, (), -, space
      .trim();
  },

  // URL sanitization
  url: (input) => {
    if (!input) return '';
    try {
      const url = new URL(input);
      // Only allow http and https protocols
      if (!['http:', 'https:'].includes(url.protocol)) {
        return '';
      }
      return url.toString();
    } catch {
      return '';
    }
  },

  // SQL injection prevention for search queries
  searchQuery: (input) => {
    if (!input) return '';
    return String(input)
      .replace(/['";\\]/g, '') // Remove quotes and backslashes
      .replace(/\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b/gi, '') // Remove SQL keywords
      .trim()
      .substring(0, 100); // Limit length
  },

  // File name sanitization
  filename: (input) => {
    if (!input) return '';
    return String(input)
      .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace invalid chars with underscore
      .replace(/\.\./g, '_') // Prevent directory traversal
      .substring(0, 255); // Limit length
  },

  // MongoDB/Firestore query sanitization
  dbQuery: (input) => {
    if (!input) return '';
    if (typeof input === 'object') {
      return JSON.parse(JSON.stringify(input)); // Deep clone to prevent prototype pollution
    }
    return sanitize.text(input);
  }
};

/**
 * Input validation utilities
 */
export const validate = {
  // Email validation
  email: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  },

  // Password strength validation
  password: (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return {
      isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar,
      errors: [
        ...(password.length < minLength ? ['Password must be at least 8 characters'] : []),
        ...(!hasUpperCase ? ['Password must contain uppercase letters'] : []),
        ...(!hasLowerCase ? ['Password must contain lowercase letters'] : []),
        ...(!hasNumbers ? ['Password must contain numbers'] : []),
        ...(!hasSpecialChar ? ['Password must contain special characters'] : [])
      ]
    };
  },

  // Phone number validation
  phone: (phone) => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s()-]/g, ''));
  },

  // URL validation
  url: (url) => {
    try {
      const urlObj = new URL(url);
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  },

  // File validation
  file: (file, options = {}) => {
    const {
      maxSize = 10 * 1024 * 1024, // 10MB default
      allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
      allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'pdf']
    } = options;

    const errors = [];

    if (file.size > maxSize) {
      errors.push(`File size must be less than ${maxSize / (1024 * 1024)}MB`);
    }

    if (!allowedTypes.includes(file.type)) {
      errors.push(`File type ${file.type} is not allowed`);
    }

    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!allowedExtensions.includes(extension)) {
      errors.push(`File extension .${extension} is not allowed`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Generic field validation
  required: (value, fieldName = 'Field') => {
    if (!value || String(value).trim() === '') {
      return {
        isValid: false,
        error: `${fieldName} is required`
      };
    }
    return { isValid: true };
  },

  minLength: (value, min, fieldName = 'Field') => {
    if (String(value).length < min) {
      return {
        isValid: false,
        error: `${fieldName} must be at least ${min} characters`
      };
    }
    return { isValid: true };
  },

  maxLength: (value, max, fieldName = 'Field') => {
    if (String(value).length > max) {
      return {
        isValid: false,
        error: `${fieldName} must be no more than ${max} characters`
      };
    }
    return { isValid: true };
  },

  numeric: (value, fieldName = 'Field') => {
    if (isNaN(Number(value))) {
      return {
        isValid: false,
        error: `${fieldName} must be a number`
      };
    }
    return { isValid: true };
  },

  range: (value, min, max, fieldName = 'Field') => {
    const num = Number(value);
    if (num < min || num > max) {
      return {
        isValid: false,
        error: `${fieldName} must be between ${min} and ${max}`
      };
    }
    return { isValid: true };
  }
};

/**
 * Rate limiting utilities
 */
export const rateLimit = {
  // Check if action is rate limited
  check: (identifier, limit = 10, windowMs = 60000) => {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    if (!rateLimitStore.has(identifier)) {
      rateLimitStore.set(identifier, []);
    }
    
    const attempts = rateLimitStore.get(identifier);
    
    // Remove old attempts outside the window
    const recentAttempts = attempts.filter(time => time > windowStart);
    rateLimitStore.set(identifier, recentAttempts);
    
    if (recentAttempts.length >= limit) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: recentAttempts[0] + windowMs
      };
    }
    
    return {
      allowed: true,
      remaining: limit - recentAttempts.length - 1,
      resetTime: now + windowMs
    };
  },

  // Record an attempt
  record: (identifier) => {
    const now = Date.now();
    if (!rateLimitStore.has(identifier)) {
      rateLimitStore.set(identifier, []);
    }
    
    const attempts = rateLimitStore.get(identifier);
    attempts.push(now);
    rateLimitStore.set(identifier, attempts);
  },

  // Clear rate limit for identifier
  clear: (identifier) => {
    rateLimitStore.delete(identifier);
  }
};

/**
 * CSRF protection utilities
 */
export const csrf = {
  generateToken: () => {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  },

  validateToken: (token, expectedToken) => {
    return token === expectedToken;
  }
};

/**
 * Content Security Policy utilities
 */
export const csp = {
  generateNonce: () => {
    return Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
};

/**
 * Form validation wrapper
 */
export class FormValidator {
  constructor() {
    this.errors = {};
    this.isValid = true;
  }

  validate(field, value, rules) {
    this.errors[field] = [];
    
    for (const rule of rules) {
      const result = rule(value, field);
      if (!result.isValid) {
        this.errors[field].push(result.error);
        this.isValid = false;
      }
    }

    if (this.errors[field].length === 0) {
      delete this.errors[field];
    }

    return this;
  }

  getErrors() {
    return this.errors;
  }

  getFirstError() {
    const firstField = Object.keys(this.errors)[0];
    return firstField ? this.errors[firstField][0] : null;
  }

  hasErrors() {
    return !this.isValid;
  }

  reset() {
    this.errors = {};
    this.isValid = true;
    return this;
  }
}

/**
 * Secure form submission handler
 */
export const secureSubmit = async (formData, endpoint, options = {}) => {
  const {
    sanitizeFields = true,
    validateCsrf = true,
    rateLimitId = null,
    rateLimitConfig = { limit: 10, windowMs: 60000 }
  } = options;

  // Rate limiting
  if (rateLimitId) {
    const rateLimitResult = rateLimit.check(rateLimitId, rateLimitConfig.limit, rateLimitConfig.windowMs);
    if (!rateLimitResult.allowed) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    rateLimit.record(rateLimitId);
  }

  // Sanitize form data
  if (sanitizeFields) {
    const sanitizedData = {};
    for (const [key, value] of Object.entries(formData)) {
      if (typeof value === 'string') {
        sanitizedData[key] = sanitize.text(value);
      } else {
        sanitizedData[key] = value;
      }
    }
    formData = sanitizedData;
  }

  // Add CSRF token
  if (validateCsrf) {
    const csrfToken = csrf.generateToken();
    formData._csrfToken = csrfToken;
  }

  // Submit form
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      body: JSON.stringify(formData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Secure submit error:', error);
    throw error;
  }
};

export default {
  sanitize,
  validate,
  rateLimit,
  csrf,
  csp,
  FormValidator,
  secureSubmit
};