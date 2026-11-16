/**
 * Duggu Arts - Google Apps Script Utilities
 * 
 * Additional utility functions that are not in Config.gs
 * These are specific to the Utilities module
 */

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

/**
 * Process Google Form responses and move to Reviews sheet
 */
function processFormResponses(requestId) {
  const formSheet = getSheet(SHEET_NAMES.FORM_RESPONSES);
  const reviewsSheet = getSheet(SHEET_NAMES.REVIEWS);
  
  const formData = formSheet.getDataRange().getValues();
  if (formData.length <= 1) {
    return { processed: 0, message: 'No new form responses' };
  }
  
  const formHeaders = formData[0];
  const formRows = data.slice(1);
  
  // Get existing review IDs to avoid duplicates
  const reviewsData = reviewsSheet.getDataRange().getValues();
  const reviewHeaders = reviewsData[0];
  const reviewRows = reviewsData.slice(1);
  const reviewIdIndex = reviewHeaders.indexOf('review_id');
  const existingIds = new Set(reviewRows.map(r => r[reviewIdIndex]));
  
  let processed = 0;
  const now = getCurrentTimestamp();
  
  formRows.forEach(row => {
    const formEntry = {};
    formHeaders.forEach((header, i) => {
      formEntry[header] = row[i];
    });
    
    // Generate review ID from timestamp + name
    const reviewId = `REV_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`.toUpperCase();
    
    // Skip if already processed (check by timestamp + name)
    const uniqueKey = `${formEntry.timestamp}_${formEntry.customer_name}`;
    if (existingIds.has(reviewId)) return;
    
    // Validate required fields
    if (!formEntry.customer_name || !formEntry.product_purchased || !formEntry.rating) {
      return; // Skip invalid entries
    }
    
    const rating = Number(formEntry.rating);
    if (rating < 1 || rating > 5) return;
    
    // Add to reviews sheet with pending status
    const reviewRow = [
      reviewId,
      formEntry.customer_name,
      formEntry.product_purchased, // product_id - would need mapping
      rating,
      formEntry.review_title || 'Review',
      formEntry.review_description || '',
      formEntry.timestamp ? new Date(formEntry.timestamp).toISOString().split('T')[0] : now.split('T')[0],
      formEntry.photo_url || '',
      String(formEntry.display_permission).toLowerCase() === 'true',
      'pending', // approval_status
      false, // featured
    ];
    
    reviewsSheet.appendRow(reviewRow);
    processed++;
    existingIds.add(reviewId);
  });
  
  logAudit('system', 'form_responses_processed', 'reviews', 'multiple', { processed });
  
  return { processed, message: `${processed} reviews processed from form responses` };
}

/**
 * Get all unique categories from products
 */
function getUniqueCategories() {
  const sheet = getSheet(SHEET_NAMES.PRODUCTS);
  const data = sheet.getDataRange().getValues();
  
  if (data.length <= 1) return [];
  
  const headers = data[0];
  const catIndex = headers.indexOf('category_id');
  const categories = new Set();
  
  data.slice(1).forEach(row => {
    if (row[catIndex]) categories.add(row[catIndex]);
  });
  
  return Array.from(categories);
}

/**
 * Get all unique colours from products
 */
function getUniqueColours() {
  const sheet = getSheet(SHEET_NAMES.PRODUCTS);
  const data = sheet.getDataRange().getValues();
  
  if (data.length <= 1) return [];
  
  const headers = data[0];
  const coloursIndex = headers.indexOf('colours');
  const colours = new Set();
  
  data.slice(1).forEach(row => {
    try {
      const itemColours = JSON.parse(row[coloursIndex] || '[]');
      itemColours.forEach(c => colours.add(c));
    } catch {}
  });
  
  return Array.from(colours);
}

/**
 * Initialize all sheets with headers
 * Run this once after creating the spreadsheet
 */
function initializeAllSheets() {
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
  
  console.log('All sheets initialized successfully');
  return 'All sheets initialized successfully';
}

/**
 * Initialize default settings
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
  
  // Test each handler
  const testResults = {
    products: ProductsHandler['products.list']({ pageSize: 1 }),
    categories: CategoriesHandler['categories.list']({ activeOnly: false }),
    orders: OrdersHandler['orders.list']({ pageSize: 1 }),
    customers: CustomersHandler['customers.list']({ pageSize: 1 }),
    requests: CustomRequestsHandler['requests.list']({ pageSize: 1 }),
    reviews: ReviewsHandler['reviews.listApproved']({ pageSize: 1 }),
    inventory: InventoryHandler['inventory.list']({ pageSize: 1 }),
    settings: SettingsHandler['settings.getPublic']({}),
    dashboard: DashboardHandler['dashboard.summary']({}),
  };
  
  console.log('Test results:', JSON.stringify(testResults, null, 2));
  return 'Setup test completed - check logs';
}