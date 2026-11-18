export const COLLECTIONS = {
  USERS: "users",
  PRODUCTS: "products",
  CATEGORIES: "categories",
  ORDERS: "orders",
  ORDER_ITEMS: "order_items",
  INVENTORY: "inventory",
  INVENTORY_MOVEMENTS: "inventory_movements",
  REVIEWS: "reviews",
  CUSTOM_REQUESTS: "custom_requests",
  SETTINGS: "settings",
  AUDIT_LOGS: "audit_logs",
} as const;

export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];

export interface UserDocument {
  uid: string;
  name: string | null;
  email: string;
  photoURL: string | null;
  role: "admin" | "customer";
  providers: string[];
  emailVerified: boolean;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date | null;
}

export interface ProductDocument {
  productId: string;
  name: string;
  slug: string;
  categoryId: string;
  description: string;
  price: number;
  imageUrl: string;
  imagePublicId?: string;
  galleryUrls: string[];
  galleryPublicIds: string[];
  colours: string[];
  stockStatus: "in_stock" | "low_stock" | "out_of_stock" | "made_to_order";
  featured: boolean;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryDocument {
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  imagePublicId?: string;
  active: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderDocument {
  orderId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItemDocument[];
  subtotal: number;
  deliveryCharge: number;
  packagingCharge: number;
  discount: number;
  totalAmount: number;
  paymentStatus: "unpaid" | "advance_received" | "partially_paid" | "paid" | "refunded";
  orderStatus: "new" | "contacted" | "confirmed" | "in_production" | "ready" | "dispatched" | "delivered" | "completed" | "cancelled";
  shippingAddress: ShippingAddressDocument;
  customerNotes: string;
  internalNotes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItemDocument {
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

export interface ShippingAddressDocument {
  address: string;
  pincode: string;
  city: string;
  state: string;
}

export interface InventoryDocument {
  inventoryId: string;
  productId: string;
  productName: string;
  quantity: number;
  reorderLevel: number;
  movementHistory: InventoryMovementDocument[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface InventoryMovementDocument {
  movementId: string;
  type: "in" | "out" | "adjustment";
  quantity: number;
  referenceId?: string;
  notes?: string;
  createdAt: Date;
}

export interface ReviewDocument {
  reviewId: string;
  customerId: string;
  customerName: string;
  productId: string;
  rating: number;
  comment: string;
  imageUrls: string[];
  imagePublicIds: string[];
  status: "pending" | "approved" | "rejected";
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomRequestDocument {
  requestId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  description: string;
  referenceImages: string[];
  referenceImagePublicIds: string[];
  budget: { min: number; max: number };
  requestedDate: Date;
  quotedPrice: number | null;
  requestStatus: "pending" | "contacted" | "quoted" | "confirmed" | "in_production" | "ready" | "delivered" | "completed" | "cancelled";
  internalNotes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SettingsDocument {
  settingKey: string;
  value: string | number | boolean | object;
  description: string;
  updatedAt: Date;
}

export interface AuditLogDocument {
  logId: string;
  adminEmail: string;
  action: string;
  entityType: string;
  entityId: string;
  details: Record<string, unknown>;
  createdAt: Date;
}

export type DocumentData = 
  | UserDocument 
  | ProductDocument 
  | CategoryDocument 
  | OrderDocument 
  | InventoryDocument 
  | ReviewDocument 
  | CustomRequestDocument 
  | SettingsDocument 
  | AuditLogDocument;