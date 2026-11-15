/**
 * Server-side service layer for calling Google Apps Script backend
 * This runs on the Next.js server (not in the browser)
 */

const APPS_SCRIPT_URL = process.env.GOOGLE_APPS_SCRIPT_URL;
const APPS_SCRIPT_SECRET = process.env.GOOGLE_APPS_SCRIPT_SECRET;

interface RequestPayload {
  action: string;
  payload?: Record<string, unknown> | object;
  requestId?: string;
  secret?: string;
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

class AppsScriptService {
  private baseUrl: string;
  private secret: string;

  constructor() {
    this.baseUrl = APPS_SCRIPT_URL || '';
    this.secret = APPS_SCRIPT_SECRET || '';
  }

  private generateRequestId(): string {
    return `req_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private async callAppsScript<T>(action: string, payload: Record<string, unknown> | object = {}): Promise<T> {
    if (!this.baseUrl || !this.secret) {
      throw new Error('Apps Script configuration missing');
    }

    const requestId = this.generateRequestId();
    const requestPayload: RequestPayload = {
      action,
      payload,
      requestId,
      secret: this.secret,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Apps Script error (${response.status}):`, errorText);
        throw new Error(`Backend service error: ${response.status}`);
      }

      const result: ApiResponse<T> = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message || 'Operation failed');
      }

      return result.data as T;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Backend service timeout');
      }
      
      throw error;
    }
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
    return this.callAppsScript<{
      items: Product[];
      total: number;
      page: number;
      pageSize: number;
      totalPages: number;
    }>('products.list', params);
  }

  async getProduct(idOrSlug: { id?: string; slug?: string }) {
    return this.callAppsScript<Product | null>('products.get', idOrSlug);
  }

  // =============================================================================
  // CATEGORIES
  // =============================================================================

  async listCategories(activeOnly = true) {
    return this.callAppsScript<Category[]>('categories.list', { active: activeOnly });
  }

  async getCategory(idOrSlug: { id?: string; slug?: string }) {
    return this.callAppsScript<Category | null>('categories.get', idOrSlug);
  }

  // =============================================================================
  // ORDERS
  // =============================================================================

  async createOrder(orderData: CreateOrderPayload) {
    return this.callAppsScript<{ orderId: string; orderReference: string }>('orders.create', orderData);
  }

  // =============================================================================
  // CUSTOM REQUESTS
  // =============================================================================

  async createCustomRequest(requestData: CustomRequestPayload) {
    return this.callAppsScript<{ requestId: string; reference: string }>('requests.create', requestData);
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
    return this.callAppsScript<{
      items: Review[];
      total: number;
      page: number;
      pageSize: number;
      totalPages: number;
    }>('reviews.list', { ...params, approvedOnly: params.approvedOnly !== false });
  }

  async getReviewStats(productId?: string) {
    return this.callAppsScript<{
      averageRating: number;
      totalReviews: number;
      ratingDistribution: Record<number, number>;
    }>('reviews.stats', { productId });
  }

  // =============================================================================
  // SETTINGS
  // =============================================================================

  async getPublicSettings() {
    return this.callAppsScript<PublicSettings>('settings.getPublic');
  }

  // =============================================================================
  // ADMIN ACTIONS (require authentication - called via Next.js API routes)
  // =============================================================================

  async adminRequest<T>(action: string, payload: Record<string, unknown> = {}): Promise<T> {
    // Admin requests call Apps Script directly with the secret
    // The Next.js API routes handle authentication/authorization
    return this.callAppsScript<T>(action, payload);
  }
}

// Types (shared with client)
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

// Admin Response Types
export interface AdminOrdersResponse {
  items: AdminOrder[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AdminOrder {
  id: string;
  orderId: string;
  customerId: string;
  orderDate: string;
  customerName: string;
  phone: string;
  email?: string;
  deliveryAddress: string;
  pincode: string;
  city: string;
  state: string;
  subtotal: number;
  packagingCharge: number;
  deliveryCharge: number;
  totalAmount: number;
  paymentStatus: string;
  orderStatus: string;
  paymentMethod: string;
  customerNotes?: string;
  createdAt: string;
  updatedAt: string;
  items?: AdminOrderItem[];
}

export interface AdminOrderItem {
  id: string;
  orderItemId: string;
  orderId: string;
  productId: string;
  productNameSnapshot: string;
  quantity: number;
  unitPriceSnapshot: number;
  selectedColour?: string;
  personalisation?: string;
  wrapping?: boolean;
  messageCard?: string;
  lineTotal: number;
}

export interface AdminRequestsResponse {
  items: AdminCustomRequest[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AdminCustomRequest {
  id: string;
  requestId: string;
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
  quotedPrice?: number;
  requestStatus: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminCustomersResponse {
  items: AdminCustomer[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AdminCustomer {
  id: string;
  customerId: string;
  customerName: string;
  phone: string;
  email?: string;
  createdAt: string;
  contactConsent: boolean;
  orders?: AdminCustomerOrder[];
  totalOrders: number;
  totalSpent: number;
}

export interface AdminCustomerOrder {
  orderId: string;
  orderDate: string;
  totalAmount: number;
  orderStatus: string;
  paymentStatus: string;
}

export interface AdminInventoryResponse {
  items: AdminInventoryMaterial[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AdminInventoryMaterial {
  id: string;
  materialId: string;
  materialName: string;
  category: string;
  unit: string;
  openingStock: number;
  currentStock: number;
  unitCost: number;
  reorderLevel: number;
  updatedAt: string;
  isLowStock: boolean;
  stockValue: number;
}

// Export singleton instance
export const appsScriptService = new AppsScriptService();

// Export class for testing
export { AppsScriptService };