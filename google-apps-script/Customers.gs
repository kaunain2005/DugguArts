/**
 * Duggu Arts - Google Apps Script Customers Handler
 * 
 * Handles customer-related operations
 * Uses centralized utilities from Config.gs and Security.gs
 */

const CustomersHandler = {
  /**
   * List customers with filtering (admin)
   */
  'customers.list': function(payload, requestId) {
    const { 
      page = 1, 
      pageSize = APP_SETTINGS.DEFAULT_PAGE_SIZE,
      search = '',
    } = payload;
    
    const pageNum = Math.max(1, parseInt(page));
    const sizeNum = Math.min(APP_SETTINGS.MAX_PAGE_SIZE, Math.max(1, parseInt(pageSize)));
    
    const sheet = getSheet(SHEET_NAMES.CUSTOMERS);
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      return { items: [], total: 0, page: pageNum, pageSize: sizeNum, totalPages: 0 };
    }
    
    const headers = data[0];
    const rows = data.slice(1);
    
    let customers = rows.map((row) => {
      const obj = {};
      headers.forEach((header, i) => {
        obj[header] = row[i];
      });
      return obj;
    });
    
    if (search) {
      const searchLower = search.toLowerCase();
      customers = customers.filter(c => 
        (c.customer_name?.toLowerCase().includes(searchLower)) ||
        (c.phone?.includes(searchLower)) ||
        (c.email?.toLowerCase().includes(searchLower))
      );
    }
    
    // Sort by created_at desc
    customers.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    const total = customers.length;
    const totalPages = Math.ceil(total / sizeNum);
    const start = (pageNum - 1) * sizeNum;
    const paginated = customers.slice(start, start + sizeNum);
    
    const items = paginated.map(c => ({
      id: c.customer_id,
      customerId: c.customer_id,
      customerName: c.customer_name,
      phone: c.phone,
      email: c.email,
      createdAt: c.created_at,
      contactConsent: String(c.contact_consent).toLowerCase() === 'true',
    }));
    
    return { items, total, page: pageNum, pageSize: sizeNum, totalPages };
  },
  
  /**
   * Get customer by ID with order history
   */
  'customers.get': function(payload, requestId) {
    const { customerId } = payload;
    
    if (!customerId) {
      throw new Error('customerId is required');
    }
    
    const sheet = getSheet(SHEET_NAMES.CUSTOMERS);
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      return null;
    }
    
    const headers = data[0];
    const rows = data.slice(1);
    const idIndex = headers.indexOf('customer_id');
    
    const row = rows.find(r => r[idIndex] === customerId);
    if (!row) {
      return null;
    }
    
    const customer = {};
    headers.forEach((header, i) => {
      customer[header] = row[i];
    });
    
    // Get customer's orders
    const ordersSheet = getSheet(SHEET_NAMES.ORDERS);
    const ordersData = ordersSheet.getDataRange().getValues();
    const orderHeaders = ordersData[0];
    const orderRows = ordersData.slice(1);
    const custIdIndex = orderHeaders.indexOf('customer_id');
    
    const orders = orderRows
      .filter(r => r[custIdIndex] === customerId)
      .map(row => {
        const order = {};
        orderHeaders.forEach((header, i) => {
          order[header] = row[i];
        });
        return {
          orderId: order.order_id,
          orderDate: order.order_date,
          totalAmount: Number(order.total_amount) || 0,
          orderStatus: order.order_status,
          paymentStatus: order.payment_status,
        };
      })
      .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
    
    // Get total spent
    const totalSpent = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    
    return {
      id: customer.customer_id,
      customerId: customer.customer_id,
      customerName: customer.customer_name,
      phone: customer.phone,
      email: customer.email,
      createdAt: customer.created_at,
      contactConsent: String(customer.contact_consent).toLowerCase() === 'true',
      orders,
      totalOrders: orders.length,
      totalSpent,
    };
  },
};