"use client";

import React, { useState, useEffect, useCallback, useContext } from "react";
import { Search, Filter, X, ChevronDown, Grid, List } from "lucide-react";
import { ProductCard } from "@/components/products/ProductCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";
import { CartContext } from "@/context/CartContext";

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Popular" },
];

const CATEGORIES = [
  { value: "", label: "All Categories" },
  { value: "roses", label: "Roses" },
  { value: "tulips", label: "Tulips" },
  { value: "daisies", label: "Daisies" },
  { value: "bouquets", label: "Bouquets" },
];

const COLOURS = [
  { value: "", label: "All Colours" },
  { value: "Red", label: "Red" },
  { value: "Pink", label: "Pink" },
  { value: "White", label: "White" },
  { value: "Yellow", label: "Yellow" },
  { value: "Orange", label: "Orange" },
  { value: "Purple", label: "Purple" },
  { value: "Blue", label: "Blue" },
  { value: "Green", label: "Green" },
  { value: "Mixed", label: "Mixed" },
];

const STOCK_OPTIONS = [
  { value: "", label: "All Availability" },
  { value: "in_stock", label: "In Stock" },
  { value: "low_stock", label: "Low Stock" },
  { value: "made_to_order", label: "Made to Order" },
];

// Mock product data - in production, this would come from API
const mockProducts: Product[] = [
  {
    id: "1",
    productId: "PROD_1",
    name: "Classic Red Rose",
    slug: "classic-red-rose",
    categoryId: "roses",
    categoryName: "Roses",
    description: "A timeless symbol of love and passion, handcrafted with premium pipe cleaners.",
    price: 299,
    imageUrl: "/images/products/red-rose.svg",
    galleryUrls: ["/images/products/red-rose.svg"],
    colours: ["Red", "Deep Red", "Burgundy"],
    stockStatus: "in_stock",
    featured: true,
    active: true,
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "2",
    productId: "PROD_2",
    name: "Pink Tulip Bunch",
    slug: "pink-tulip-bunch",
    categoryId: "tulips",
    categoryName: "Tulips",
    description: "Elegant pink tulips that bring spring to your home all year round.",
    price: 399,
    imageUrl: "/images/products/pink-tulips.svg",
    galleryUrls: ["/images/products/pink-tulips.svg"],
    colours: ["Pink", "Light Pink", "White"],
    stockStatus: "in_stock",
    featured: false,
    active: true,
    createdAt: "2024-01-20T10:00:00Z",
    updatedAt: "2024-01-20T10:00:00Z",
  },
  {
    id: "3",
    productId: "PROD_3",
    name: "Sunshine Daisy",
    slug: "sunshine-daisy",
    categoryId: "daisies",
    categoryName: "Daisies",
    description: "Bright and cheerful daisies to brighten any room.",
    price: 199,
    imageUrl: "/images/products/yellow-daisy.svg",
    galleryUrls: ["/images/products/yellow-daisy.svg"],
    colours: ["Yellow", "White", "Orange"],
    stockStatus: "in_stock",
    featured: false,
    active: true,
    createdAt: "2024-02-01T10:00:00Z",
    updatedAt: "2024-02-01T10:00:00Z",
  },
  {
    id: "4",
    productId: "PROD_4",
    name: "Romantic Mixed Bouquet",
    slug: "romantic-mixed-bouquet",
    categoryId: "bouquets",
    categoryName: "Bouquets",
    description: "A stunning arrangement of roses, tulips, and daisies in harmonious colours.",
    price: 1299,
    imageUrl: "/images/products/romantic-bouquet.svg",
    galleryUrls: ["/images/products/romantic-bouquet.svg"],
    colours: ["Mixed"],
    stockStatus: "in_stock",
    featured: true,
    active: true,
    createdAt: "2024-02-10T10:00:00Z",
    updatedAt: "2024-02-10T10:00:00Z",
  },
  {
    id: "5",
    productId: "PROD_5",
    name: "White Rose Bouquet",
    slug: "white-rose-bouquet",
    categoryId: "bouquets",
    categoryName: "Bouquets",
    description: "Pure elegance in a hand-tied bouquet.",
    price: 899,
    imageUrl: "/images/products/white-rose-bouquet.svg",
    galleryUrls: ["/images/products/white-rose-bouquet.svg"],
    colours: ["White", "Cream"],
    stockStatus: "in_stock",
    featured: true,
    active: true,
    createdAt: "2024-02-15T10:00:00Z",
    updatedAt: "2024-02-15T10:00:00Z",
  },
  {
    id: "6",
    productId: "PROD_6",
    name: "Purple Tulip Trio",
    slug: "purple-tulip-trio",
    categoryId: "tulips",
    categoryName: "Tulips",
    description: "Regal purple tulips for a touch of luxury.",
    price: 449,
    imageUrl: "/images/products/purple-tulips.svg",
    galleryUrls: ["/images/products/purple-tulips.svg"],
    colours: ["Purple", "Lavender", "White"],
    stockStatus: "low_stock",
    featured: false,
    active: true,
    createdAt: "2024-03-01T10:00:00Z",
    updatedAt: "2024-03-01T10:00:00Z",
  },
  {
    id: "7",
    productId: "PROD_7",
    name: "Orange Daisy Delight",
    slug: "orange-daisy-delight",
    categoryId: "daisies",
    categoryName: "Daisies",
    description: "Vibrant orange daisies to energize your space.",
    price: 249,
    imageUrl: "/images/products/orange-daisy.svg",
    galleryUrls: ["/images/products/orange-daisy.svg"],
    colours: ["Orange", "Yellow", "Red"],
    stockStatus: "in_stock",
    featured: false,
    active: true,
    createdAt: "2024-03-05T10:00:00Z",
    updatedAt: "2024-03-05T10:00:00Z",
  },
  {
    id: "8",
    productId: "PROD_8",
    name: "Blue Rose (Made to Order)",
    slug: "blue-rose-custom",
    categoryId: "roses",
    categoryName: "Roses",
    description: "Rare blue roses crafted on special request.",
    price: 599,
    imageUrl: "/images/products/blue-rose.svg",
    galleryUrls: ["/images/products/blue-rose.svg"],
    colours: ["Blue"],
    stockStatus: "made_to_order",
    featured: false,
    active: true,
    createdAt: "2024-03-10T10:00:00Z",
    updatedAt: "2024-03-10T10:00:00Z",
  },
];

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedColour, setSelectedColour] = useState("");
  const [selectedStock, setSelectedStock] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  const { addItem } = useContext(CartContext);

  const handleAddToCart = (product: Product) => {
    addItem(product);
  };

  // Simulate API loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setProducts(mockProducts);
      setFilteredProducts(mockProducts);
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Filter products
  const applyFilters = useCallback(() => {
    let result = [...products];

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.categoryName?.toLowerCase().includes(query) ||
          p.colours.some((c) => c.toLowerCase().includes(query))
      );
    }

    // Category
    if (selectedCategory) {
      result = result.filter((p) => p.categoryId === selectedCategory);
    }

    // Colour
    if (selectedColour) {
      result = result.filter((p) => p.colours.includes(selectedColour));
    }

    // Stock
    if (selectedStock) {
      result = result.filter((p) => p.stockStatus === selectedStock);
    }

    // Price Range
    const min = minPrice ? parseInt(minPrice) : null;
    const max = maxPrice ? parseInt(maxPrice) : null;
    if (min !== null) {
      result = result.filter((p) => p.price >= min);
    }
    if (max !== null) {
      result = result.filter((p) => p.price <= max);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "price_asc":
          return a.price - b.price;
        case "price_desc":
          return b.price - a.price;
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "popular":
          // Mock: featured first, then by price
          if (a.featured !== b.featured) return a.featured ? -1 : 1;
          return b.price - a.price;
        case "featured":
        default:
          if (a.featured !== b.featured) return a.featured ? -1 : 1;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    setFilteredProducts(result);
  }, [products, searchQuery, selectedCategory, selectedColour, selectedStock, minPrice, maxPrice, sortBy]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Count active filters
  useEffect(() => {
    let count = 0;
    if (searchQuery) count++;
    if (selectedCategory) count++;
    if (selectedColour) count++;
    if (selectedStock) count++;
    if (minPrice) count++;
    if (maxPrice) count++;
    setActiveFiltersCount(count);
  }, [searchQuery, selectedCategory, selectedColour, selectedStock, minPrice, maxPrice]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedColour("");
    setSelectedStock("");
    setMinPrice("");
    setMaxPrice("");
  };

  const hasActiveFilters = activeFiltersCount > 0;

  if (isLoading) {
    return (
      <div className="container py-12">
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold text-text">Shop</h1>
          <p className="text-text-muted mt-1">Discover our handmade flower collection</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <div className="bg-surface/50 border-b border-border">
        <div className="container py-12 lg:py-16">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-text">Shop</h1>
          <p className="text-text-muted mt-2">Discover our handmade flower collection</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              {/* Mobile Filter Toggle */}
              <button
                type="button"
                className="lg:hidden flex items-center justify-between w-full px-4 py-3 bg-surface border border-border rounded-lg text-text font-medium"
                onClick={() => setShowFilters(!showFilters)}
              >
                <span className="flex items-center gap-2">
                  <Filter className="w-5 h-5" aria-hidden="true" />
                  Filters
                </span>
                {activeFiltersCount > 0 && (
                  <Badge variant="primary" className="ml-2">
                    {activeFiltersCount}
                  </Badge>
                )}
                <ChevronDown className={cn("w-5 h-5 transition-transform", showFilters && "rotate-180")} aria-hidden="true" />
              </button>

              {/* Filters Panel */}
              <div className={cn("space-y-6", showFilters || "lg:block", !showFilters && "lg:hidden", "hidden")}>
                {/* Search */}
                <div>
                  <label htmlFor="search" className="block text-sm font-medium text-text mb-2">
                    Search
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" aria-hidden="true" />
                    <input
                      id="search"
                      type="search"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-lg text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                </div>

                {/* Category Filter */}
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-text mb-2">
                    Category
                  </label>
                  <Select
                    id="category"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    options={CATEGORIES}
                    placeholder="All Categories"
                  />
                </div>

                {/* Colour Filter */}
                <div>
                  <label htmlFor="colour" className="block text-sm font-medium text-text mb-2">
                    Colour
                  </label>
                  <Select
                    id="colour"
                    value={selectedColour}
                    onChange={(e) => setSelectedColour(e.target.value)}
                    options={COLOURS}
                    placeholder="All Colours"
                  />
                </div>

                {/* Stock Filter */}
                <div>
                  <label htmlFor="stock" className="block text-sm font-medium text-text mb-2">
                    Availability
                  </label>
                  <Select
                    id="stock"
                    value={selectedStock}
                    onChange={(e) => setSelectedStock(e.target.value)}
                    options={STOCK_OPTIONS}
                    placeholder="All Availability"
                  />
                </div>

                {/* Price Range Filter */}
                <div>
                  <label className="block text-sm font-medium text-text mb-2">Price Range</label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="min-price"
                      type="number"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-full"
                      min="0"
                      max="10000"
                      step="50"
                    />
                    <span className="text-text-muted">to</span>
                    <Input
                      id="max-price"
                      type="number"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-full"
                      min="0"
                      max="10000"
                      step="50"
                    />
                  </div>
                </div>

                {/* Clear Filters */}
                {hasActiveFilters && (
                  <Button variant="ghost" className="w-full justify-start" onClick={clearFilters}>
                    <X className="w-4 h-4" aria-hidden="true" />
                    Clear all filters
                  </Button>
                )}
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex items-center gap-2">
                <span className="text-sm text-text-muted">
                  {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"} found
                </span>
                {hasActiveFilters && (
                  <Badge variant="outline" className="text-xs">
                    {activeFiltersCount} filter{activeFiltersCount > 1 ? "s" : ""} applied
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-3">
                {/* Sort */}
                <div className="relative">
                  <label htmlFor="sort" className="sr-only">Sort by</label>
                  <Select
                    id="sort"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    options={SORT_OPTIONS}
                    className="w-[200px]"
                  />
                </div>

                {/* View Mode */}
                <div className="flex bg-surface border border-border rounded-lg p-1">
                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    className={cn(
                      "p-2 rounded transition-colors",
                      viewMode === "grid"
                        ? "bg-primary text-white"
                        : "text-text-muted hover:text-text"
                    )}
                    aria-label="Grid view"
                    aria-pressed={viewMode === "grid"}
                  >
                    <Grid className="w-5 h-5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("list")}
                    className={cn(
                      "p-2 rounded transition-colors",
                      viewMode === "list"
                        ? "bg-primary text-white"
                        : "text-text-muted hover:text-text"
                    )}
                    aria-label="List view"
                    aria-pressed={viewMode === "list"}
                  >
                    <List className="w-5 h-5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>

            {/* Product Grid */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-6 bg-surface border border-border rounded-2xl flex items-center justify-center">
                  <Search className="w-10 h-10 text-text-muted" aria-hidden="true" />
                </div>
                <h3 className="font-heading text-xl font-semibold text-text mb-2">No products found</h3>
                <p className="text-text-muted mb-6">Try adjusting your filters or search terms</p>
                <Button variant="outline" onClick={clearFilters}>
                  <X className="w-4 h-4 mr-2" aria-hidden="true" />
                  Clear Filters
                </Button>
              </div>
            ) : (
              <>
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {filteredProducts.map((product) => (
                      <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredProducts.map((product) => (
                      <ProductCard key={product.id} product={product} variant="compact" onAddToCart={handleAddToCart} />
                    ))}
                  </div>
                )}

                {/* Load More / Pagination */}
                <div className="mt-10 text-center">
                  <Button variant="outline" size="lg" disabled>
                    Load More Products
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ProductCardSkeleton component for loading state
function ProductCardSkeleton() {
  return (
    <article className="bg-surface border border-border rounded-xl overflow-hidden animate-pulse">
      <div className="aspect-square bg-border" />
      <div className="p-4 space-y-3">
        <div className="h-3 w-1/4 bg-border rounded" />
        <div className="h-5 w-3/4 bg-border rounded" />
        <div className="h-4 w-1/2 bg-border rounded" />
        <div className="flex items-center justify-between">
          <div className="h-6 w-24 bg-border rounded" />
          <div className="h-9 w-9 bg-border rounded-lg" />
        </div>
      </div>
    </article>
  );
}