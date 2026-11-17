export const APP_CONFIG = {
  name: "Duggu Arts",
  description: "Handmade pipe-cleaner flowers crafted with love",
  url: process.env.SITE_URL || "http://localhost:3000",
  defaultTheme: "white" as const,
  themes: ["white", "dark", "pink"] as const,
};

export const WHATSAPP_CONFIG = {
  businessNumber: process.env.WHATSAPP_BUSINESS_NUMBER || "",
  // Format: 91XXXXXXXXXX (country code + number without + or spaces)
};

export const GOOGLE_SHEETS_CONFIG = {
  sheetId: process.env.GOOGLE_SHEET_ID || "",
  appsScriptUrl: process.env.GOOGLE_APPS_SCRIPT_URL || "",
  appsScriptSecret: process.env.GOOGLE_APPS_SCRIPT_SECRET || "",
};

export const AUTH_CONFIG = {
  secret: process.env.AUTH_SECRET || "",
  googleId: process.env.AUTH_GOOGLE_ID || "",
  googleSecret: process.env.AUTH_GOOGLE_SECRET || "",
  adminEmails: (process.env.ADMIN_EMAILS || "").split(",").filter(Boolean),
};

export const CART_CONFIG = {
  maxQuantityPerItem: 50,
  storageKey: "duggu-arts-cart",
};

export const PRODUCT_CONFIG = {
  defaultImage: "/images/placeholders/product-placeholder.svg",
  placeholderImages: {
    hero: "/images/placeholders/hero-placeholder.svg",
    category: "/images/placeholders/category-placeholder.svg",
    product: "/images/placeholders/product-placeholder.svg",
  },
};

export const PAGINATION_CONFIG = {
  defaultPageSize: 12,
  maxPageSize: 50,
};

export const FORM_CONFIG = {
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedImageTypes: ["image/jpeg", "image/png", "image/webp"],
};

export const VALIDATION_RULES = {
  name: { min: 2, max: 100 },
  phone: { pattern: /^[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[(]?[0-9]{1,3}[)]?[-\s\.]?[0-9]{4,6}$/ },
  email: { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  address: { min: 10, max: 500 },
  pincode: { pattern: /^[0-9]{6}$/ },
  message: { max: 1000 },
};

export const ORDER_STATUS_LABELS: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  confirmed: "Confirmed",
  in_production: "In Production",
  ready: "Ready",
  dispatched: "Dispatched",
  delivered: "Delivered",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  unpaid: "Unpaid",
  advance_received: "Advance Received",
  partially_paid: "Partially Paid",
  paid: "Paid",
  refunded: "Refunded",
};

export const CUSTOM_REQUEST_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  contacted: "Contacted",
  quoted: "Quoted",
  confirmed: "Confirmed",
  in_production: "In Production",
  ready: "Ready",
  delivered: "Delivered",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const REVIEW_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

export const INVENTORY_MOVEMENT_TYPES = ["in", "out", "adjustment"] as const;

export const COLOUR_PALETTE = [
  { name: "Red", hex: "#DC2626" },
  { name: "Pink", hex: "#EC4899" },
  { name: "Hot Pink", hex: "#F472B6" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Cream", hex: "#FEF3C7" },
  { name: "Yellow", hex: "#FBBF24" },
  { name: "Orange", hex: "#F97316" },
  { name: "Purple", hex: "#A855F7" },
  { name: "Lavender", hex: "#C084FC" },
  { name: "Blue", hex: "#3B82F6" },
  { name: "Light Blue", hex: "#60A5FA" },
  { name: "Green", hex: "#22C55E" },
  { name: "Sage", hex: "#86EFAC" },
  { name: "Peach", hex: "#FED7AA" },
  { name: "Coral", hex: "#FB923C" },
  { name: "Maroon", hex: "#991B1B" },
  { name: "Burgundy", hex: "#7F1D1D" },
  { name: "Magenta", hex: "#D946EF" },
] as const;

export const BOUQUET_SIZES = [
  { id: "small", name: "Small (5-7 flowers)", basePrice: 0 },
  { id: "medium", name: "Medium (8-12 flowers)", basePrice: 100 },
  { id: "large", name: "Large (13-18 flowers)", basePrice: 200 },
  { id: "extra_large", name: "Extra Large (19+ flowers)", basePrice: 350 },
] as const;

export const WRAPPING_OPTIONS = [
  { id: "none", name: "No Wrapping", price: 0 },
  { id: "paper", name: "Kraft Paper", price: 50 },
  { id: "cellophane", name: "Clear Cellophane", price: 40 },
  { id: "fabric", name: "Fabric Wrap", price: 120 },
  { id: "box", name: "Gift Box", price: 200 },
] as const;

export const MESSAGE_CARD_OPTIONS = [
  { id: "none", name: "No Card", price: 0 },
  { id: "standard", name: "Standard Card", price: 20 },
  { id: "premium", name: "Premium Card with Envelope", price: 50 },
] as const;