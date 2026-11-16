/**
 * Duggu Arts - Google Apps Script Products Handler
 * 
 * Handles all product-related operations: CRUD, listing, filtering, etc.
 * Uses centralized utilities from Config.gs and Security.gs
 */

const ProductsHandler = {
  /**
   * List products with filtering, pagination, sorting
   */
  'products.list': function(payload, requestId) {
    const { 
      page = 1, 
      pageSize = APP_SETTINGS.DEFAULT_PAGE_SIZE,
      search = '',
      category = '',
      stockStatus = '',
      featured = '',
      active = 'true',
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = payload;
    
    // Validate pagination
    const pageNum = Math.max(1, parseInt(page));
    const sizeNum = Math.min(APP_SETTINGS.MAX_PAGE_SIZE, Math.max(1, parseInt(pageSize)));
    
    const sheet = getSheet(SHEET_NAMES.PRODUCTS);
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      return { items: [], total: 0, page: pageNum, pageSize: sizeNum, totalPages: 0 };
    }
    
    // Convert to objects
    const headers = data[0];
    const rows = data.slice(1);
    
    let products = rows.map((row, index) => {
      const obj = { rowIndex: index + 2 }; // 1-based, +1 for header
      headers.forEach((header, i) => {
        obj[header] = row[i];
      });
      return obj;
    });
    
    // Apply filters
    if (active !== '') {
      const activeFilter = active === 'true';
      products = products.filter(p => String(p.active).toLowerCase() === String(activeFilter).toLowerCase());
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      products = products.filter(p => 
        (p.name?.toLowerCase().includes(searchLower)) ||
        (p.description?.toLowerCase().includes(searchLower)) ||
        (p.slug?.toLowerCase().includes(searchLower))
      );
    }
    
    if (category) {
      products = products.filter(p => p.category_id === category);
    }
    
    if (stockStatus) {
      products = products.filter(p => p.stock_status === stockStatus);
    }
    
    if (featured !== '') {
      const featuredFilter = featured === 'true';
      products = products.filter(p => String(p.featured).toLowerCase() === String(featuredFilter).toLowerCase());
    }
    
    // Sort
    const sortFields = {
      'created_at': 'created_at',
      'updated_at': 'updated_at',
      'price': 'price',
      'name': 'name',
      'featured': 'featured'
    };
    
    const sortField = sortFields[sortBy] || 'created_at';
    const isDesc = sortOrder === 'desc';
    
    products.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      
      // Handle numeric fields
      if (sortField === 'price') {
        valA = Number(valA) || 0;
        valB = Number(valB) || 0;
      }
      
      // Handle date fields
      if (['created_at', 'updated_at'].includes(sortField)) {
        valA = new Date(valA).getTime() || 0;
        valB = new Date(valB).getTime() || 0;
      }
      
      // Handle boolean fields
      if (sortField === 'featured') {
        valA = String(valA).toLowerCase() === 'true' ? 1 : 0;
        valB = String(valB).toLowerCase() === 'true' ? 1 : 0;
      }
      
      if (valA < valB) return isDesc ? 1 : -1;
      if (valA > valB) return isDesc ? -1 : 1;
      return 0;
    });
    
    const total = products.length;
    const totalPages = Math.ceil(total / sizeNum);
    
    // Paginate
    const start = (pageNum - 1) * sizeNum;
    const paginatedProducts = products.slice(start, start + sizeNum);
    
    // Transform for frontend
    const items = paginatedProducts.map(p => ({
      id: p.product_id,
      productId: p.product_id,
      name: p.name,
      slug: p.slug,
      categoryId: p.category_id,
      description: p.description,
      price: Number(p.price) || 0,
      imageUrl: p.image_url || '',
      galleryUrls: p.gallery_urls ? JSON.parse(p.gallery_urls) : [],
      colours: p.colours ? JSON.parse(p.colours) : [],
      stockStatus: p.stock_status,
      featured: String(p.featured).toLowerCase() === 'true',
      active: String(p.active).toLowerCase() === 'true',
      createdAt: p.created_at,
      updatedAt: p.updated_at
    }));
    
    return { items, total, page: pageNum, pageSize: sizeNum, totalPages };
  },
  
  /**
   * Get single product by ID or slug
   */
  'products.get': function(payload, requestId) {
    const { id, slug } = payload;
    
    if (!id && !slug) {
      throw new Error('Either id or slug is required');
    }
    
    const sheet = getSheet(SHEET_NAMES.PRODUCTS);
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      return null;
    }
    
    const headers = data[0];
    const rows = data.slice(1);
    
    let product = null;
    
    if (id) {
      const idIndex = headers.indexOf('product_id');
      const row = rows.find(r => r[idIndex] === id);
      if (row) product = row;
    } else if (slug) {
      const slugIndex = headers.indexOf('slug');
      const row = rows.find(r => r[slugIndex] === slug);
      if (row) product = row;
    }
    
    if (!product) {
      return null;
    }
    
    const obj = {};
    headers.forEach((header, i) => {
      obj[header] = product[i];
    });
    
    return {
      id: obj.product_id,
      productId: obj.product_id,
      name: obj.name,
      slug: obj.slug,
      categoryId: obj.category_id,
      description: obj.description,
      price: Number(obj.price) || 0,
      imageUrl: obj.image_url || '',
      galleryUrls: obj.gallery_urls ? JSON.parse(obj.gallery_urls) : [],
      colours: obj.colours ? JSON.parse(obj.colours) : [],
      stockStatus: obj.stock_status,
      featured: String(obj.featured).toLowerCase() === 'true',
      active: String(obj.active).toLowerCase() === 'true',
      createdAt: obj.created_at,
      updatedAt: obj.updated_at
    };
  },
  
  /**
   * Create new product (admin only)
   */
  'products.create': function(payload, requestId) {
    validatePayload(payload, 'product');
    
    // Check slug uniqueness
    const existing = ProductsHandler['products.list']({ search: payload.slug, pageSize: 1 });
    if (existing.items.length > 0) {
      throw new Error('Product with this slug already exists');
    }
    
    return withSpreadsheetLock(() => {
      const sheet = getSheet(SHEET_NAMES.PRODUCTS);
      const now = getCurrentTimestamp();
      const productId = generateId('PROD');
      
      const row = [
        productId,
        payload.name,
        payload.slug,
        payload.category_id,
        payload.description,
        payload.price,
        payload.image_url || '',
        JSON.stringify(payload.gallery_urls || []),
        JSON.stringify(payload.colours),
        payload.stock_status,
        payload.featured,
        payload.active,
        now,
        now
      ];
      
      sheet.appendRow(row);
      
      logAudit('system', 'product_created', 'product', productId, { name: payload.name });
      
      return { productId, message: 'Product created successfully' };
    });
  },
  
  /**
   * Update product (admin only)
   */
  'products.update': function(payload, requestId) {
    const { productId, ...updates } = payload;
    
    if (!productId) {
      throw new Error('productId is required');
    }
    
    // Validate only provided fields
    if (Object.keys(updates).length > 0) {
      // Partial validation for provided fields
      if (updates.slug) {
        // Check slug uniqueness (excluding current product)
        const sheet = getSheet(SHEET_NAMES.PRODUCTS);
        const data = sheet.getDataRange().getValues();
        const headers = data[0];
        const slugIndex = headers.indexOf('slug');
        const idIndex = headers.indexOf('product_id');
        
        const duplicate = data.slice(1).find(r => 
          r[slugIndex] === updates.slug && r[idIndex] !== productId
        );
        
        if (duplicate) {
          throw new Error('Product with this slug already exists');
        }
      }
    }
    
    return withSpreadsheetLock(() => {
      const sheet = getSheet(SHEET_NAMES.PRODUCTS);
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const idIndex = headers.indexOf('product_id');
      
      let rowIndex = -1;
      for (let i = 1; i < data.length; i++) {
        if (data[i][idIndex] === productId) {
          rowIndex = i + 1; // 1-based
          break;
        }
      }
      
      if (rowIndex === -1) {
        throw new Error('Product not found');
      }
      
      const now = getCurrentTimestamp();
      const updateMap = {
        'name': 'name',
        'slug': 'slug',
        'category_id': 'category_id',
        'description': 'description',
        'price': 'price',
        'image_url': 'image_url',
        'gallery_urls': 'gallery_urls',
        'colours': 'colours',
        'stock_status': 'stock_status',
        'featured': 'featured',
        'active': 'active'
      };
      
      // Update fields
      Object.entries(updates).forEach(([key, value]) => {
        const headerName = updateMap[key];
        if (headerName) {
          const colIndex = headers.indexOf(headerName);
          if (colIndex >= 0) {
            // Handle array fields
            if (['gallery_urls', 'colours'].includes(headerName)) {
              value = JSON.stringify(value);
            }
            // Handle boolean fields
            if (['featured', 'active'].includes(headerName)) {
              value = String(value).toLowerCase() === 'true' ? 'TRUE' : 'FALSE';
            }
            sheet.getRange(rowIndex, colIndex + 1).setValue(value);
          }
        }
      });
      
      // Update updated_at
      const updatedAtIndex = headers.indexOf('updated_at');
      sheet.getRange(rowIndex, updatedAtIndex + 1).setValue(now);
      
      logAudit('system', 'product_updated', 'product', productId, { updates: Object.keys(updates) });
      
      return { productId, message: 'Product updated successfully' };
    });
  },
  
  /**
   * Archive product (soft delete - admin only)
   */
  'products.archive': function(payload, requestId) {
    const { productId } = payload;
    
    if (!productId) {
      throw new Error('productId is required');
    }
    
    return withSpreadsheetLock(() => {
      const sheet = getSheet(SHEET_NAMES.PRODUCTS);
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const idIndex = headers.indexOf('product_id');
      const activeIndex = headers.indexOf('active');
      
      let rowIndex = -1;
      for (let i = 1; i < data.length; i++) {
        if (data[i][idIndex] === productId) {
          rowIndex = i + 1;
          break;
        }
      }
      
      if (rowIndex === -1) {
        throw new Error('Product not found');
      }
      
      sheet.getRange(rowIndex, activeIndex + 1).setValue('FALSE');
      sheet.getRange(rowIndex, headers.indexOf('updated_at') + 1).setValue(getCurrentTimestamp());
      
      logAudit('system', 'product_archived', 'product', productId, {});
      
      return { productId, message: 'Product archived successfully' };
    });
  },
  
  /**
   * Bulk update stock status (admin only)
   */
  'products.bulkUpdateStock': function(payload, requestId) {
    const { updates } = payload; // Array of { productId, stockStatus }
    
    if (!Array.isArray(updates) || updates.length === 0) {
      throw new Error('updates array is required');
    }
    
    return withSpreadsheetLock(() => {
      const sheet = getSheet(SHEET_NAMES.PRODUCTS);
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const idIndex = headers.indexOf('product_id');
      const stockIndex = headers.indexOf('stock_status');
      const updatedAtIndex = headers.indexOf('updated_at');
      
      const now = getCurrentTimestamp();
      let updated = 0;
      
      updates.forEach(update => {
        for (let i = 1; i < data.length; i++) {
          if (data[i][idIndex] === update.productId) {
            const rowIndex = i + 1;
            sheet.getRange(rowIndex, stockIndex + 1).setValue(update.stockStatus);
            sheet.getRange(rowIndex, updatedAtIndex + 1).setValue(now);
            updated++;
            break;
          }
        });
      });
      
      logAudit('system', 'products_bulk_stock_update', 'product', 'multiple', { count: updated });
      
      return { updated, message: `${updated} products updated` };
    });
  }
};