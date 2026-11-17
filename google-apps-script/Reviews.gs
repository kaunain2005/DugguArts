/**
 * Duggu Arts - Google Apps Script Reviews Handler
 * 
 * Handles customer review operations
 * Uses centralized utilities from Config.gs and Security.gs
 */

const ReviewsHandler = {
  /**
   * List approved reviews for public display
   */
  'reviews.listApproved': function(payload, requestId) {
    const { 
      productId = '',
      page = 1, 
      pageSize = APP_SETTINGS.DEFAULT_PAGE_SIZE,
      featured = '',
    } = payload;
    
    const pageNum = Math.max(1, parseInt(page));
    const sizeNum = Math.min(APP_SETTINGS.MAX_PAGE_SIZE, Math.max(1, parseInt(pageSize)));
    
    const sheet = getSheet(SHEET_NAMES.REVIEWS);
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      return { items: [], total: 0, page: pageNum, pageSize: sizeNum, totalPages: 0 };
    }
    
    const headers = data[0];
    const rows = data.slice(1);
    
    let reviews = rows.map((row) => {
      const obj = {};
      headers.forEach((header, i) => {
        obj[header] = row[i];
      });
      return obj;
    });
    
    // Only approved reviews with display permission
    reviews = reviews.filter(r => 
      r.approval_status === 'approved' && 
      String(r.display_permission).toLowerCase() === 'true'
    );
    
    if (productId) {
      reviews = reviews.filter(r => r.product_id === productId);
    }
    if (featured) {
      reviews = reviews.filter(r => String(r.featured).toLowerCase() === 'true');
    }
    
    // Sort by review_date desc
    reviews.sort((a, b) => new Date(b.review_date).getTime() - new Date(a.review_date).getTime());
    
    const total = reviews.length;
    const totalPages = Math.ceil(total / sizeNum);
    const start = (pageNum - 1) * sizeNum;
    const paginated = reviews.slice(start, start + sizeNum);
    
    const items = paginated.map(r => ({
      id: r.review_id,
      reviewId: r.review_id,
      customerName: r.customer_name,
      productId: r.product_id,
      rating: Number(r.rating) || 0,
      title: r.title,
      reviewText: r.review_text,
      reviewDate: r.review_date,
      photoUrl: r.photo_url,
      featured: String(r.featured).toLowerCase() === 'true',
    }));
    
    return { items, total, page: pageNum, pageSize: sizeNum, totalPages };
  },
  
  /**
   * List reviews - routes to listApproved or listAll based on approvedOnly parameter
   * This is the main entry point for frontend calls
   */
  'reviews.list': function(payload, requestId) {
    const { approvedOnly = true, ...params } = payload;
    
    if (approvedOnly) {
      return ReviewsHandler['reviews.listApproved'](params, requestId);
    } else {
      return ReviewsHandler['reviews.listAll'](params, requestId);
    }
  },
  
  /**
   * List all reviews for admin moderation
   */
  'reviews.listAll': function(payload, requestId) {
    const { 
      page = 1, 
      pageSize = APP_SETTINGS.DEFAULT_PAGE_SIZE,
      status = '',
      productId = '',
      search = '',
      approvalStatus = '',
      featured = '',
      sortBy = 'review_date',
      sortOrder = 'desc',
    } = payload;
    
    const pageNum = Math.max(1, parseInt(page));
    const sizeNum = Math.min(APP_SETTINGS.MAX_PAGE_SIZE, Math.max(1, parseInt(pageSize)));
    
    const sheet = getSheet(SHEET_NAMES.REVIEWS);
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      return { items: [], total: 0, page: pageNum, pageSize: sizeNum, totalPages: 0 };
    }
    
    const headers = data[0];
    const rows = data.slice(1);
    
    let reviews = rows.map((row) => {
      const obj = {};
      headers.forEach((header, i) => {
        obj[header] = row[i];
      });
      return obj;
    });
    
    if (approvalStatus || status) {
      reviews = reviews.filter(r => r.approval_status === (approvalStatus || status));
    }
    if (productId) {
      reviews = reviews.filter(r => r.product_id === productId);
    }
    if (search) {
      const searchLower = search.toLowerCase();
      reviews = reviews.filter(r => 
        (r.customer_name?.toLowerCase().includes(searchLower)) ||
        (r.title?.toLowerCase().includes(searchLower)) ||
        (r.review_text?.toLowerCase().includes(searchLower)) ||
        (r.product_id?.toLowerCase().includes(searchLower))
      );
    }
    if (featured !== '') {
      reviews = reviews.filter(r => String(r.featured).toLowerCase() === String(featured).toLowerCase());
    }
    
    // Sort
    const sortFields = {
      'review_date': 'review_date',
      'rating': 'rating',
      'customer_name': 'customer_name',
    };
    
    const sortField = sortFields[sortBy] || 'review_date';
    const isDesc = sortOrder === 'desc';
    
    reviews.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      
      if (sortField === 'rating') {
        valA = Number(valA) || 0;
        valB = Number(valB) || 0;
      }
      
      if (sortField === 'review_date') {
        valA = new Date(valA).getTime() || 0;
        valB = new Date(valB).getTime() || 0;
      }
      
      if (valA < valB) return isDesc ? 1 : -1;
      if (valA > valB) return isDesc ? -1 : 1;
      return 0;
    });
    
    const total = reviews.length;
    const totalPages = Math.ceil(total / sizeNum);
    const start = (pageNum - 1) * sizeNum;
    const paginated = reviews.slice(start, start + sizeNum);
    
    const items = paginated.map(r => ({
      id: r.review_id,
      reviewId: r.review_id,
      customerName: r.customer_name,
      productId: r.product_id,
      rating: Number(r.rating) || 0,
      title: r.title,
      reviewText: r.review_text,
      reviewDate: r.review_date,
      photoUrl: r.photo_url,
      displayPermission: String(r.display_permission).toLowerCase() === 'true',
      approvalStatus: r.approval_status,
      featured: String(r.featured).toLowerCase() === 'true',
    }));
    
    return { items, total, page: pageNum, pageSize: sizeNum, totalPages };
  },
  
  /**
   * Get review by ID
   */
  'reviews.get': function(payload, requestId) {
    const { reviewId } = payload;
    
    if (!reviewId) {
      throw new Error('reviewId is required');
    }
    
    const sheet = getSheet(SHEET_NAMES.REVIEWS);
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      return null;
    }
    
    const headers = data[0];
    const rows = data.slice(1);
    const idIndex = headers.indexOf('review_id');
    
    const row = rows.find(r => r[idIndex] === reviewId);
    if (!row) {
      return null;
    }
    
    const r = {};
    headers.forEach((header, i) => {
      r[header] = row[i];
    });
    
    return {
      id: r.review_id,
      reviewId: r.review_id,
      customerName: r.customer_name,
      productId: r.product_id,
      rating: Number(r.rating) || 0,
      title: r.title,
      reviewText: r.review_text,
      reviewDate: r.review_date,
      photoUrl: r.photo_url,
      displayPermission: String(r.display_permission).toLowerCase() === 'true',
      approvalStatus: r.approval_status,
      featured: String(r.featured).toLowerCase() === 'true',
    };
  },
  
  /**
   * Moderate review (approve/reject/feature) - admin
   */
  'reviews.moderate': function(payload, requestId) {
    const { reviewId, approvalStatus, featured } = payload;
    
    if (!reviewId) {
      throw new Error('reviewId is required');
    }
    
    if (!approvalStatus && featured === undefined) {
      throw new Error('At least approvalStatus or featured is required');
    }
    
    if (approvalStatus && !VALIDATION.REVIEW_STATUSES.includes(approvalStatus)) {
      throw new Error(`Invalid approval status: ${approvalStatus}`);
    }
    
    return withSpreadsheetLock(() => {
      const sheet = getSheet(SHEET_NAMES.REVIEWS);
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const idIndex = headers.indexOf('review_id');
      const approvalIndex = headers.indexOf('approval_status');
      const featuredIndex = headers.indexOf('featured');
      
      let rowIndex = -1;
      for (let i = 1; i < data.length; i++) {
        if (data[i][idIndex] === reviewId) {
          rowIndex = i + 1;
          break;
        }
      }
      
      if (rowIndex === -1) {
        throw new Error('Review not found');
      }
      
      if (approvalStatus) {
        sheet.getRange(rowIndex, approvalIndex + 1).setValue(approvalStatus);
      }
      if (featured !== undefined) {
        sheet.getRange(rowIndex, featuredIndex + 1).setValue(featured);
      }
      
      logAudit('system', 'review_moderated', 'review', reviewId, { 
        approvalStatus, 
        featured 
      });
      
      return { reviewId, message: 'Review moderated successfully' };
    });
  },
  
  /**
   * Get review statistics
   */
  'reviews.stats': function(payload, requestId) {
    const { productId = '' } = payload;
    
    const sheet = getSheet(SHEET_NAMES.REVIEWS);
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      return { 
        averageRating: 0, 
        totalReviews: 0, 
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } 
      };
    }
    
    const headers = data[0];
    const rows = data.slice(1);
    
    let reviews = rows.map((row) => {
      const obj = {};
      headers.forEach((header, i) => {
        obj[header] = row[i];
      });
      return obj;
    });
    
    // Only approved with permission
    reviews = reviews.filter(r => 
      r.approval_status === 'approved' && 
      String(r.display_permission).toLowerCase() === 'true'
    );
    
    if (productId) {
      reviews = reviews.filter(r => r.product_id === productId);
    }
    
    const totalReviews = reviews.length;
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let sumRating = 0;
    
    reviews.forEach(r => {
      const rating = Number(r.rating) || 0;
      if (rating >= 1 && rating <= 5) {
        ratingDistribution[rating]++;
        sumRating += rating;
      }
    });
    
    const averageRating = totalReviews > 0 ? (sumRating / totalReviews).toFixed(1) : 0;
    
    return { 
      averageRating: Number(averageRating), 
      totalReviews, 
      ratingDistribution 
    };
  },
};