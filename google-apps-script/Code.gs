/**
 * Duggu Arts - Google Apps Script Main Entry Point
 * 
 * This is the main entry point for the Apps Script web app.
 * Handles all incoming HTTP requests and routes them to appropriate handlers.
 * 
 * Deployment: Deploy as Web App -> Execute as: Me -> Who has access: Anyone
 */

// =============================================================================
// MAIN ENTRY POINTS
// =============================================================================

/**
 * Handle GET requests
 */
function doGet(e) {
  return handleRequest(e, 'GET');
}

/**
 * Handle POST requests
 */
function doPost(e) {
  return handleRequest(e, 'POST');
}

/**
 * Handle OPTIONS (CORS preflight)
 */
function doOptions(e) {
  const headers = handleCors(e);
  return ContentService.createTextOutput('').setHeaders(headers);
}

// =============================================================================
// REQUEST ROUTER
// =============================================================================

/**
 * Main request handler - routes to appropriate action handler
 */
function handleRequest(e, method) {
  const startTime = Date.now();
  const requestId = generateRequestId();
  
  try {
    // Handle CORS
    const corsHeaders = handleCors(e);
    
    // Parse request
    const requestData = parseRequest(e);
    const { action, payload, secret } = requestData;
    
    // Validate authentication
    if (!validateApiSecret(secret)) {
      return createErrorResponse('UNAUTHORIZED', 'Invalid API secret', 401, corsHeaders);
    }
    
    // Validate action
    if (!action) {
      return createErrorResponse('INVALID_REQUEST', 'Action parameter is required', 400, corsHeaders);
    }
    
    // Route to handler
    const result = routeAction(action, payload, requestId);
    
    // Log performance
    const duration = Date.now() - startTime;
    console.log(`[${requestId}] ${action} completed in ${duration}ms`);
    
    // Return success response with CORS headers
    return createSuccessResponse(result, corsHeaders);
    
  } catch (error) {
    console.error(`[${requestId}] Error:`, error);
    const duration = Date.now() - startTime;
    console.log(`[${requestId}] Failed after ${duration}ms`);
    
    return createErrorResponse('INTERNAL_ERROR', error.message, 500, handleCors(e));
  }
}

/**
 * Parse incoming request (handles both GET and POST)
 */
function parseRequest(e) {
  // For GET requests, parameters are in e.parameter
  // For POST requests, payload is in e.postData.contents
  
  if (e.method === 'GET') {
    return {
      action: e.parameter.action,
      payload: e.parameter.payload ? JSON.parse(e.parameter.payload) : {},
      secret: e.parameter.secret,
      requestId: e.parameter.requestId
    };
  }
  
  // POST request
  let payload = {};
  let action = '';
  let secret = '';
  let requestId = '';
  
  if (e.postData && e.postData.contents) {
    try {
      const parsed = JSON.parse(e.postData.contents);
      action = parsed.action;
      payload = parsed.payload || {};
      secret = parsed.secret;
      requestId = parsed.requestId;
    } catch (parseError) {
      throw new Error('Invalid JSON payload');
    }
  }
  
  // Also check URL parameters for POST
  if (e.parameter) {
    action = action || e.parameter.action;
    secret = secret || e.parameter.secret;
    requestId = requestId || e.parameter.requestId;
  }
  
  return { action, payload, secret, requestId };
}

/**
 * Route action to appropriate handler module
 */
function routeAction(action, payload, requestId) {
  // Log the action
  console.log(`[${requestId}] Routing action: ${action}`);
  
  // Product actions
  if (action.startsWith('products.')) {
    return handleProductsAction(action, payload, requestId);
  }
  
  // Category actions
  if (action.startsWith('categories.')) {
    return handleCategoriesAction(action, payload, requestId);
  }
  
  // Order actions
  if (action.startsWith('orders.')) {
    return handleOrdersAction(action, payload, requestId);
  }
  
  // Customer actions
  if (action.startsWith('customers.')) {
    return handleCustomersAction(action, payload, requestId);
  }
  
  // Custom request actions
  if (action.startsWith('requests.')) {
    return handleCustomRequestsAction(action, payload, requestId);
  }
  
  // Review actions
  if (action.startsWith('reviews.')) {
    return handleReviewsAction(action, payload, requestId);
  }
  
  // Inventory actions
  if (action.startsWith('inventory.')) {
    return handleInventoryAction(action, payload, requestId);
  }
  
  // Settings actions
  if (action.startsWith('settings.')) {
    return handleSettingsAction(action, payload, requestId);
  }
  
  // Dashboard actions
  if (action.startsWith('dashboard.')) {
    return handleDashboardAction(action, payload, requestId);
  }
  
  // Form processing
  if (action === 'forms.processResponses') {
    return processFormResponses(requestId);
  }
  
  throw new Error(`Unknown action: ${action}`);
}

// =============================================================================
// ACTION HANDLERS (Implemented in separate files)
// =============================================================================

function handleProductsAction(action, payload, requestId) {
  return ProductsHandler[action](payload, requestId);
}

function handleCategoriesAction(action, payload, requestId) {
  return CategoriesHandler[action](payload, requestId);
}

function handleOrdersAction(action, payload, requestId) {
  return OrdersHandler[action](payload, requestId);
}

function handleCustomersAction(action, payload, requestId) {
  return CustomersHandler[action](payload, requestId);
}

function handleCustomRequestsAction(action, payload, requestId) {
  return CustomRequestsHandler[action](payload, requestId);
}

function handleReviewsAction(action, payload, requestId) {
  return ReviewsHandler[action](payload, requestId);
}

function handleInventoryAction(action, payload, requestId) {
  return InventoryHandler[action](payload, requestId);
}

function handleSettingsAction(action, payload, requestId) {
  return SettingsHandler[action](payload, requestId);
}

function handleDashboardAction(action, payload, requestId) {
  return DashboardHandler[action](payload, requestId);
}

// =============================================================================
// INITIALIZATION / SETUP
// =============================================================================

/**
 * Initialize the spreadsheet with all required sheets and headers
 * Run this once after creating the spreadsheet
 */
function initializeSpreadsheet() {
  const ss = getSpreadsheet();
  
  Object.entries(SHEET_NAMES).forEach(([key, sheetName]) => {
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    }
    const headers = SHEET_HEADERS[key];
    if (headers) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.setFrozenRows(1);
      // Format header row
      sheet.getRange(1, 1, 1, headers.length)
        .setFontWeight('bold')
        .setBackground('#f3f4f6')
        .setHorizontalAlignment('center');
    }
  });
  
  // Remove default sheet if exists
  const defaultSheet = ss.getSheetByName('Sheet1');
  if (defaultSheet && ss.getSheets().length > 1) {
    ss.deleteSheet(defaultSheet);
  }
  
  // Initialize default settings
  initializeDefaultSettings();
  
  console.log('Spreadsheet initialized successfully');
}

/**
 * Initialize default settings in the Settings sheet
 */
function initializeDefaultSettings() {
  const sheet = getSheet(SHEET_NAMES.SETTINGS);
  const existingData = sheet.getDataRange().getValues();
  
  if (existingData.length <= 1) { // Only headers
    const settings = Object.entries(APP_SETTINGS.DEFAULT_SETTINGS).map(([key, value]) => [
      key,
      typeof value === 'object' ? JSON.stringify(value) : String(value),
      `Default setting for ${key}`
    ]);
    
    if (settings.length > 0) {
      sheet.getRange(2, 1, settings.length, 3).setValues(settings);
    }
  }
}

/**
 * Test function to verify setup
 */
function testSetup() {
  const ss = getSpreadsheet();
  console.log('Spreadsheet:', ss.getName());
  console.log('Sheets:', ss.getSheets().map(s => s.getName()));
  console.log('API Secret configured:', !!PropertiesService.getScriptProperties().getProperty('API_SECRET'));
  return 'Setup test completed - check logs';
}