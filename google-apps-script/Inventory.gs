/**
 * Duggu Arts - Google Apps Script Inventory Handler
 * 
 * Handles inventory and material management operations
 * Uses centralized utilities from Config.gs and Security.gs
 */

const InventoryHandler = {
  /**
   * List all inventory materials
   */
  'inventory.list': function(payload, requestId) {
    const { 
      page = 1, 
      pageSize = APP_SETTINGS.DEFAULT_PAGE_SIZE,
      category = '',
      lowStockOnly = false,
      search = '',
    } = payload;
    
    const pageNum = Math.max(1, parseInt(page));
    const sizeNum = Math.min(APP_SETTINGS.MAX_PAGE_SIZE, Math.max(1, parseInt(pageSize)));
    
    const sheet = getSheet(SHEET_NAMES.INVENTORY);
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      return { items: [], total: 0, page: pageNum, pageSize: sizeNum, totalPages: 0 };
    }
    
    const headers = data[0];
    const rows = data.slice(1);
    
    let materials = rows.map((row) => {
      const obj = {};
      headers.forEach((header, i) => {
        obj[header] = row[i];
      });
      return obj;
    });
    
    if (category) {
      materials = materials.filter(m => m.category === category);
    }
    if (lowStockOnly) {
      materials = materials.filter(m => Number(m.current_stock) <= Number(m.reorder_level));
    }
    if (search) {
      const searchLower = search.toLowerCase();
      materials = materials.filter(m => 
        (m.material_name?.toLowerCase().includes(searchLower)) ||
        (m.category?.toLowerCase().includes(searchLower))
      );
    }
    
    // Sort by material_name
    materials.sort((a, b) => (a.material_name || '').localeCompare(b.material_name || ''));
    
    const total = materials.length;
    const totalPages = Math.ceil(total / sizeNum);
    const start = (pageNum - 1) * sizeNum;
    const paginated = materials.slice(start, start + sizeNum);
    
    const items = paginated.map(m => ({
      id: m.material_id,
      materialId: m.material_id,
      materialName: m.material_name,
      category: m.category,
      unit: m.unit,
      openingStock: Number(m.opening_stock) || 0,
      currentStock: Number(m.current_stock) || 0,
      unitCost: Number(m.unit_cost) || 0,
      reorderLevel: Number(m.reorder_level) || 0,
      updatedAt: m.updated_at,
      isLowStock: Number(m.current_stock) <= Number(m.reorder_level),
      stockValue: (Number(m.current_stock) || 0) * (Number(m.unit_cost) || 0),
    }));
    
    return { items, total, page: pageNum, pageSize: sizeNum, totalPages };
  },
  
  /**
   * Get material by ID
   */
  'inventory.get': function(payload, requestId) {
    const { materialId } = payload;
    
    if (!materialId) {
      throw new Error('materialId is required');
    }
    
    const sheet = getSheet(SHEET_NAMES.INVENTORY);
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      return null;
    }
    
    const headers = data[0];
    const rows = data.slice(1);
    const idIndex = headers.indexOf('material_id');
    
    const row = rows.find(r => r[idIndex] === materialId);
    if (!row) {
      return null;
    }
    
    const m = {};
    headers.forEach((header, i) => {
      m[header] = row[i];
    });
    
    return {
      id: m.material_id,
      materialId: m.material_id,
      materialName: m.material_name,
      category: m.category,
      unit: m.unit,
      openingStock: Number(m.opening_stock) || 0,
      currentStock: Number(m.current_stock) || 0,
      unitCost: Number(m.unit_cost) || 0,
      reorderLevel: Number(m.reorder_level) || 0,
      updatedAt: m.updated_at,
      isLowStock: Number(m.current_stock) <= Number(m.reorder_level),
      stockValue: (Number(m.current_stock) || 0) * (Number(m.unit_cost) || 0),
    };
  },
  
  /**
   * Create new material (admin)
   */
  'inventory.create': function(payload, requestId) {
    validatePayload(payload, 'inventory');
    
    return withSpreadsheetLock(() => {
      const sheet = getSheet(SHEET_NAMES.INVENTORY);
      const now = getCurrentTimestamp();
      const materialId = generateId('MAT');
      
      const row = [
        materialId,
        payload.materialName,
        payload.category,
        payload.unit,
        payload.openingStock,
        payload.currentStock,
        payload.unitCost,
        payload.reorderLevel,
        now,
      ];
      
      sheet.appendRow(row);
      
      logAudit('system', 'material_created', 'inventory', materialId, { 
        materialName: payload.materialName 
      });
      
      return { materialId, message: 'Material created successfully' };
    });
  },
  
  /**
   * Update material (admin)
   */
  'inventory.update': function(payload, requestId) {
    const { materialId, ...updates } = payload;
    
    if (!materialId) {
      throw new Error('materialId is required');
    }
    
    return withSpreadsheetLock(() => {
      const sheet = getSheet(SHEET_NAMES.INVENTORY);
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const idIndex = headers.indexOf('material_id');
      
      let rowIndex = -1;
      for (let i = 1; i < data.length; i++) {
        if (data[i][idIndex] === materialId) {
          rowIndex = i + 1;
          break;
        }
      }
      
      if (rowIndex === -1) {
        throw new Error('Material not found');
      }
      
      const updateMap = {
        'materialName': 'material_name',
        'category': 'category',
        'unit': 'unit',
        'openingStock': 'opening_stock',
        'currentStock': 'current_stock',
        'unitCost': 'unit_cost',
        'reorderLevel': 'reorder_level',
      };
      
      const now = getCurrentTimestamp();
      
      Object.entries(updates).forEach(([key, value]) => {
        const headerName = updateMap[key];
        if (headerName) {
          const colIndex = headers.indexOf(headerName);
          if (colIndex >= 0) {
            sheet.getRange(rowIndex, colIndex + 1).setValue(value);
          }
        }
      });
      
      sheet.getRange(rowIndex, headers.indexOf('updated_at') + 1).setValue(now);
      
      logAudit('system', 'material_updated', 'inventory', materialId, { updates: Object.keys(updates) });
      
      return { materialId, message: 'Material updated successfully' };
    });
  },
  
  /**
   * Record stock movement (admin)
   */
  'inventory.movement.create': function(payload, requestId) {
    validatePayload(payload, 'inventory_movement');
    
    return withSpreadsheetLock(() => {
      const materialSheet = getSheet(SHEET_NAMES.INVENTORY);
      const movementSheet = getSheet(SHEET_NAMES.INVENTORY_MOVEMENTS);
      const now = getCurrentTimestamp();
      const movementId = generateId('MOV');
      
      // Get current stock
      const materialData = materialSheet.getDataRange().getValues();
      const headers = materialData[0];
      const rows = materialData.slice(1);
      const idIndex = headers.indexOf('material_id');
      const stockIndex = headers.indexOf('current_stock');
      
      let materialRow = -1;
      let currentStock = 0;
      for (let i = 0; i < rows.length; i++) {
        if (rows[i][idIndex] === payload.materialId) {
          materialRow = i + 2; // 1-based + header
          currentStock = Number(rows[i][stockIndex]) || 0;
          break;
        }
      }
      
      if (materialRow === -1) {
        throw new Error('Material not found');
      }
      
      const quantity = Number(payload.quantity);
      let newStock = currentStock;
      
      if (payload.movementType === 'in') {
        newStock += quantity;
      } else if (payload.movementType === 'out') {
        newStock -= quantity;
        if (newStock < 0) {
          throw new Error('Insufficient stock for this movement');
        }
      } else if (payload.movementType === 'adjustment') {
        newStock = quantity; // adjustment sets absolute value
      }
      
      // Update material stock
      materialSheet.getRange(materialRow, stockIndex + 1).setValue(newStock);
      materialSheet.getRange(materialRow, headers.indexOf('updated_at') + 1).setValue(now);
      
      // Record movement
      const movementRow = [
        movementId,
        payload.materialId,
        payload.movementType,
        quantity,
        payload.referenceId || '',
        payload.notes || '',
        now,
      ];
      movementSheet.appendRow(movementRow);
      
      logAudit('system', 'stock_movement_recorded', 'inventory', payload.materialId, { 
        movementType: payload.movementType,
        quantity,
        newStock,
        referenceId: payload.referenceId,
      });
      
      return { 
        movementId, 
        newStock,
        message: 'Stock movement recorded successfully' 
      };
    });
  },
  
  /**
   * List stock movements for a material
   */
  'inventory.movements.list': function(payload, requestId) {
    const { 
      materialId = '',
      page = 1, 
      pageSize = APP_SETTINGS.DEFAULT_PAGE_SIZE,
      movementType = '',
    } = payload;
    
    const pageNum = Math.max(1, parseInt(page));
    const sizeNum = Math.min(APP_SETTINGS.MAX_PAGE_SIZE, Math.max(1, parseInt(pageSize)));
    
    const sheet = getSheet(SHEET_NAMES.INVENTORY_MOVEMENTS);
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      return { items: [], total: 0, page: pageNum, pageSize: sizeNum, totalPages: 0 };
    }
    
    const headers = data[0];
    const rows = data.slice(1);
    
    let movements = rows.map((row) => {
      const obj = {};
      headers.forEach((header, i) => {
        obj[header] = row[i];
      });
      return obj;
    });
    
    if (materialId) {
      movements = movements.filter(m => m.material_id === materialId);
    }
    if (movementType) {
      movements = movements.filter(m => m.movement_type === movementType);
    }
    
    // Sort by created_at desc
    movements.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    const total = movements.length;
    const totalPages = Math.ceil(total / sizeNum);
    const start = (pageNum - 1) * sizeNum;
    const paginated = movements.slice(start, start + sizeNum);
    
    const items = paginated.map(m => ({
      id: m.movement_id,
      movementId: m.movement_id,
      materialId: m.material_id,
      movementType: m.movement_type,
      quantity: Number(m.quantity) || 0,
      referenceId: m.reference_id,
      notes: m.notes,
      createdAt: m.created_at,
    }));
    
    return { items, total, page: pageNum, pageSize: sizeNum, totalPages };
  },
  
  /**
   * Delete material (admin) - soft delete by marking as inactive
   */
  'inventory.delete': function(payload, requestId) {
    const { materialId } = payload;
    
    if (!materialId) {
      throw new Error('materialId is required');
    }
    
    return withSpreadsheetLock(() => {
      const sheet = getSheet(SHEET_NAMES.INVENTORY);
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const idIndex = headers.indexOf('material_id');
      const activeIndex = headers.indexOf('active');
      
      let rowIndex = -1;
      for (let i = 1; i < data.length; i++) {
        if (data[i][idIndex] === materialId) {
          rowIndex = i + 1;
          break;
        }
      }
      
      if (rowIndex === -1) {
        throw new Error('Material not found');
      }
      
      // Soft delete by marking as inactive
      if (activeIndex >= 0) {
        sheet.getRange(rowIndex, activeIndex + 1).setValue('FALSE');
      } else {
        // If no active column, actually delete the row
        sheet.deleteRow(rowIndex);
      }
      
      logAudit('system', 'material_deleted', 'inventory', materialId, {});
      
      return { materialId, message: 'Material deleted successfully' };
    });
  },
};