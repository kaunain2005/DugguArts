import type { Product, Category, FilterParams } from "./index";

export type { Product, Category, FilterParams };

export interface ProductFormData {
  name: string;
  slug: string;
  categoryId: string;
  description: string;
  price: number;
  imageUrl: string;
  galleryUrls: string[];
  colours: string[];
  stockStatus: Product["stockStatus"];
  featured: boolean;
  active: boolean;
}

export interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  active: boolean;
  displayOrder: number;
}

export const STOCK_STATUS_OPTIONS = [
  { value: "in_stock", label: "In Stock" },
  { value: "low_stock", label: "Low Stock" },
  { value: "out_of_stock", label: "Out of Stock" },
  { value: "made_to_order", label: "Made to Order" },
] as const;

export const PRODUCT_SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Popular" },
] as const;