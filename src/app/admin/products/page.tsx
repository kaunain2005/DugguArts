"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { formatPrice, formatDateTime } from "@/lib/utils";
import { Plus, Search, Filter, ChevronLeft, ChevronRight, Package, AlertTriangle, Eye, Edit, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";

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

const CATEGORIES = [
  { value: "", label: "All Categories" },
  { value: "roses", label: "Roses" },
  { value: "tulips", label: "Tulips" },
  { value: "daisies", label: "Daisies" },
  { value: "bouquets", label: "Bouquets" },
];

const STOCK_OPTIONS = [
  { value: "", label: "All Stock Status" },
  { value: "in_stock", label: "In Stock" },
  { value: "low_stock", label: "Low Stock" },
  { value: "out_of_stock", label: "Out of Stock" },
  { value: "made_to_order", label: "Made to Order" },
];

const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 20;
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [stockFilter, setStockFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form state for add/edit product
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    categoryId: "",
    description: "",
    price: 0,
    imageUrl: "",
    galleryUrls: [] as string[],
    colours: [] as string[],
    stockStatus: "in_stock" as Product['stockStatus'],
    featured: false,
    active: true,
  });

  const STOCK_STATUS_LABELS = {
    in_stock: "In Stock",
    low_stock: "Low Stock",
    out_of_stock: "Out of Stock",
    made_to_order: "Made to Order",
  };

  const STOCK_STATUS_VARIANTS = {
    in_stock: "success",
    low_stock: "warning",
    out_of_stock: "error",
    made_to_order: "outline",
  };

  const fetchProducts = async (page = 1) => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });
      if (searchQuery) params.append("search", searchQuery);
      if (categoryFilter) params.append("category", categoryFilter);
      if (stockFilter) params.append("stockStatus", stockFilter);
      if (statusFilter) params.append("active", statusFilter);

      const response = await fetch(`/api/admin/products?${params.toString()}`, {
        credentials: "include",
      });
      const result = await response.json();
      if (result.success) {
        setProducts(result.data.items);
        setTotalPages(result.data.totalPages);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(currentPage);
  }, [currentPage, searchQuery, categoryFilter, stockFilter, statusFilter]);

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingProduct 
        ? `/api/admin/products/${editingProduct.productId}`
        : `/api/admin/products`;
      const method = editingProduct ? "PATCH" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include",
      });
      const result = await response.json();
      if (result.success) {
        setShowAddModal(false);
        setEditingProduct(null);
        resetForm();
        fetchProducts(currentPage);
      } else {
        alert(result.error?.message || "Failed to save product");
      }
    } catch (error) {
      console.error("Failed to save product:", error);
      alert("Failed to save product");
    }
  };

  const handleDeleteProduct = async (product: Product) => {
    if (!confirm(`Are you sure you want to archive ${product.name}?`)) return;
    try {
      const response = await fetch(`/api/admin/products/${product.productId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const result = await response.json();
      if (result.success) {
        fetchProducts(currentPage);
      } else {
        alert(result.error?.message || "Failed to archive product");
      }
    } catch (error) {
      console.error("Failed to archive product:", error);
      alert("Failed to archive product");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      categoryId: "",
      description: "",
      price: 0,
      imageUrl: "",
      galleryUrls: [],
      colours: [],
      stockStatus: "in_stock",
      featured: false,
      active: true,
    });
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      slug: product.slug,
      categoryId: product.categoryId,
      description: product.description,
      price: product.price,
      imageUrl: product.imageUrl,
      galleryUrls: product.galleryUrls,
      colours: product.colours,
      stockStatus: product.stockStatus,
      featured: product.featured,
      active: product.active,
    });
    setShowAddModal(true);
  };

  // Product columns for data table
  const productColumns = [
    { 
      key: "imageUrl", 
      header: "Image",
      render: (item: Product) => (
        <img 
          src={item.imageUrl || "/images/placeholders/product-placeholder.svg"} 
          alt={item.name}
          className="w-12 h-12 object-cover rounded-lg"
        />
      )
    },
    { key: "name", header: "Product Name", sortable: true },
    { key: "categoryName", header: "Category", sortable: true },
    { 
      key: "price", 
      header: "Price", 
      sortable: true,
      render: (item: Product) => formatPrice(item.price)
    },
    { 
      key: "stockStatus", 
      header: "Stock", 
      sortable: true,
      render: (item: Product) => (
        <Badge variant={STOCK_STATUS_VARIANTS[item.stockStatus] as any}>
          {STOCK_STATUS_LABELS[item.stockStatus]}
        </Badge>
      )
    },
    { 
      key: "featured", 
      header: "Featured", 
      sortable: true,
      render: (item: Product) => (
        <Badge variant={item.featured ? "success" : "outline"}>
          {item.featured ? "Yes" : "No"}
        </Badge>
      )
    },
    { 
      key: "active", 
      header: "Status", 
      sortable: true,
      render: (item: Product) => (
        <Badge variant={item.active ? "success" : "error"}>
          {item.active ? "Active" : "Inactive"}
        </Badge>
      )
    },
    { 
      key: "createdAt", 
      header: "Created", 
      sortable: true,
      render: (item: Product) => formatDateTime(item.createdAt)
    },
  ];

  const filteredProducts = products;

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-heading text-2xl lg:text-3xl font-bold text-text">Products</h1>
            <p className="text-text-muted mt-1">Manage your product catalog</p>
          </div>
        </div>
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <div className="p-4 border-b border-border">
            <div className="h-6 w-1/4 bg-border rounded animate-pulse" />
          </div>
          <div className="divide-y divide-border">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="p-4 animate-pulse">
                <div className="h-4 w-1/4 bg-border rounded" />
                <div className="h-4 w-1/2 bg-border rounded mt-2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container py-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-2xl lg:text-3xl font-bold text-text">Products</h1>
          <p className="text-text-muted mt-1">Manage your product catalog</p>
        </div>
        <Button onClick={() => { setEditingProduct(null); resetForm(); setShowAddModal(true); }}>
          <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
          Add Product
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-surface border border-border rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-muted">Total Products</p>
              <p className="font-heading text-3xl font-bold text-text">{products.length}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Package className="w-6 h-6 text-primary" aria-hidden="true" />
            </div>
          </div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-muted">Active Products</p>
              <p className="font-heading text-3xl font-bold text-text">{products.filter(p => p.active).length}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
              <Package className="w-6 h-6 text-success" aria-hidden="true" />
            </div>
          </div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-muted">Low Stock</p>
              <p className="font-heading text-3xl font-bold text-warning">{products.filter(p => p.stockStatus === 'low_stock').length}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-warning" aria-hidden="true" />
            </div>
          </div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-muted">Out of Stock</p>
              <p className="font-heading text-3xl font-bold text-error">{products.filter(p => p.stockStatus === 'out_of_stock').length}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-error/10 flex items-center justify-center">
              <Package className="w-6 h-6 text-error" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-surface border border-border rounded-xl p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" aria-hidden="true" />
            <input
              type="search"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-lg text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            options={CATEGORIES}
            placeholder="Filter by Category"
            className="w-[200px]"
          />
          <Select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            options={STOCK_OPTIONS}
            placeholder="Filter by Stock"
            className="w-[200px]"
          />
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={STATUS_OPTIONS}
            placeholder="Filter by Status"
            className="w-[180px]"
          />
        </div>
      </div>

      {/* Products Table */}
      <AdminDataTable
        data={filteredProducts}
        columns={productColumns}
        keyField="productId"
        searchable={false}
        pagination={{
          currentPage,
          totalPages,
          onPageChange: fetchProducts,
        }}
        loading={isLoading}
        emptyMessage="No products found"
        onEdit={handleEditProduct}
        onDelete={handleDeleteProduct}
        onView={(product) => router.push(`/admin/products/${product.productId}`)}
        actionsHeader="Actions"
      />
      </div>

  {/* Add/Edit Product Modal */}
  {showAddModal && (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
      <div className="bg-surface border border-border rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="font-heading text-xl font-semibold text-text">{editingProduct ? "Edit Product" : "Add New Product"}</h2>
          <button
            onClick={() => { setShowAddModal(false); setEditingProduct(null); resetForm(); }}
            className="p-1 text-text-muted hover:text-text rounded-lg transition-colors"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
        <form onSubmit={handleSubmitProduct} className="p-6 space-y-6">
          <div className="grid sm:grid-cols-2 gap-6">
            <Input
              name="name"
              label="Product Name *"
              placeholder="e.g., Classic Red Rose"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Select
              name="categoryId"
              label="Category *"
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              options={CATEGORIES.filter(c => c.value)}
              placeholder="Select category"
              required
            />
          </div>
          <Input
            name="slug"
            label="Slug *"
            placeholder="e.g., classic-red-rose"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            required
            helperText="URL-friendly identifier (lowercase, numbers, hyphens only)"
          />
          <div>
            <label className="block text-sm font-medium text-text mb-2">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg text-text placeholder-text-muted resize-y min-h-[100px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="Describe the product..."
              required
            />
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            <Input
              name="price"
              label="Price (₹) *"
              type="number"
              placeholder="299"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
              min="1"
              required
            />
            <Input
              name="imageUrl"
              label="Main Image URL *"
              placeholder="/images/products/red-rose.svg"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              required
            />
            <Input
              name="stockStatus"
              label="Stock Status *"
              type="select"
              value={formData.stockStatus}
              onChange={(e) => setFormData({ ...formData, stockStatus: e.target.value as Product['stockStatus'] })}
              required
            >
              <option value="in_stock">In Stock</option>
              <option value="low_stock">Low Stock</option>
              <option value="out_of_stock">Out of Stock</option>
              <option value="made_to_order">Made to Order</option>
            </Input>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text mb-2">Colours (comma-separated) *</label>
              <input
                type="text"
                value={formData.colours.join(", ")}
                onChange={(e) => setFormData({ ...formData, colours: e.target.value.split(",").map(c => c.trim()).filter(Boolean) })}
                placeholder="Red, Deep Red, Burgundy"
                className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm font-medium text-text">Featured Product</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm font-medium text-text">Active</span>
              </label>
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              {editingProduct ? "Update Product" : "Add Product"}
            </Button>
            <Button type="button" variant="outline" onClick={() => { setShowAddModal(false); setEditingProduct(null); resetForm(); }} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )}
</>
  );
}