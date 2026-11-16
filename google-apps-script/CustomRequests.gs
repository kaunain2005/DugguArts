/**
 * Duggu Arts - Google Apps Script Custom Requests Handler
 * 
 * Handles custom bouquet request operations
 * Uses centralized utilities from Config.gs and Security.gs
 */

const CustomRequestsHandler = {
  /**
   * Create new custom request from customer
   */
  'requests.create': function(payload, requestId) {
    validatePayload(payload, 'custom_request');
    
    // Validate budget
    if (payload.budgetMax < payload.budgetMin) {
      throw new Error('Maximum budget must be greater than or equal to minimum budget');
    }
    
    // Validate arrays have same length
    if (payload.flowers.length !== payload.quantities.length) {
      throw new Error('Flowers and quantities arrays must have the same length');
    }
    
    return withSpreadsheetLock(() => {
      const sheet = getSheet(SHEET_NAMES.CUSTOM_REQUESTS);
      const now = getCurrentTimestamp();
      const requestId = generateId('CREQ');
      
      const row = [
        requestId,
        payload.customerName,
        payload.phone,
        payload.email || '',
        JSON.stringify(payload.flowers),
        JSON.stringify(payload.quantities),
        JSON.stringify(payload.colours),
        payload.bouquetSize,
        payload.wrapping,
        payload.budgetMin,
        payload.budgetMax,
        payload.messageCard,
        payload.requiredDate,
        payload.notes || '',
        '', // quoted_price
        'pending', // request_status
        now,
        now,
      ];
      
      sheet.appendRow(row);
      
      logAudit('system', 'custom_request_created', 'custom_request', requestId, { 
        customerName: payload.customerName,
        bouquetSize: payload.bouquetSize,
        budgetMin: payload.budgetMin,
        budgetMax: payload.budgetMax,
      });
      
      return { 
        requestId, 
        message: 'Custom request submitted successfully' 
      };
    });
  },
  
  /**
   * List custom requests with filtering (admin)
   */
  'requests.list': function(payload, requestId) {
    const { 
      page = 1, 
      pageSize = APP_SETTINGS.DEFAULT_PAGE_SIZE,
      status = '',
      search = '',
    } = payload;
    
    const pageNum = Math.max(1, parseInt(page));
    const sizeNum = Math.min(APP_SETTINGS.MAX_PAGE_SIZE, Math.max(1, parseInt(pageSize)));
    
    const sheet = getSheet(SHEET_NAMES.CUSTOM_REQUESTS);
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      return { items: [], total: 0, page: pageNum, pageSize: sizeNum, totalPages: 0 };
    }
    
    const headers = data[0];
    const rows = data.slice(1);
    
    let requests = rows.map((row) => {
      const obj = {};
      headers.forEach((header, i) => {
        obj[header] = row[i];
      });
      return obj;
    });
    
    if (status) {
      requests = requests.filter(r => r.request_status === status);
    }
    if (search) {
      const searchLower = search.toLowerCase();
      requests = requests.filter(r => 
        (r.request_id?.toLowerCase().includes(searchLower)) ||
        (r.customer_name?.toLowerCase().includes(searchLower)) ||
        (r.phone?.includes(searchLower))
      );
    }
    
    // Sort by created_at desc
    requests.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    const total = requests.length;
    const totalPages = Math.ceil(total / sizeNum);
    const start = (pageNum - 1) * sizeNum;
    const paginated = requests.slice(start, start + sizeNum);
    
    const items = paginated.map(r => {
      let flowers = [], quantities = [], colours = [];
      try { flowers = JSON.parse(r.flowers); } catch {}
      try { quantities = JSON.parse(r.quantities); } catch {}
      try { colours = JSON.parse(r.colours); } catch {}
      
      return {
        id: r.request_id,
        requestId: r.request_id,
        customerName: r.customer_name,
        phone: r.phone,
        email: r.email,
        flowers,
        quantities,
        colours,
        bouquetSize: r.bouquet_size,
        wrapping: r.wrapping,
        budgetMin: Number(r.budget_min) || 0,
        budgetMax: Number(r.budget_max) || 0,
        messageCard: r.message_card,
        requiredDate: r.required_date,
        notes: r.notes,
        quotedPrice: r.quoted_price ? Number(r.quoted_price) : null,
        requestStatus: r.request_status,
        createdAt: r.created_at,
        updatedAt: r.update_at,
      };
    });
    
    return { items, total, page: pageNum, pageSize: sizeNum, totalPages };
  },
  
  /**
   * Get custom request by ID
   */
  'requests.get': function(payload, requestId) {
    const { requestId: reqId } = payload;
    
    if (!reqId) {
      throw new Error('requestId is required');
    }
    
    const sheet = getSheet(SHEET_NAMES.CUSTOM_REQUESTS);
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      return null;
    }
    
    const headers = data[0];
    const rows = data.slice(1);
    const idIndex = headers.indexOf('request_id');
    
    const row = rows.find(r => r[idIndex] === reqId);
    if (!row) {
      return null;
    }
    
    const r = {};
    headers.forEach((header, i) => {
      r[header] = row[i];
    });
    
    let flowers = [], quantities = [], colours = [];
    try { flowers = JSON.parse(r.flowers); } catch {}
    try { quantities = JSON.parse(r.quantities); } catch {}
    try { colours = JSON.parse(r.colours); } catch {}
    
    return {
      id: r.request_id,
      requestId: r.request_id,
      customerName: r.customer_name,
      phone: r.phone,
      email: r.email,
      flowers,
      quantities,
      colours,
      bouquetSize: r.bouquet_size,
      wrapping: r.wrapping,
      budgetMin: Number(r.budget_min) || 0,
      budgetMax: Number(r.budget_max) || 0,
      messageCard: r.message_card,
      requiredDate: r.required_date,
      notes: r.notes,
      quotedPrice: r.quoted_price ? Number(r.quoted_price) : null,
      requestStatus: r.request_status,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    };
  },
  
  /**
   * Update custom request (admin)
   */
  'requests.update': function(payload, requestId) {
    const { requestId: reqId, requestStatus, quotedPrice, internalNotes } = payload;
    
    if (!reqId) {
      throw new Error('requestId is required');
    }
    
    if (!requestStatus && quotedPrice === undefined && !internalNotes) {
      throw new Error('At least one field to update is required');
    }
    
    if (requestStatus && !VALIDATION.REQUEST_STATUSES.includes(requestStatus)) {
      throw new Error(`Invalid request status: ${requestStatus}`);
    }
    
    if (quotedPrice !== undefined && (isNaN(Number(quotedPrice)) || Number(quotedPrice) < 0)) {
      throw new Error('Quoted price must be a positive number');
    }
    
    return withSpreadsheetLock(() => {
      const sheet = getSheet(SHEET_NAMES.CUSTOM_REQUESTS);
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const idIndex = headers.indexOf('request_id');
      const statusIndex = headers.indexOf('request_status');
      const quotedIndex = headers.indexOf('quoted_price');
      const updatedAtIndex = headers.indexOf('updated_at');
      
      let rowIndex = -1;
      for (let i = 1; i < data.length; i++) {
        if (data[i][idIndex] === reqId) {
          rowIndex = i + 1;
          break;
        }
      }
      
      if (rowIndex === -1) {
        throw new Error('Custom request not found');
      }
      
      const now = getCurrentTimestamp();
      
      if (requestStatus) {
        sheet.getRange(rowIndex, statusIndex + 1).setValue(requestStatus);
      }
      if (quotedPrice !== undefined) {
        sheet.getRange(rowIndex, quotedIndex + 1).setValue(quotedPrice);
      }
      if (internalNotes !== undefined) {
        // Add internal_notes column if not exists
        let notesIndex = headers.indexOf('internal_notes');
        if (notesIndex === -1) {
          notesIndex = headers.length;
          sheet.getRange(1, notesIndex + 1).setValue('internal_notes');
        }
        sheet.getRange(rowIndex, notesIndex + 1).setValue(internalNotes);
      }
      sheet.getRange(rowIndex, updatedAtIndex + 1).setValue(now);
      
      logAudit('system', 'custom_request_updated', 'custom_request', reqId, { 
        requestStatus, 
        quotedPrice, 
        hasNotes: !!internalNotes 
      });
      
      return { requestId: reqId, message: 'Custom request updated successfully' };
    });
  },
};