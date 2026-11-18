/**
 * Client-side service for calling Google Apps Script backend
 * This runs in the browser and calls Next.js API routes (which proxy to Apps Script)
 */

const APPS_SCRIPT_BASE_URL = process.env.SITE_URL ? `${process.env.SITE_URL}/api/apps-script` : '/api/apps-script';

interface RequestOptions {
  action: string;
  payload?: Record<string, unknown> | object;
  requestId?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
  };
}

class AppsScriptClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor() {
    this.baseUrl = APPS_SCRIPT_BASE_URL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  private generateRequestId(): string {
    return `req_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;
  }

  async request<T>(action: string, payload: Record<string, unknown> | object = {}): Promise<T> {
    const requestId = this.generateRequestId();
    
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: this.defaultHeaders,
      body: JSON.stringify({
        action,
        payload,
        requestId,
        // Secret is added server-side in Next.js API route
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Request failed' } }));
      throw new Error(error.error?.message || `HTTP ${response.status}`);
    }

    const result: ApiResponse<T> = await response.json();
    
    if (!result.success) {
      throw new Error(result.error?.message || 'Operation failed');
    }

    return result.data as T;
  }

  // =============================================================================
  // PRODUCTS
  // =============================================================================

  async listProducts(params: {
    page?: number;
    pageSize?: number;
    search?: string;
    category?: string;
    stockStatus?: string;
    featured?: boolean;
    active?: boolean;
    sortBy?: string;
    sortOrder?: string;
  } = {}) {
    return this.request<{
      items: Product[];
      total: number;
      page: number;
      pageSize: number;
      totalPages: number;
    }>('products.list', params);
  }

  async getProduct(idOrSlug: { id?: string; slug?: string }) {
    return this.request<Product | null>('products.get', idOrSlug);
  }

  // =============================================================================
  // CATEGORIES
  // =============================================================================

  async listCategories(activeOnly = true) {
    return this.request<Category[]>('categories.list', { active: activeOnly });
  }

  async getCategory(idOrSlug: { id?: string; slug?: string }) {
    return this.request<Category | null>('categories.get', idOrSlug);
  }

  // =============================================================================
  // ORDERS
  // =============================================================================

  async createOrder(orderData: CreateOrderPayload) {
    return this.request<{ orderId: string; orderReference: string }>('orders.create', orderData);
  }

  // =============================================================================
  // CUSTOM REQUESTS
  // =============================================================================

  async createCustomRequest(requestData: CustomRequestPayload) {
    return this.request<{ requestId: string; reference: string }>('requests.create', requestData);
  }

  // =============================================================================
  // REVIEWS
  // =============================================================================

  async listReviews(params: {
    productId?: string;
    approvedOnly?: boolean;
    featured?: boolean;
    page?: number;
    pageSize?: number;
  } = {}) {
    return this.request<{
      items: Review[];
      total: number;
      page: number;
      pageSize: number;
      totalPages: number;
    }>('reviews.list', params);
  }

  // =============================================================================
  // SETTINGS
  // =============================================================================

  async getPublicSettings() {
    return this.request<PublicSettings>('settings.getPublic');
  }

  async getReviewStats(productId?: string) {
    return this.request<{
      averageRating: number;
      totalReviews: number;
      ratingDistribution: Record<number, number>;
    }>('reviews.stats', { productId });
  }

  // =============================================================================
  // ADMIN ACTIONS (require authentication)
  // =============================================================================

  async adminRequest<T>(action: string, payload: Record<string, unknown> = {}): Promise<T> {
    // Admin requests go through Next.js API routes with session validation
    const response = await fetch(`/api/admin/${action}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      credentials: 'include', // Include cookies for session
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Request failed' } }));
      throw new Error(error.error?.message || `HTTP ${response.status}`);
    }

    const result: ApiResponse<T> = await response.json();
    
    if (!result.success) {
      throw new Error(result.error?.message || 'Operation failed');
    }

    return result.data as T;
  }
}

// Types (these should match the types in src/types/index.ts)
interface Product {
  id: string;
  productId: string;
  name: string;
  slug: string;
  categoryId: string;
  categoryName?: string;
  description: string;
  price: number;
  imageUrl: string;
  galleryUrls: string[];
  colours: string[];
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock' | 'made_to_order';
  featured: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Category {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  active: boolean;
  displayOrder: number;
}

interface Review {
  id: string;
  reviewId: string;
  customerName: string;
  productId: string;
  productName?: string;
  rating: number;
  title: string;
  reviewText: string;
  reviewDate: string;
  photoUrl?: string;
  displayPermission: boolean;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  featured: boolean;
}

interface PublicSettings {
  businessName: string;
  whatsappNumber: string;
  instagramUrl: string;
  contactEmail: string;
  announcementText: string;
  packagingCharge: number;
  deliveryCharge: number;
  freeDeliveryThreshold: number;
}

interface CreateOrderPayload {
  customerName: string;
  phone: string;
  email?: string;
  deliveryAddress: string;
  pincode: string;
  city: string;
  state: string;
  customerNotes?: string;
  items: Array<{
    productId: string;
    quantity: number;
    selectedColour?: string;
    personalisation?: string;
    wrapping?: boolean;
    messageCard?: string;
  }>;
}

interface CustomRequestPayload {
  customerName: string;
  phone: string;
  email?: string;
  flowers: string[];
  quantities: number[];
  colours: string[];
  bouquetSize: string;
  wrapping: string;
  budgetMin: number;
  budgetMax: number;
  messageCard: string;
  requiredDate: string;
  notes?: string;
}

// Export singleton instance
export const appsScriptClient = new AppsScriptClient();

// Export class for testing
export { AppsScriptClient };