/**
 * Duggu Arts - Google Apps Script Categories Handler
 * 
 * Handles all category-related operations: CRUD, listing, etc.
 * Uses centralized utilities from Config.gs and Security.gs
 */

const CategoriesHandler = {
  /**
   * List categories with optional filtering
   */
  'categories.list': function(payload, requestId) {
    const { activeOnly = true } = payload;
    
    const sheet = getSheet(SHEET_NAMES.CATEGORIES);
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      return { items: [], total: 0 };
    }
    
    const headers = data[0];
    const rows = data.slice(1);
    
    let categories = rows.map((row) => {
      const obj = {};
      headers.forEach((header, i) => {
        obj[header] = row[i];
      });
      return obj;
    });
    
    if (activeOnly) {
      categories = categories.filter(c => String(c.active).toLowerCase() === 'true');
    }
    
    // Sort by display_order
    categories.sort((a, b) => (Number(a.display_order) || 0) - (Number(b.display_order) || 0));
    
    const items = categories.map(c => ({
      id: c.category_id,
      categoryId: c.category_id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      imageUrl: c.image_url,
      active: String(c.active).toLowerCase() === 'true',
      displayOrder: Number(c.display_order) || 0,
    }));
    
    return { items, total: items.length };
  },
  
  /**
   * Get single category by ID or slug
   */
  'categories.get': function(payload, requestId) {
    const { id, slug } = payload;
    
    if (!id && !slug) {
      throw new Error('Either id or slug is required');
    }
    
    const sheet = getSheet(SHEET_NAMES.CATEGORIES);
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      return null;
    }
    
    const headers = data[0];
    const rows = data.slice(1);
    
    let category = null;
    
    if (id) {
      const idIndex = headers.indexOf('category_id');
      const row = rows.find(r => r[idIndex] === id);
      if (row) category = row;
    } else if (slug) {
      const slugIndex = headers.indexOf('slug');
      const row = rows.find(r => r[slugIndex] === slug);
      if (row) category = row;
    }
    
    if (!category) {
      return null;
    }
    
    const obj = {};
    headers.forEach((header, i) => {
      obj[header] = category[i];
    });
    
    return {
      id: obj.category_id,
      categoryId: obj.category_id,
      name: obj.name,
      slug: obj.slug,
      description: obj.description,
      imageUrl: obj.image_url,
      active: String(obj.active).toLowerCase() === 'true',
      displayOrder: Number(obj.display_order) || 0,
    };
  },
  
  /**
   * Create new category (admin only)
   */
  'categories.create': function(payload, requestId) {
    validatePayload(payload, 'category');
    
    // Check slug uniqueness
    const existing = CategoriesHandler['categories.list']({ activeOnly: false });
    if (existing.items.some(c => c.slug === payload.slug)) {
      throw new Error('Category with this slug already exists');
    }
    
    return withSpreadsheetLock(() => {
      const sheet = getSheet(SHEET_NAMES.CATEGORIES);
      const now = getCurrentTimestamp();
      const categoryId = generateId('CAT');
      
      const row = [
        categoryId,
        payload.name,
        payload.slug,
        payload.description || '',
        payload.image_url || '',
        payload.active,
        payload.display_order || 0,
      ];
      
      sheet.appendRow(row);
      
      logAudit('system', 'category_created', 'category', categoryId, { name: payload.name });
      
      return { categoryId, message: 'Category created successfully' };
    });
  },
  
  /**
   * Update category (admin only)
   */
  'categories.update': function(payload, requestId) {
    const { categoryId, ...updates } = payload;
    
    if (!categoryId) {
      throw new Error('categoryId is required');
    }
    
    // Check slug uniqueness if slug is being updated
    if (updates.slug) {
      const sheet = getSheet(SHEET_NAMES.CATEGORIES);
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const slugIndex = headers.indexOf('slug');
      const idIndex = headers.indexOf('category_id');
      
      const duplicate = data.slice(1).find(r => 
        r[slugIndex] === updates.slug && r[idIndex] !== categoryId
      );
      
      if (duplicate) {
        throw new Error('Category with this slug already exists');
      }
    }
    
    return withSpreadsheetLock(() => {
      const sheet = getSheet(SHEET_NAMES.CATEGORIES);
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const idIndex = headers.indexOf('category_id');
      
      let rowIndex = -1;
      for (let i = 1; i < data.length; i++) {
        if (data[i][idIndex] === categoryId) {
          rowIndex = i + 1;
          break;
        }
      }
      
      if (rowIndex === -1) {
        throw new Error('Category not found');
      }
      
      const updateMap = {
        'name': 'name',
        'slug': 'slug',
        'description': 'description',
        'image_url': 'image_url',
        'active': 'active',
        'display_order': 'display_order',
      };
      
      Object.entries(updates).forEach(([key, value]) => {
        const headerName = updateMap[key];
        if (headerName) {
          const colIndex = headers.indexOf(headerName);
          if (colIndex >= 0) {
            if (headerName === 'active') {
              value = String(value).toLowerCase() === 'true' ? 'TRUE' : 'FALSE';
            }
            sheet.getRange(rowIndex, colIndex + 1).setValue(value);
          }
        }
      });
      
      logAudit('system', 'category_updated', 'category', categoryId, { updates: Object.keys(updates) });
      
      return { categoryId, message: 'Category updated successfully' };
    });
  },
  
  /**
   * Delete category (admin only) - soft delete by setting active=false
   */
  'categories.delete': function(payload, requestId) {
    const { categoryId } = payload;
    
    if (!categoryId) {
      throw new Error('categoryId is required');
    }
    
    return withSpreadsheetLock(() => {
      const sheet = getSheet(SHEET_NAMES.CATEGORIES);
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const idIndex = headers.indexOf('category_id');
      const activeIndex = headers.indexOf('active');
      
      let rowIndex = -1;
      for (let i = 1; i < data.length; i++) {
        if (data[i][idIndex] === categoryId) {
          rowIndex = i + 1;
          break;
        }
      }
      
      if (rowIndex === -1) {
        throw new Error('Category not found');
      }
      
      sheet.getRange(rowIndex, activeIndex + 1).setValue('FALSE');
      
      logAudit('system', 'category_deleted', 'category', categoryId, {});
      
      return { categoryId, message: 'Category deleted successfully' };
    });
  },
};