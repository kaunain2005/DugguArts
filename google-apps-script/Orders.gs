/**
 * Duggu Arts - Google Apps Script Orders Handler
 * 
 * Handles all order-related operations: create, update, list, etc.
 */

const OrdersHandler = {
  /**
   * Create new order from customer
   */
  'orders.create': function(payload, requestId) {
    validatePayload(payload, 'order');
    
    // Verify all products exist and get current prices
    const productSheet = getSheet(SHEET_NAMES.PRODUCTS);
    const productData = productSheet.getDataRange().getValues();
    const productHeaders = productData[0];
    const productIdIndex = productHeaders.indexOf('product_id');
    const priceIndex = productHeaders.indexOf('price');
    const nameIndex = productHeaders.indexOf('name');
    const activeIndex = productHeaders.indexOf('active');
    const stockIndex = productHeaders.indexOf('stock_status');
    
    const productMap = {};
    productData.slice(1).forEach(row => {
      productMap[row[productIdIndex]] = {
        price: Number(row[priceIndex]) || 0,
        name: row[nameIndex],
        active: String(row[activeIndex]).toLowerCase() === 'true',
        stockStatus: row[stockIndex],
      };
    });
    
    // Validate items and calculate totals server-side
    let subtotal = 0;
    const orderItems = [];
    
    for (const item of payload.items) {
      const product = productMap[item.productId];
      if (!product) {
        throw new Error(`Product not found: ${item.productId}`);
      }
      if (!product.active) {
        throw new Error(`Product not available: ${product.name}`);
      }
      if (product.stockStatus === 'out_of_stock') {
        throw new Error(`Product out of stock: ${product.name}`);
      }
      
      const unitPrice = product.price;
      const lineTotal = unitPrice * item.quantity;
      subtotal += lineTotal;
      
      orderItems.push({
        productId: item.productId,
        productName: product.name,
        quantity: item.quantity,
        unitPrice: unitPrice,
        selectedColour: item.selectedColour || '',
        personalisation: item.personalisation || '',
        wrapping: item.wrapping || false,
        messageCard: item.messageCard || '',
        lineTotal: lineTotal,
      });
    }
    
    // Get settings for packaging and delivery charges
    const settings = getSettings();
    const packagingCharge = settings.packaging_charge || 50;
    const deliveryCharge = subtotal >= (settings.free_delivery_threshold || 999) ? 0 : (settings.delivery_charge || 100);
    const totalAmount = subtotal + packagingCharge + deliveryCharge;
    
    return withSpreadsheetLock(() => {
      const now = getCurrentTimestamp();
      const orderId = generateId('ORD');
      const customerId = generateId('CUST');
      
      // Create or find customer
      let customer = findOrCreateCustomer(payload);
      
      // Insert order
      const orderSheet = getSheet(SHEET_NAMES.ORDERS);
      const orderRow = [
        orderId,
        customer.customerId,
        now.split('T')[0], // order_date
        payload.customerName,
        payload.phone,
        payload.email || '',
        payload.deliveryAddress,
        payload.pincode,
        payload.city,
        payload.state,
        subtotal,
        packagingCharge,
        deliveryCharge,
        totalAmount,
        'unpaid', // payment_status
        'new', // order_status
        'whatsapp', // payment_method
        payload.customerNotes || '',
        now,
        now,
      ];
      orderSheet.appendRow(orderRow);
      
      // Insert order items
      const itemsSheet = getSheet(SHEET_NAMES.ORDER_ITEMS);
      orderItems.forEach(item => {
        const itemId = generateId('OITEM');
        const itemRow = [
          itemId,
          orderId,
          item.productId,
          item.productName,
          item.quantity,
          item.unitPrice,
          item.selectedColour,
          item.personalisation,
          item.wrapping,
          item.messageCard,
          item.lineTotal,
        ];
        itemsSheet.appendRow(itemRow);
      });
      
      logAudit('system', 'order_created', 'order', orderId, { 
        customerName: payload.customerName, 
        totalAmount, 
        itemCount: orderItems.length 
      });
      
      return { 
        orderId, 
        customerId: customer.customerId,
        totalAmount,
        message: 'Order created successfully' 
      };
    });
  },
  
  /**
   * List orders with filtering (admin)
   */
  'orders.list': function(payload, requestId) {
    const { 
      page = 1, 
      pageSize = APP_SETTINGS.DEFAULT_PAGE_SIZE,
      status = '',
      paymentStatus = '',
      search = '',
      startDate = '',
      endDate = '',
    } = payload;
    
    const pageNum = Math.max(1, parseInt(page));
    const sizeNum = Math.min(APP_SETTINGS.MAX_PAGE_SIZE, Math.max(1, parseInt(pageSize)));
    
    const sheet = getSheet(SHEET_NAMES.ORDERS);
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      return { items: [], total: 0, page: pageNum, pageSize: sizeNum, totalPages: 0 };
    }
    
    const headers = data[0];
    const rows = data.slice(1);
    
    let orders = rows.map((row) => {
      const obj = {};
      headers.forEach((header, i) => {
        obj[header] = row[i];
      });
      return obj;
    });
    
    // Apply filters
    if (status) {
      orders = orders.filter(o => o.order_status === status);
    }
    if (paymentStatus) {
      orders = orders.filter(o => o.payment_status === paymentStatus);
    }
    if (search) {
      const searchLower = search.toLowerCase();
      orders = orders.filter(o => 
        (o.order_id?.toLowerCase().includes(searchLower)) ||
        (o.customer_name?.toLowerCase().includes(searchLower)) ||
        (o.phone?.includes(searchLower)) ||
        (o.email?.toLowerCase().includes(searchLower))
      );
    }
    if (startDate) {
      orders = orders.filter(o => o.order_date >= startDate);
    }
    if (endDate) {
      orders = orders.filter(o => o.order_date <= endDate);
    }
    
    // Sort by order_date desc
    orders.sort((a, b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime());
    
    const total = orders.length;
    const totalPages = Math.ceil(total / sizeNum);
    const start = (pageNum - 1) * sizeNum;
    const paginated = orders.slice(start, start + sizeNum);
    
    const items = paginated.map(o => ({
      id: o.order_id,
      orderId: o.order_id,
      customerId: o.customer_id,
      orderDate: o.order_date,
      customerName: o.customer_name,
      phone: o.phone,
      email: o.email,
      deliveryAddress: o.delivery_address,
      pincode: o.pincode,
      city: o.city,
      state: o.state,
      subtotal: Number(o.subtotal) || 0,
      packagingCharge: Number(o.packaging_charge) || 0,
      deliveryCharge: Number(o.delivery_charge) || 0,
      totalAmount: Number(o.total_amount) || 0,
      paymentStatus: o.payment_status,
      orderStatus: o.order_status,
      paymentMethod: o.payment_method,
      customerNotes: o.customer_notes,
      createdAt: o.created_at,
      updatedAt: o.updated_at,
    }));
    
    return { items, total, page: pageNum, pageSize: sizeNum, totalPages };
  },
  
  /**
   * Get order by ID (with items)
   */
  'orders.get': function(payload, requestId) {
    const { orderId } = payload;
    
    if (!orderId) {
      throw new Error('orderId is required');
    }
    
    const orderSheet = getSheet(SHEET_NAMES.ORDERS);
    const orderData = orderSheet.getDataRange().getValues();
    
    if (orderData.length <= 1) {
      return null;
    }
    
    const orderHeaders = orderData[0];
    const orderRows = orderData.slice(1);
    const orderIdIndex = orderHeaders.indexOf('order_id');
    
    const orderRow = orderRows.find(r => r[orderIdIndex] === orderId);
    if (!orderRow) {
      return null;
    }
    
    const order = {};
    orderHeaders.forEach((header, i) => {
      order[header] = orderRow[i];
    });
    
    // Get order items
    const itemsSheet = getSheet(SHEET_NAMES.ORDER_ITEMS);
    const itemsData = itemsSheet.getDataRange().getValues();
    const itemHeaders = itemsData[0];
    const itemRows = itemsData.slice(1);
    const orderIdItemIndex = itemHeaders.indexOf('order_id');
    
    const items = itemRows
      .filter(r => r[orderIdItemIndex] === orderId)
      .map(row => {
        const item = {};
        itemHeaders.forEach((header, i) => {
          item[header] = row[i];
        });
        return {
          id: item.order_item_id,
          orderItemId: item.order_item_id,
          orderId: item.order_id,
          productId: item.product_id,
          productNameSnapshot: item.product_name_snapshot,
          quantity: Number(item.quantity) || 0,
          unitPriceSnapshot: Number(item.unit_price_snapshot) || 0,
          selectedColour: item.selected_colour,
          personalisation: item.personalisation,
          wrapping: String(item.wrapping).toLowerCase() === 'true',
          messageCard: item.message_card,
          lineTotal: Number(item.line_total) || 0,
        };
      });
    
    return {
      id: order.order_id,
      orderId: order.order_id,
      customerId: order.customer_id,
      orderDate: order.order_date,
      customerName: order.customer_name,
      phone: order.phone,
      email: order.email,
      deliveryAddress: order.delivery_address,
      pincode: order.pincode,
      city: order.city,
      state: order.state,
      subtotal: Number(order.subtotal) || 0,
      packagingCharge: Number(order.packaging_charge) || 0,
      deliveryCharge: Number(order.delivery_charge) || 0,
      totalAmount: Number(order.total_amount) || 0,
      paymentStatus: order.payment_status,
      orderStatus: order.order_status,
      paymentMethod: order.payment_method,
      customerNotes: order.customer_notes,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
      items,
    };
  },
  
  /**
   * Update order (admin)
   */
  'orders.update': function(payload, requestId) {
    const { orderId, orderStatus, paymentStatus, internalNotes } = payload;
    
    if (!orderId) {
      throw new Error('orderId is required');
    }
    
    if (!orderStatus && !paymentStatus && !internalNotes) {
      throw new Error('At least one field to update is required');
    }
    
    // Validate status values
    if (orderStatus && !VALIDATION.ORDER_STATUSES.includes(orderStatus)) {
      throw new Error(`Invalid order status: ${orderStatus}`);
    }
    if (paymentStatus && !VALIDATION.PAYMENT_STATUSES.includes(paymentStatus)) {
      throw new Error(`Invalid payment status: ${paymentStatus}`);
    }
    
    return withSpreadsheetLock(() => {
      const sheet = getSheet(SHEET_NAMES.ORDERS);
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const idIndex = headers.indexOf('order_id');
      const statusIndex = headers.indexOf('order_status');
      const paymentIndex = headers.indexOf('payment_status');
      const updatedAtIndex = headers.indexOf('updated_at');
      
      let rowIndex = -1;
      for (let i = 1; i < data.length; i++) {
        if (data[i][idIndex] === orderId) {
          rowIndex = i + 1;
          break;
        }
      }
      
      if (rowIndex === -1) {
        throw new Error('Order not found');
      }
      
      const now = getCurrentTimestamp();
      const updates = {};
      
      if (orderStatus) updates.order_status = orderStatus;
      if (paymentStatus) updates.payment_status = paymentStatus;
      if (internalNotes !== undefined) updates.internal_notes = internalNotes;
      updates.updated_at = now;
      
      Object.entries(updates).forEach(([key, value]) => {
        const headerName = key === 'internal_notes' ? 'internal_notes' : key;
        const colIndex = headers.indexOf(headerName);
        if (colIndex >= 0) {
          sheet.getRange(rowIndex, colIndex + 1).setValue(value);
        }
      });
      
      logAudit('system', 'order_updated', 'order', orderId, { 
        orderStatus, 
        paymentStatus, 
        hasNotes: !!internalNotes 
      });
      
      return { orderId, message: 'Order updated successfully' };
    });
  },
};

// Helper: Find or create customer
function findOrCreateCustomer(payload) {
  const sheet = getSheet(SHEET_NAMES.CUSTOMERS);
  const data = sheet.getDataRange().getValues();
  
  if (data.length <= 1) {
    // Create new customer
    const customerId = generateId('CUST');
    const now = getCurrentTimestamp();
    sheet.appendRow([customerId, payload.customerName, payload.phone, payload.email || '', now, true]);
    return { customerId, isNew: true };
  }
  
  const headers = data[0];
  const rows = data.slice(1);
  const phoneIndex = headers.indexOf('phone');
  const idIndex = headers.indexOf('customer_id');
  
  // Find by phone
  const existing = rows.find(r => r[phoneIndex] === payload.phone);
  if (existing) {
    return { customerId: existing[idIndex], isNew: false };
  }
  
  // Create new
  const customerId = generateId('CUST');
  const now = getCurrentTimestamp();
  sheet.appendRow([customerId, payload.customerName, payload.phone, payload.email || '', now, true]);
  return { customerId, isNew: true };
}

// Helper: Get settings
function getSettings() {
  const sheet = getSheet(SHEET_NAMES.SETTINGS);
  const data = sheet.getDataRange().getValues();
  
  if (data.length <= 1) {
    return APP_SETTINGS.DEFAULT_SETTINGS;
  }
  
  const settings = {};
  data.slice(1).forEach(row => {
    settings[row[0]] = row[1];
  });
  
  // Merge with defaults
  return { ...APP_SETTINGS.DEFAULT_SETTINGS, ...settings };
}