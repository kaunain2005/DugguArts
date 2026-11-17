/**
 * Duggu Arts - Google Apps Script Configuration
 * 
 * This file contains all configuration constants for the Apps Script backend.
 * Update these values after deploying the script and creating the spreadsheet.
 */

// =============================================================================
// SPREADSHEET CONFIGURATION
// =============================================================================

/**
 * The ID of the Google Spreadsheet used as the database.
 * Found in the URL: https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
 */
const SPREADSHEET_ID = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID') || 'YOUR_SPREADSHEET_ID_HERE';

/**
 * Sheet/tab names in the spreadsheet - MUST match exactly
 */
const SHEET_NAMES = {
  PRODUCTS: 'Products',
  CATEGORIES: 'Categories',
  ORDERS: 'Orders',
  ORDER_ITEMS: 'Order_Items',
  CUSTOMERS: 'Customers',
  CUSTOM_REQUESTS: 'Custom_Requests',
  REVIEWS: 'Reviews',
  INVENTORY: 'Inventory',
  INVENTORY_MOVEMENTS: 'Inventory_Movements',
  SETTINGS: 'Settings',
  AUDIT_LOGS: 'Audit_Logs',
  FORM_RESPONSES: 'Form_Responses'
};

/**
 * Column headers for each sheet - MUST match exactly
 */
const SHEET_HEADERS = {
  PRODUCTS: [
    'product_id', 'name', 'slug', 'category_id', 'description', 'price',
    'image_url', 'gallery_urls', 'colours', 'stock_status', 'featured',
    'active', 'created_at', 'updated_at'
  ],
  CATEGORIES: [
    'category_id', 'name', 'slug', 'description', 'image_url',
    'active', 'display_order'
  ],
  ORDERS: [
    'order_id', 'customer_id', 'order_date', 'customer_name', 'phone',
    'email', 'delivery_address', 'pincode', 'city', 'state',
    'subtotal', 'packaging_charge', 'delivery_charge', 'total_amount',
    'payment_status', 'order_status', 'payment_method', 'customer_notes',
    'created_at', 'updated_at'
  ],
  ORDER_ITEMS: [
    'order_item_id', 'order_id', 'product_id', 'product_name_snapshot',
    'quantity', 'unit_price_snapshot', 'selected_colour', 'personalisation',
    'wrapping', 'message_card', 'line_total'
  ],
  CUSTOMERS: [
    'customer_id', 'customer_name', 'phone', 'email', 'created_at', 'contact_consent'
  ],
  CUSTOM_REQUESTS: [
    'request_id', 'customer_name', 'phone', 'email', 'flowers', 'quantities',
    'colours', 'bouquet_size', 'wrapping', 'budget_min', 'budget_max',
    'message_card', 'required_date', 'notes', 'quoted_price',
    'request_status', 'created_at', 'updated_at'
  ],
  REVIEWS: [
    'review_id', 'customer_name', 'product_id', 'rating', 'title',
    'review_text', 'review_date', 'photo_url', 'display_permission',
    'approval_status', 'featured'
  ],
  INVENTORY: [
    'material_id', 'material_name', 'category', 'unit', 'opening_stock',
    'current_stock', 'unit_cost', 'reorder_level', 'updated_at'
  ],
  INVENTORY_MOVEMENTS: [
    'movement_id', 'material_id', 'movement_type', 'quantity',
    'reference_id', 'notes', 'created_at'
  ],
  SETTINGS: [
    'setting_key', 'setting_value', 'description'
  ],
  AUDIT_LOGS: [
    'log_id', 'admin_email', 'action', 'entity_type', 'entity_id',
    'details', 'created_at'
  ],
  FORM_RESPONSES: [
    'timestamp', 'customer_name', 'product_purchased', 'rating',
    'review_title', 'review_description', 'photo_url',
    'display_permission', 'email'
  ]
};

// =============================================================================
// AUTHENTICATION & SECURITY
// =============================================================================

/**
 * Secret key for server-to-server authentication.
 * Must match GOOGLE_APPS_SCRIPT_SECRET in Vercel environment variables.
 * Generate with: Utilities.getUuid() or similar
 * Store in Script Properties: PropertiesService.getScriptProperties().setProperty('API_SECRET', 'your-secret')
 */
const API_SECRET = PropertiesService.getScriptProperties().getProperty('API_SECRET') || '';

/**
 * Admin email allowlist - comma-separated list of authorized admin emails.
 * Only these emails can access admin operations.
 * Configure in Script Properties: PropertiesService.getScriptProperties().setProperty('ADMIN_EMAILS', 'admin1@example.com,admin2@example.com')
 */
const ADMIN_EMAILS = (PropertiesService.getScriptProperties().getProperty('ADMIN_EMAILS') || '')
  .split(',')
  .map(e => e.trim().toLowerCase())
  .filter(Boolean);

/**
 * Allowed origins for CORS
 */
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'https://your-domain.vercel.app',
  'https://your-custom-domain.com'
];

// =============================================================================
// APPLICATION SETTINGS
// =============================================================================

const APP_SETTINGS = {
  DEFAULT_SETTINGS: {
    business_name: 'Duggu Arts',
    whatsapp_number: '91XXXXXXXXXX',
    instagram_url: 'https://instagram.com/dugguarts',
    contact_email: 'hello@dugguarts.com',
    announcement_text: 'Free delivery on orders above ₹999!',
    packaging_charge: 50,
    delivery_charge: 100,
    free_delivery_threshold: 999,
    currency: 'INR',
    timezone: 'Asia/Kolkata'
  },
  
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  
  CACHE_DURATION_SECONDS: 60,
  
  RATE_LIMIT: 60
};

// =============================================================================
// VALIDATION RULES
// =============================================================================

const VALIDATION = {
  PRODUCT_STATUSES: ['in_stock', 'low_stock', 'out_of_stock', 'made_to_order'],
  ORDER_STATUSES: ['new', 'contacted', 'confirmed', 'in_production', 'ready', 'dispatched', 'delivered', 'completed', 'cancelled'],
  PAYMENT_STATUSES: ['unpaid', 'advance_received', 'partially_paid', 'paid', 'refunded'],
  REQUEST_STATUSES: ['pending', 'contacted', 'quoted', 'confirmed', 'in_production', 'ready', 'delivered', 'completed', 'cancelled'],
  REVIEW_STATUSES: ['pending', 'approved', 'rejected'],
  MOVEMENT_TYPES: ['in', 'out', 'adjustment']
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get the spreadsheet instance
 */
function getSpreadsheet() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

/**
 * Get a specific sheet by name, create if not exists
 */
function getSheet(sheetName) {
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    const headers = SHEET_HEADERS[sheetName.toUpperCase().replace(/_/g, '_')];
    if (headers) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.setFrozenRows(1);
    }
  }
  return sheet;
}

/**
 * Generate a unique ID with prefix
 */
function generateId(prefix = '') {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 9);
  return `${prefix}${prefix ? '_' : ''}${timestamp}${random}`.toUpperCase();
}

/**
 * Generate a unique request ID for logging
 */
function generateRequestId() {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Get current timestamp in ISO format
 */
function getCurrentTimestamp() {
  return new Date().toISOString();
}

/**
 * Validate API secret from request
 * Compares against secret stored in Script Properties
 */
function validateApiSecret(requestSecret) {
  return requestSecret && requestSecret === API_SECRET;
}

/**
 * Check if email is in admin allowlist
 * Reads from Script Properties ADMIN_EMAILS
 */
function isAdminEmail(email) {
  if (!email) return false;
  
  const normalizedEmail = email.trim().toLowerCase();
  
  // Never allow access if the admin allowlist is empty
  if (!ADMIN_EMAILS.length) {
    console.error('ADMIN_EMAILS is not configured');
    return false;
  }
  
  return ADMIN_EMAILS.includes(normalizedEmail);
}

/**
 * Log audit event to Audit_Logs sheet
 */
function logAudit(adminEmail, action, entityType, entityId, details = {}) {
  try {
    const sheet = getSheet(SHEET_NAMES.AUDIT_LOGS);
    const row = [
      generateId('LOG'),
      adminEmail || 'system',
      action,
      entityType,
      entityId,
      JSON.stringify(details),
      getCurrentTimestamp()
    ];
    sheet.appendRow(row);
  } catch (error) {
    console.error('Audit log failed:', error);
  }
}

/**
 * Create standardized API response
 */
function createResponse(success, data, message, errorCode) {
  const response = { success };
  if (data !== undefined) response.data = data;
  if (message) response.message = message;
  if (errorCode) response.error = { code: errorCode, message: message || 'An error occurred' };
  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Create standardized success response with CORS headers
 */
function createSuccessResponse(data, headers) {
  const output = ContentService.createTextOutput(JSON.stringify({
    success: true,
    data: data,
    message: 'Operation successful'
  })).setMimeType(ContentService.MimeType.JSON);
  
  if (headers) {
    Object.entries(headers).forEach(([key, value]) => output.setHeaders({ [key]: value }));
  }
  return output;
}

/**
 * Create standardized error response with CORS headers
 */
function createErrorResponse(code, message, statusCode, headers) {
  const output = ContentService.createTextOutput(JSON.stringify({
    success: false,
    error: { code, message }
  })).setMimeType(ContentService.MimeType.JSON);
  
  if (headers) {
    Object.entries(headers).forEach(([key, value]) => output.setHeaders({ [key]: value }));
  }
  return output;
}

/**
 * Create standardized success response
 */
function createSuccessResponse(data) {
  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    data: data,
    message: 'Operation successful'
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Create standardized error response
 */
function createErrorResponse(code, message) {
  return ContentService.createTextOutput(JSON.stringify({
    success: false,
    error: { code, message }
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handle CORS preflight
 */
function handleCors(request) {
  const origin = request.headers?.origin || '';
  const allowed = ALLOWED_ORIGINS.some(o => origin.startsWith(o)) || origin.includes('localhost');
  
  const headers = {
    'Access-Control-Allow-Origin': allowed ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Secret, X-Request-ID',
    'Access-Control-Max-Age': '86400'
  };
  
  if (request.method === 'OPTIONS') {
    return ContentService.createTextOutput('').setHeaders(headers);
  }
  return headers;
}

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

/**
 * Check and store idempotency key
 */
function checkIdempotency(key) {
  const cache = CacheService.getScriptCache();
  const fullKey = `idempotency_${key}`;
  
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
  const fullKey = `idempotency_${key}`;
  cache.put(fullKey, JSON.stringify(result), 24 * 60 * 60); // 24 hours
}

/**
 * Rate limiting check
 */
function checkRateLimit(identifier) {
  const cache = CacheService.getScriptCache();
  const key = `ratelimit_${identifier}`;
  
  let current = cache.get(key);
  let count = current ? parseInt(current, 10) : 0;
  
  if (count >= 60) {
    return { allowed: false, remaining: 0, resetTime: Date.now() + 60000 };
  }
  
  count++;
  cache.put(key, count.toString(), 60); // 1 minute window
  
  return { allowed: true, remaining: 60 - count, resetTime: Date.now() + 60000 };
}

/**
 * Get client identifier from request
 */
function getClientIdentifier(e) {
  const forwarded = e.headers?.['x-forwarded-for'] || e.headers?.['X-Forwarded-For'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  const userAgent = e.headers?.['user-agent'] || e.headers?.['User-Agent'] || 'unknown';
  return Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, userAgent).slice(0, 16);
}