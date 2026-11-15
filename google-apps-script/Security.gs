/**
 * Duggu Arts - Google Apps Script Security Module
 * 
 * Handles authentication, authorization, rate limiting, and input validation.
 */

// =============================================================================
// RATE LIMITING
// =============================================================================

const RATE_LIMIT_STORE = 'rate_limit_store';
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 60; // requests per window

/**
 * Check rate limit for an identifier (IP or user)
 */
function checkRateLimit(identifier) {
  const cache = CacheService.getScriptCache();
  const key = `${RATE_LIMIT_STORE}_${identifier}`;
  
  let current = cache.get(key);
  let count = current ? parseInt(current, 10) : 0;
  
  if (count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, remaining: 0, resetTime: Date.now() + RATE_LIMIT_WINDOW_MS };
  }
  
  count++;
  cache.put(key, count.toString(), Math.ceil(RATE_LIMIT_WINDOW_MS / 1000));
  
  return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - count, resetTime: Date.now() + RATE_LIMIT_WINDOW_MS };
}

/**
 * Get client identifier from request
 */
function getClientIdentifier(e) {
  // Try to get IP from headers (when behind proxy)
  const forwarded = e.headers?.['x-forwarded-for'] || e.headers?.['X-Forwarded-For'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  // Fallback to a hash of user agent + other factors
  const userAgent = e.headers?.['user-agent'] || e.headers?.['User-Agent'] || 'unknown';
  return Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, userAgent).slice(0, 16);
}

// =============================================================================
// INPUT VALIDATION & SANITIZATION
// =============================================================================

/**
 * Sanitize string input - remove potentially dangerous characters
 */
function sanitizeString(input, maxLength = 1000) {
  if (typeof input !== 'string') return '';
  return input
    .trim()
    .substring(0, maxLength)
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
}

/**
 * Sanitize object recursively
 */
function sanitizeObject(obj, maxDepth = 5) {
  if (maxDepth <= 0) return obj;
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string') return sanitizeString(obj);
  if (typeof obj === 'number' || typeof obj === 'boolean') return obj;
  if (Array.isArray(obj)) return obj.map(item => sanitizeObject(item, maxDepth - 1));
  if (typeof obj === 'object') {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      // Skip potentially dangerous keys
      if (['__proto__', 'constructor', 'prototype'].includes(key)) continue;
      result[sanitizeString(key, 100)] = sanitizeObject(value, maxDepth - 1);
    }
    return result;
  }
  return obj;
}

/**
 * Validate required fields in payload
 */
function validateRequiredFields(payload, requiredFields) {
  const missing = requiredFields.filter(field => {
    const value = payload[field];
    return value === undefined || value === null || value === '';
  });
  
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
  
  return true;
}

/**
 * Validate email format
 */
function validateEmail(email) {
  if (!email) return true; // Optional field
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (Indian format)
 */
function validatePhone(phone) {
  if (!phone) return false;
  const phoneRegex = /^[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[(]?[0-9]{1,3}[)]?[-\s\.]?[0-9]{4,6}$/;
  return phoneRegex.test(phone);
}

/**
 * Validate positive number
 */
function validatePositiveNumber(value, fieldName) {
  const num = Number(value);
  if (isNaN(num) || num < 0) {
    throw new Error(`${fieldName} must be a positive number`);
  }
  return num;
}

/**
 * Validate enum value
 */
function validateEnum(value, allowedValues, fieldName) {
  if (!allowedValues.includes(value)) {
    throw new Error(`${fieldName} must be one of: ${allowedValues.join(', ')}`);
  }
  return value;
}

// =============================================================================
// LOCK SERVICE FOR CONCURRENT WRITES
// =============================================================================

/**
 * Execute a function with a lock to prevent race conditions
 */
function withLock(lockName, callback, timeoutMs = 30000) {
  const lock = LockService.getScriptLock();
  const acquired = lock.tryLock(timeoutMs);
  
  if (!acquired) {
    throw new Error('Could not acquire lock - another operation in progress');
  }
  
  try {
    return callback();
  } finally {
    lock.releaseLock();
  }
}

/**
 * Execute with spreadsheet lock (for sheet-level operations)
 */
function withSpreadsheetLock(callback, timeoutMs = 30000) {
  return withLock('spreadsheet_write', callback, timeoutMs);
}

// =============================================================================
// IDEMPOTENCY HANDLING
// =============================================================================

const IDEMPOTENCY_STORE = 'idempotency_store';
const IDEMPOTENCY_TTL_SECONDS = 24 * 60 * 60; // 24 hours

/**
 * Check and store idempotency key
 */
function checkIdempotency(key) {
  const cache = CacheService.getScriptCache();
  const fullKey = `${IDEMPOTENCY_STORE}_${key}`;
  
  const existing = cache.get(fullKey);
  if (existing) {
    return { isDuplicate: true, result: JSON.parse(existing) };
  }
  
  return { isDuplicate: false };
}

/**
 * Store idempotency result
 */
function storeIdempotencyResult(key, result) {
  const cache = CacheService.getScriptCache();
  const fullKey = `${IDEMPOTENCY_STORE}_${key}`;
  cache.put(fullKey, JSON.stringify(result), IDEMPOTENCY_TTL_SECONDS);
}

// =============================================================================
// ADMIN AUTHORIZATION
// =============================================================================

/**
 * Verify admin email is in allowlist
 * In production, this should check against a stored list or domain
 */
function isAuthorizedAdmin(email) {
  if (!email) return false;
  
  // Check against allowed domains or specific emails
  // For now, we'll allow any email - in production, implement proper allowlist
  const allowedDomains = ['yourdomain.com']; // Configure as needed
  const domain = email.split('@')[1]?.toLowerCase();
  
  return allowedDomains.includes(domain) || email.endsWith('@yourdomain.com');
}

/**
 * Get admin email from session/request
 */
function getAdminEmail(e) {
  // In a real implementation, this would come from a validated session
  // For now, we'll check headers
  return e.headers?.['x-admin-email'] || e.headers?.['X-Admin-Email'] || '';
}

// =============================================================================
// DATA VALIDATION SCHEMAS
// =============================================================================

const VALIDATION_SCHEMAS = {
  product: {
    required: ['name', 'slug', 'category_id', 'description', 'price', 'colours'],
    fields: {
      name: { type: 'string', min: 2, max: 100 },
      slug: { type: 'string', pattern: '^[a-z0-9-]+$', max: 100 },
      category_id: { type: 'string', min: 1 },
      description: { type: 'string', min: 20, max: 5000 },
      price: { type: 'number', min: 1 },
      image_url: { type: 'url', optional: true },
      gallery_urls: { type: 'array', optional: true },
      colours: { type: 'array', minItems: 1 },
      stock_status: { type: 'enum', values: VALIDATION.PRODUCT_STATUSES },
      featured: { type: 'boolean' },
      active: { type: 'boolean' }
    }
  },
  
  order: {
    required: ['customer_name', 'phone', 'delivery_address', 'pincode', 'city', 'state', 'items'],
    fields: {
      customer_name: { type: 'string', min: 2, max: 100 },
      phone: { type: 'phone' },
      email: { type: 'email', optional: true },
      delivery_address: { type: 'string', min: 10, max: 500 },
      pincode: { type: 'string', pattern: '^[0-9]{6}$' },
      city: { type: 'string', min: 2, max: 100 },
      state: { type: 'string', min: 2, max: 100 },
      customer_notes: { type: 'string', max: 1000, optional: true },
      items: { type: 'array', minItems: 1 }
    }
  },
  
  custom_request: {
    required: ['customer_name', 'phone', 'flowers', 'quantities', 'colours', 'bouquet_size', 'wrapping', 'budget_min', 'budget_max', 'message_card', 'required_date'],
    fields: {
      customer_name: { type: 'string', min: 2, max: 100 },
      phone: { type: 'phone' },
      email: { type: 'email', optional: true },
      flowers: { type: 'array', minItems: 1 },
      quantities: { type: 'array', minItems: 1 },
      colours: { type: 'array', minItems: 1 },
      bouquet_size: { type: 'enum', values: ['small', 'medium', 'large', 'extra_large'] },
      wrapping: { type: 'enum', values: ['none', 'paper', 'cellophane', 'fabric', 'box'] },
      budget_min: { type: 'number', min: 0 },
      budget_max: { type: 'number', min: 0 },
      message_card: { type: 'enum', values: ['none', 'standard', 'premium'] },
      required_date: { type: 'date' },
      notes: { type: 'string', max: 1000, optional: true }
    }
  },
  
  review: {
    required: ['customer_name', 'product_id', 'rating', 'title', 'review_text', 'display_permission'],
    fields: {
      customer_name: { type: 'string', min: 2, max: 100 },
      product_id: { type: 'string', min: 1 },
      rating: { type: 'number', min: 1, max: 5 },
      title: { type: 'string', min: 5, max: 100 },
      review_text: { type: 'string', min: 20, max: 2000 },
      photo_url: { type: 'url', optional: true },
      display_permission: { type: 'boolean' }
    }
  }
};

/**
 * Validate payload against schema
 */
function validatePayload(payload, schemaName) {
  const schema = VALIDATION_SCHEMAS[schemaName];
  if (!schema) {
    throw new Error(`Unknown validation schema: ${schemaName}`);
  }
  
  // Check required fields
  validateRequiredFields(payload, schema.required);
  
  // Validate each field
  for (const [fieldName, rules] of Object.entries(schema.fields)) {
    const value = payload[fieldName];
    
    if (value === undefined || value === null) {
      if (!rules.optional) {
        throw new Error(`Field ${fieldName} is required`);
      }
      continue;
    }
    
    // Type validation
    switch (rules.type) {
      case 'string':
        if (typeof value !== 'string') throw new Error(`${fieldName} must be a string`);
        if (rules.min && value.length < rules.min) throw new Error(`${fieldName} must be at least ${rules.min} characters`);
        if (rules.max && value.length > rules.max) throw new Error(`${fieldName} must be at most ${rules.max} characters`);
        if (rules.pattern && !new RegExp(rules.pattern).test(value)) throw new Error(`${fieldName} format is invalid`);
        if (rules.type === 'url' && value && !value.startsWith('http')) throw new Error(`${fieldName} must be a valid URL`);
        break;
        
      case 'number':
        if (typeof value !== 'number' && isNaN(Number(value))) throw new Error(`${fieldName} must be a number`);
        const num = Number(value);
        if (rules.min !== undefined && num < rules.min) throw new Error(`${fieldName} must be at least ${rules.min}`);
        if (rules.max !== undefined && num > rules.max) throw new Error(`${fieldName} must be at most ${rules.max}`);
        break;
        
      case 'boolean':
        if (typeof value !== 'boolean') throw new Error(`${fieldName} must be a boolean`);
        break;
        
      case 'array':
        if (!Array.isArray(value)) throw new Error(`${fieldName} must be an array`);
        if (rules.minItems && value.length < rules.minItems) throw new Error(`${fieldName} must have at least ${rules.minItems} items`);
        break;
        
      case 'enum':
        if (!rules.values.includes(value)) throw new Error(`${fieldName} must be one of: ${rules.values.join(', ')}`);
        break;
        
      case 'phone':
        if (!validatePhone(value)) throw new Error(`${fieldName} must be a valid phone number`);
        break;
        
      case 'email':
        if (!validateEmail(value)) throw new Error(`${fieldName} must be a valid email`);
        break;
        
      case 'date':
        const date = new Date(value);
        if (isNaN(date.getTime())) throw new Error(`${fieldName} must be a valid date`);
        break;
    }
  }
  
  return true;
}