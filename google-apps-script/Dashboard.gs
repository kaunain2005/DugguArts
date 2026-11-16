/**
 * Duggu Arts - Google Apps Script Dashboard Handler
 * 
 * Handles admin dashboard summary statistics
 * Uses centralized utilities from Config.gs and Security.gs
 */

const DashboardHandler = {
  /**
   * Get dashboard summary statistics
   */
  'dashboard.summary': function(payload, requestId) {
    // Get products count
    const productsSheet = getSheet(SHEET_NAMES.PRODUCTS);
    const productsData = productsSheet.getDataRange().getValues();
    let totalProducts = 0, activeProducts = 0;
    if (productsData.length > 1) {
      const headers = productsData[0];
      const activeIndex = headers.indexOf('active');
      productsData.slice(1).forEach(row => {
        totalProducts++;
        if (String(row[activeIndex]).toLowerCase() === 'true') activeProducts++;
      });
    }
    
    // Get orders stats
    const ordersSheet = getSheet(SHEET_NAMES.ORDERS);
    const ordersData = ordersSheet.getDataRange().getValues();
    let totalOrders = 0, newEnquiries = 0, totalRevenue = 0;
    const orderStatusCounts = {};
    const paymentStatusCounts = {};
    if (ordersData.length > 1) {
      const headers = ordersData[0];
      const statusIndex = headers.indexOf('order_status');
      const paymentIndex = headers.indexOf('payment_status');
      const totalIndex = headers.indexOf('total_amount');
      const dateIndex = headers.indexOf('order_date');
      
      ordersData.slice(1).forEach(row => {
        totalOrders++;
        const status = row[statusIndex];
        const payment = row[paymentIndex];
        const total = Number(row[totalIndex]) || 0;
        const orderDate = row[dateIndex];
        
        orderStatusCounts[status] = (orderStatusCounts[status] || 0) + 1;
        paymentStatusCounts[payment] = (paymentStatusCounts[payment] || 0) + 1;
        
        if (status === 'new') newEnquiries++;
        if (payment === 'paid') totalRevenue += total;
      });
    }
    
    // Get custom requests stats
    const requestsSheet = getSheet(SHEET_NAMES.CUSTOM_REQUESTS);
    const requestsData = requestsSheet.getDataRange().getValues();
    let totalRequests = 0, pendingRequests = 0;
    if (requestsData.length > 1) {
      const headers = requestsData[0];
      const statusIndex = headers.indexOf('request_status');
      requestsData.slice(1).forEach(row => {
        totalRequests++;
        if (row[statusIndex] === 'pending') pendingRequests++;
      });
    }
    
    // Get reviews stats
    const reviewsSheet = getSheet(SHEET_NAMES.REVIEWS);
    const reviewsData = reviewsSheet.getDataRange().getValues();
    let pendingReviews = 0;
    if (reviewsData.length > 1) {
      const headers = reviewsData[0];
      const statusIndex = headers.indexOf('approval_status');
      reviewsData.slice(1).forEach(row => {
        if (row[statusIndex] === 'pending') pendingReviews++;
      });
    }
    
    // Get low stock materials
    const inventorySheet = getSheet(SHEET_NAMES.INVENTORY);
    const inventoryData = inventorySheet.getDataRange().getValues();
    let lowStockCount = 0;
    if (inventoryData.length > 1) {
      const headers = inventoryData[0];
      const stockIndex = headers.indexOf('current_stock');
      const reorderIndex = headers.indexOf('reorder_level');
      inventoryData.slice(1).forEach(row => {
        const current = Number(row[stockIndex]) || 0;
        const reorder = Number(row[reorderIndex]) || 0;
        if (current <= reorder && current > 0) lowStockCount++;
      });
    }
    
    // Recent activity (last 10 orders)
    let recentActivity = [];
    if (ordersData.length > 1) {
      const headers = ordersData[0];
      const idIndex = headers.indexOf('order_id');
      const nameIndex = headers.indexOf('customer_name');
      const statusIndex = headers.indexOf('order_status');
      const dateIndex = headers.indexOf('order_date');
      
      recentActivity = ordersData.slice(1)
        .sort((a, b) => new Date(b[dateIndex]).getTime() - new Date(a[dateIndex]).getTime())
        .slice(0, 10)
        .map(row => ({
          type: 'order',
          orderId: row[idIndex],
          customerName: row[nameIndex],
          status: row[statusIndex],
          date: row[dateIndex],
        }));
    }
    
    return {
      products: {
        total: totalProducts,
        active: activeProducts,
      },
      orders: {
        total: totalOrders,
        newEnquiries,
        byStatus: orderStatusCounts,
        byPaymentStatus: paymentStatusCounts,
      },
      revenue: {
        total: totalRevenue, // Only paid orders
      },
      customRequests: {
        total: totalRequests,
        pending: pendingRequests,
      },
      reviews: {
        pending: pendingReviews,
      },
      inventory: {
        lowStock: lowStockCount,
      },
      recentActivity,
    };
  },
};