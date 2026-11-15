export interface Product {
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
  stockStatus: "in_stock" | "low_stock" | "out_of_stock" | "made_to_order";
  featured: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  active: boolean;
  displayOrder: number;
}

export interface Order {
  id: string;
  orderId: string;
  customerId: string;
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
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  paymentMethod: string;
  customerNotes?: string;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
}

export interface OrderItem {
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

export type PaymentStatus = 
  | "unpaid" 
  | "advance_received" 
  | "partially_paid" 
  | "paid" 
  | "refunded";

export type OrderStatus = 
  | "new" 
  | "contacted" 
  | "confirmed" 
  | "in_production" 
  | "ready" 
  | "dispatched" 
  | "delivered" 
  | "completed" 
  | "cancelled";

export interface Customer {
  id: string;
  customerId: string;
  customerName: string;
  phone: string;
  email?: string;
  createdAt: string;
  contactConsent: boolean;
}

export interface CustomRequest {
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
  messageCard?: string;
  requiredDate: string;
  notes?: string;
  quotedPrice?: number;
  requestStatus: CustomRequestStatus;
  createdAt: string;
  updatedAt: string;
}

export type CustomRequestStatus = 
  | "pending" 
  | "contacted" 
  | "quoted" 
  | "confirmed" 
  | "in_production" 
  | "ready" 
  | "delivered" 
  | "completed" 
  | "cancelled";

export interface Review {
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
  approvalStatus: ReviewApprovalStatus;
  featured: boolean;
}

export type ReviewApprovalStatus = "pending" | "approved" | "rejected";

export interface InventoryMaterial {
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
}

export interface InventoryMovement {
  id: string;
  movementId: string;
  materialId: string;
  materialName?: string;
  movementType: "in" | "out" | "adjustment";
  quantity: number;
  referenceId?: string;
  notes?: string;
  createdAt: string;
}

export interface Setting {
  key: string;
  value: string;
  description: string;
}

export interface PublicSettings {
  businessName: string;
  whatsappNumber: string;
  instagramUrl: string;
  contactEmail: string;
  announcementText: string;
  packagingCharge: number;
  deliveryCharge: number;
  freeDeliveryThreshold: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface FilterParams {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  colours?: string[];
  stockStatus?: string[];
  sortBy?: "featured" | "price_asc" | "price_desc" | "newest" | "popular";
  page?: number;
  pageSize?: number;
}