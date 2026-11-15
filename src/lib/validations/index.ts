import { z } from "zod";

export const checkoutSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters").max(100),
  phone: z.string().regex(/^[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[(]?[0-9]{1,3}[)]?[-\s\.]?[0-9]{4,6}$/, "Invalid phone number"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  deliveryAddress: z.string().min(10, "Address must be at least 10 characters").max(500),
  pincode: z.string().regex(/^[0-9]{6}$/, "Invalid pincode (6 digits required)"),
  city: z.string().min(2, "City is required").max(100),
  state: z.string().min(2, "State is required").max(100),
  customerNotes: z.string().max(1000, "Notes must be less than 1000 characters").optional(),
  items: z.array(z.object({
    productId: z.string().min(1),
    quantity: z.number().min(1).max(50),
    selectedColour: z.string().optional(),
    personalisation: z.string().optional(),
    wrapping: z.boolean().optional(),
    messageCard: z.string().optional(),
  })).min(1, "At least one item is required"),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;

// Form fields that come from user input (excluding items from cart which comes from cart context)
export type CheckoutFormFields = Omit<CheckoutFormData, 'items'>;

export const customOrderSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters").max(100),
  phone: z.string().regex(/^[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[(]?[0-9]{1,3}[)]?[-\s\.]?[0-9]{4,6}$/, "Invalid phone number"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  flowers: z.array(z.string()).min(1, "Select at least one flower type"),
  quantities: z.array(z.number().min(1)).min(1),
  colours: z.array(z.string()).min(1, "Select at least one colour"),
  bouquetSize: z.enum(["small", "medium", "large", "extra_large"]),
  wrapping: z.enum(["none", "paper", "cellophane", "fabric", "box"]),
  budgetMin: z.number().min(0),
  budgetMax: z.number().min(0),
  messageCard: z.enum(["none", "standard", "premium"]),
  requiredDate: z.string().min(1, "Delivery date is required"),
  notes: z.string().max(1000, "Notes must be less than 1000 characters").optional(),
}).refine((data) => data.budgetMax >= data.budgetMin, {
  message: "Maximum budget must be greater than or equal to minimum budget",
  path: ["budgetMax"],
});

export type CustomOrderFormData = z.infer<typeof customOrderSchema>;

export const reviewSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters").max(100),
  productId: z.string().min(1, "Product is required"),
  rating: z.number().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
  title: z.string().min(5, "Title must be at least 5 characters").max(100),
  reviewText: z.string().min(20, "Review must be at least 20 characters").max(2000),
  photoUrl: z.string().url("Invalid photo URL").optional().or(z.literal("")),
  displayPermission: z.boolean(),
});

export type ReviewFormData = z.infer<typeof reviewSchema>;

export const productSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  slug: z.string().min(2, "Slug must be at least 2 characters").max(100).regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  categoryId: z.string().min(1, "Category is required"),
  description: z.string().min(20, "Description must be at least 20 characters").max(5000),
  price: z.number().min(1, "Price must be at least 1"),
  imageUrl: z.string().url("Invalid image URL").optional().or(z.literal("")),
  galleryUrls: z.array(z.string().url("Invalid image URL")).optional(),
  colours: z.array(z.string()).min(1, "At least one colour is required"),
  stockStatus: z.enum(["in_stock", "low_stock", "out_of_stock", "made_to_order"]),
  featured: z.boolean(),
  active: z.boolean(),
});

export type ProductFormData = z.infer<typeof productSchema>;

export const categorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  slug: z.string().min(2, "Slug must be at least 2 characters").max(100).regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  description: z.string().max(1000).optional(),
  imageUrl: z.string().url("Invalid image URL").optional().or(z.literal("")),
  active: z.boolean(),
  displayOrder: z.number().min(0),
});

export type CategoryFormData = z.infer<typeof categorySchema>;

export const inventorySchema = z.object({
  materialName: z.string().min(2, "Name must be at least 2 characters").max(100),
  category: z.string().min(1, "Category is required").max(100),
  unit: z.string().min(1, "Unit is required").max(50),
  openingStock: z.number().min(0),
  currentStock: z.number().min(0),
  unitCost: z.number().min(0),
  reorderLevel: z.number().min(0),
});

export type InventoryFormData = z.infer<typeof inventorySchema>;

export const inventoryMovementSchema = z.object({
  materialId: z.string().min(1, "Material is required"),
  movementType: z.enum(["in", "out", "adjustment"]),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  referenceId: z.string().optional(),
  notes: z.string().max(500).optional(),
});

export type InventoryMovementFormData = z.infer<typeof inventoryMovementSchema>;

export const settingsSchema = z.object({
  businessName: z.string().min(2).max(100),
  whatsappNumber: z.string().regex(/^[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[(]?[0-9]{1,3}[)]?[-\s\.]?[0-9]{4,6}$/),
  instagramUrl: z.string().url().optional().or(z.literal("")),
  contactEmail: z.string().email().optional().or(z.literal("")),
  announcementText: z.string().max(500).optional(),
  packagingCharge: z.number().min(0),
  deliveryCharge: z.number().min(0),
  freeDeliveryThreshold: z.number().min(0),
});

export type SettingsFormData = z.infer<typeof settingsSchema>;

export const orderUpdateSchema = z.object({
  orderStatus: z.enum(["new", "contacted", "confirmed", "in_production", "ready", "dispatched", "delivered", "completed", "cancelled"]).optional(),
  paymentStatus: z.enum(["unpaid", "advance_received", "partially_paid", "paid", "refunded"]).optional(),
  internalNotes: z.string().max(1000).optional(),
});

export type OrderUpdateData = z.infer<typeof orderUpdateSchema>;

export const reviewModerationSchema = z.object({
  approvalStatus: z.enum(["approved", "rejected"]),
  featured: z.boolean().optional(),
});

export type ReviewModerationData = z.infer<typeof reviewModerationSchema>;

export const customRequestUpdateSchema = z.object({
  requestStatus: z.enum(["pending", "contacted", "quoted", "confirmed", "in_production", "ready", "delivered", "completed", "cancelled"]).optional(),
  quotedPrice: z.number().min(0).optional(),
  internalNotes: z.string().max(1000).optional(),
});

export type CustomRequestUpdateData = z.infer<typeof customRequestUpdateSchema>;