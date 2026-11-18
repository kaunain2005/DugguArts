export const APP_CONFIG = {
  name: process.env.BUSINESS_NAME || "Duggu Arts",
  description: "Handmade pipe-cleaner flowers crafted with love",
  url: process.env.SITE_URL || "http://localhost:3000",
  defaultTheme: "white" as const,
  themes: ["white", "dark", "pink"] as const,
};

export const WHATSAPP_CONFIG = {
  businessNumber: process.env.WHATSAPP_BUSINESS_NUMBER || "917499315928",
  // Format: 91XXXXXXXXXX (country code + number without + or spaces)
};

export const FIREBASE_CLIENT_CONFIG = {
  apiKey: process.env.DUGGU_FIREBASE_API_KEY || "",
  authDomain: process.env.DUGGU_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.DUGGU_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.DUGGU_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.DUGGU_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.DUGGU_FIREBASE_APP_ID || "",
  measurementId: process.env.DUGGU_FIREBASE_MEASUREMENT_ID || "",
};

export const AUTH_CONFIG = {
  secret: process.env.AUTH_SECRET || "",
  googleClientId: process.env.DUGGU_GOOGLE_CLIENT_ID || "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
  adminEmails: (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim()).filter(Boolean),
};

export const CLOUDINARY_CONFIG = {
  cloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
  apiKey: process.env.CLOUDINARY_API_KEY || "",
  apiSecret: process.env.CLOUDINARY_API_SECRET || "",
  uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET || "duggu-arts-signed",
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