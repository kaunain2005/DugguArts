"use client";
// src/app/admin/requests/page.tsx
import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { formatPrice } from "@/lib/utils";
import { Plus, Search, Filter, ChevronLeft, ChevronRight, Package, AlertTriangle, Download, Upload, Minus, Edit, Trash2, Eye, X, AlertTriangle as AlertTriangleIcon } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

interface InventoryMaterial {
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

interface StockMovement {
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

const MOVEMENT_TYPES = [
  { value: "in", label: "Stock In (Purchase)" },
  { value: "out", label: "Stock Out (Usage)" },
  { value: "adjustment", label: "Adjustment" },
];

const CATEGORIES = [
  { value: "", label: "All Categories" },
  { value: "pipe_cleaners", label: "Pipe Cleaners" },
  { value: "floral_wire", label: "Floral Wire" },
  { value: "wrapping", label: "Wrapping Materials" },
  { value: "ribbons", label: "Ribbons" },
  { value: "packaging", label: "Packaging" },
  { value: "decorative", label: "Decorative Materials" },
  { value: "gift_cards", label: "Gift Cards" },
];

export default function InventoryPage() {
  const [materials, setMaterials] = useState<InventoryMaterial[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"materials" | "movements">("materials");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<InventoryMaterial | null>(null);
  const [movementMaterialId, setMovementMaterialId] = useState("");
  const [movementType, setMovementType] = useState<"in" | "out" | "adjustment">("in");
  const [movementQuantity, setMovementQuantity] = useState(1);
  const [movementNotes, setMovementNotes] = useState("");
  const [movementReferenceId, setMovementReferenceId] = useState("");

  // Form state for add/edit material
  const [formData, setFormData] = useState({
    materialName: "",
    category: "",
    unit: "pcs",
    openingStock: 0,
    currentStock: 0,
    unitCost: 0,
    reorderLevel: 0,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  const fetchMaterials = async (page = 1) => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });
      if (searchQuery) params.append("search", searchQuery);
      if (categoryFilter) params.append("category", categoryFilter);
      if (lowStockOnly) params.append("lowStockOnly", "true");

      const response = await fetch(`/api/admin/inventory?${params.toString()}`, {
        credentials: "include",
      });
      const result = await response.json();
      if (result.success) {
        setMaterials(result.data.items);
        setTotalPages(result.data.totalPages);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error("Failed to fetch materials:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMovements = async (page = 1) => {
    try {
      const response = await fetch(`/api/admin/inventory/movements?page=${page}&pageSize=${pageSize}`, {
        credentials: "include",
      });
      const result = await response.json();
      if (result.success) {
        setMovements(result.data.items);
      }
    } catch (error) {
      console.error("Failed to fetch movements:", error);
    }
  };

  useEffect(() => {
    fetchMaterials(currentPage);
    fetchMovements(1);
  }, [currentPage, searchQuery, categoryFilter, lowStockOnly]);

  const handleSubmitMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingMaterial 
        ? `/api/admin/inventory/${editingMaterial.materialId}`
        : `/api/admin/inventory`;
      const method = editingMaterial ? "PATCH" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include",
      });
      const result = await response.json();
      if (result.success) {
        setShowAddModal(false);
        setEditingMaterial(null);
        resetForm();
        fetchMaterials(currentPage);
      } else {
        alert(result.error?.message || "Failed to save material");
      }
    } catch (error) {
      console.error("Failed to save material:", error);
      alert("Failed to save material");
    }
  };

  const handleDeleteMaterial = async (material: InventoryMaterial) => {
    if (!confirm(`Are you sure you want to delete ${material.materialName}?`)) return;
    try {
      const response = await fetch(`/api/admin/inventory/${material.materialId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const result = await response.json();
      if (result.success) {
        fetchMaterials(currentPage);
      } else {
        alert(result.error?.message || "Failed to delete material");
      }
    } catch (error) {
      console.error("Failed to delete material:", error);
      alert("Failed to delete material");
    }
  };

  const handleSubmitMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/admin/inventory/movements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          materialId: movementMaterialId,
          movementType,
          quantity: movementQuantity,
          referenceId: movementReferenceId,
          notes: movementNotes,
        }),
        credentials: "include",
      });
      const result = await response.json();
      if (result.success) {
        setShowMovementModal(false);
        resetMovementForm();
        fetchMaterials(currentPage);
        fetchMovements(1);
      } else {
        alert(result.error?.message || "Failed to record movement");
      }
    } catch (error) {
      console.error("Failed to record movement:", error);
      alert("Failed to record movement");
    }
  };

  const resetForm = () => {
    setFormData({
      materialName: "",
      category: "",
      unit: "pcs",
      openingStock: 0,
      currentStock: 0,
      unitCost: 0,
      reorderLevel: 0,
    });
  };

  const resetMovementForm = () => {
    setMovementMaterialId("");
    setMovementType("in");
    setMovementQuantity(1);
    setMovementNotes("");
    setMovementReferenceId("");
  };

  const handleEditMaterial = (material: InventoryMaterial) => {
    setEditingMaterial(material);
    setFormData({
      materialName: material.materialName,
      category: material.category,
      unit: material.unit,
      openingStock: material.openingStock,
      currentStock: material.currentStock,
      unitCost: material.unitCost,
      reorderLevel: material.reorderLevel,
    });
    setShowAddModal(true);
  };

  const handleViewMovements = (material: InventoryMaterial) => {
    setMovementMaterialId(material.materialId);
    setShowMovementModal(true);
  };

  // Material columns for data table
  const materialColumns = [
    { key: "materialName", header: "Material Name", sortable: true },
    { key: "category", header: "Category", sortable: true },
    { key: "unit", header: "Unit", sortable: true },
    { 
      key: "currentStock", 
      header: "Current Stock", 
      sortable: true,
      render: (item: InventoryMaterial) => (
        <span className={cn(
          "font-bold",
          item.isLowStock ? "text-warning" : item.currentStock === 0 ? "text-error" : "text-text"
        )}>
          {item.currentStock} {item.unit}
        </span>
      ) 
    },
    { 
      key: "reorderLevel", 
      header: "Reorder Level", 
      sortable: true,
      render: (item: InventoryMaterial) => (
        <span>{item.reorderLevel} {item.unit}</span>
      ) 
    },
    { 
      key: "unitCost", 
      header: "Unit Cost", 
      sortable: true,
      render: (item: InventoryMaterial) => formatPrice(item.unitCost) 
    },
    { 
      key: "stockValue", 
      header: "Stock Value", 
      sortable: true,
      render: (item: InventoryMaterial) => formatPrice(item.stockValue) 
    },
    {
      key: "status",
      header: "Status",
      render: (item: InventoryMaterial) => (
        <Badge 
          variant={item.currentStock === 0 ? "error" : item.isLowStock ? "warning" : "success"}
        >
          {item.currentStock === 0 ? "Out of Stock" : item.isLowStock ? "Low Stock" : "In Stock"}
        </Badge>
      ),
    },
  ];

  // Movement columns for data table
  const movementColumns = [
    { key: "materialName", header: "Material", sortable: true },
    { 
      key: "movementType", 
      header: "Type", 
      sortable: true,
      render: (item: StockMovement) => (
        <Badge 
          variant={
            item.movementType === "in" ? "success" : 
            item.movementType === "out" ? "error" : "warning"
          }
        >
          {item.movementType === "in" ? "Stock In" : item.movementType === "out" ? "Stock Out" : "Adjustment"}
        </Badge>
      ),
    },
    { 
      key: "quantity", 
      header: "Quantity", 
      sortable: true,
      render: (item: StockMovement) => (
        <span className={cn("font-medium", item.movementType === "out" ? "text-error" : item.movementType === "in" ? "text-success" : "text-text")}>
          {item.movementType === "out" ? "-" : "+"}{item.quantity}
        </span>
      ) 
    },
    { key: "referenceId", header: "Reference", sortable: true },
    { key: "notes", header: "Notes" },
    { 
      key: "createdAt", 
      header: "Date", 
      sortable: true,
      render: (item: StockMovement) => formatDateTime(item.createdAt) 
    },
  ];

  const filteredMaterials = materials;

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-heading text-2xl lg:text-3xl font-bold text-text">Inventory Management</h1>
            <p className="text-text-muted mt-1">Track materials, stock levels, and movements</p>
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
          <h1 className="font-heading text-2xl lg:text-3xl font-bold text-text">Inventory Management</h1>
          <p className="text-text-muted mt-1">Track materials, stock levels, and movements</p>
        </div>
        <Button onClick={() => { setEditingMaterial(null); resetForm(); setShowAddModal(true); }}>
          <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
          Add Material
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-muted">Total Materials</p>
                <p className="font-heading text-3xl font-bold text-text">{materials.length}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Package className="w-6 h-6 text-primary" aria-hidden="true" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-muted">Low Stock</p>
                <p className="font-heading text-3xl font-bold text-warning">{materials.filter(m => m.isLowStock && m.currentStock > 0).length}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center">
                <AlertTriangleIcon className="w-6 h-6 text-warning" aria-hidden="true" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-muted">Out of Stock</p>
                <p className="font-heading text-3xl font-bold text-error">{materials.filter(m => m.currentStock === 0).length}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-error/10 flex items-center justify-center">
                <Package className="w-6 h-6 text-error" aria-hidden="true" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-muted">Total Stock Value</p>
                <p className="font-heading text-3xl font-bold text-text">
                  {formatPrice(materials.reduce((sum, m) => sum + m.stockValue, 0))}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center">
                <Package className="w-6 h-6 text-secondary" aria-hidden="true" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-border mb-6">
        <nav className="flex gap-8" aria-label="Inventory tabs">
          <button
            onClick={() => setActiveTab("materials")}
            className={cn(
              "py-3 px-1 border-b-2 font-medium text-sm transition-colors",
              activeTab === "materials"
                ? "border-primary text-primary"
                : "border-transparent text-text-muted hover:text-text"
            )}
          >
            Materials
          </button>
          <button
            onClick={() => setActiveTab("movements")}
            className={cn(
              "py-3 px-1 border-b-2 font-medium text-sm transition-colors",
              activeTab === "movements"
                ? "border-primary text-primary"
                : "border-transparent text-text-muted hover:text-text"
            )}
          >
            Stock Movements
          </button>
        </nav>
      </div>

      {/* Materials Tab */}
      {activeTab === "materials" && (
        <div className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" aria-hidden="true" />
                  <input
                    type="search"
                    placeholder="Search materials..."
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
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={lowStockOnly}
                    onChange={(e) => setLowStockOnly(e.target.checked)}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <span className="text-sm font-medium text-text">Low Stock Only</span>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Materials Table */}
          <AdminDataTable
            data={filteredMaterials}
            columns={materialColumns}
            keyField="materialId"
            searchable={false}
            pagination={{
              currentPage,
              totalPages,
              onPageChange: fetchMaterials,
            }}
            loading={isLoading}
            emptyMessage="No materials found"
            onEdit={handleEditMaterial}
            onDelete={handleDeleteMaterial}
            onView={handleViewMovements}
            actionsHeader="Actions"
          />
        </div>
        )}

      {/* Movements Tab */}
      {activeTab === "movements" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="font-heading text-xl font-semibold text-text">Stock Movements</h2>
              <p className="text-text-muted">Track all stock in, out, and adjustments</p>
            </div>
            <Button onClick={() => { setMovementMaterialId(""); setShowMovementModal(true); }}>
              <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
              Record Movement
            </Button>
          </div>

          <AdminDataTable
            data={movements}
            columns={movementColumns}
            keyField="movementId"
            searchable={true}
            searchPlaceholder="Search movements..."
            pagination={{
              currentPage: 1,
              totalPages: 1,
              onPageChange: () => {},
            }}
            loading={isLoading}
            emptyMessage="No stock movements recorded"
            actionsHeader=""
          />
        </div>
      )}
    </div>

  {/* Add/Edit Material Modal */}

  {/* Add/Edit Material Modal */}
  {showAddModal && (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
      <div className="bg-surface border border-border rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
        <CardHeader className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <CardTitle>{editingMaterial ? "Edit Material" : "Add New Material"}</CardTitle>
            <button
              onClick={() => { setShowAddModal(false); setEditingMaterial(null); resetForm(); }}
              className="p-1 text-text-muted hover:text-text rounded-lg transition-colors"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </CardHeader>
        <form onSubmit={handleSubmitMaterial} className="p-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              name="materialName"
              label="Material Name *"
              placeholder="e.g., Red Pipe Cleaners"
              value={formData.materialName}
              onChange={(e) => setFormData({ ...formData, materialName: e.target.value })}
              required
            />
            <Select
              name="category"
              label="Category *"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              options={CATEGORIES.filter(c => c.value)}
              placeholder="Select category"
              required
            />
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <Input
              name="unit"
              label="Unit *"
              placeholder="pcs"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              required
            />
            <Input
              name="openingStock"
              label="Opening Stock"
              type="number"
              placeholder="0"
              value={formData.openingStock}
              onChange={(e) => setFormData({ ...formData, openingStock: parseInt(e.target.value) || 0 })}
              min="0"
            />
            <Input
              name="currentStock"
              label="Current Stock *"
              type="number"
              placeholder="0"
              value={formData.currentStock}
              onChange={(e) => setFormData({ ...formData, currentStock: parseInt(e.target.value) || 0 })}
              min="0"
              required
            />
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <Input
              name="unitCost"
              label="Unit Cost (₹) *"
              type="number"
              placeholder="0.00"
              value={formData.unitCost}
              onChange={(e) => setFormData({ ...formData, unitCost: parseFloat(e.target.value) || 0 })}
              min="0"
              step="0.01"
              required
            />
            <Input
              name="reorderLevel"
              label="Reorder Level *"
              type="number"
              placeholder="10"
              value={formData.reorderLevel}
              onChange={(e) => setFormData({ ...formData, reorderLevel: parseInt(e.target.value) || 0 })}
              min="0"
              required
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              {editingMaterial ? "Update Material" : "Add Material"}
            </Button>
            <Button type="button" variant="outline" onClick={() => { setShowAddModal(false); setEditingMaterial(null); resetForm(); }} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )}

  {/* Record Movement Modal */}
  {showMovementModal && (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
      <div className="bg-surface border border-border rounded-xl w-full max-w-md animate-slide-up">
        <CardHeader className="p-6 border-b border-border">
          <CardTitle>Record Stock Movement</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmitMovement} className="p-6 space-y-4">
          <Select
            name="movementType"
            label="Movement Type *"
            value={movementType}
            onChange={(e) => setMovementType(e.target.value as "in" | "out" | "adjustment")}
            options={MOVEMENT_TYPES}
            required
          />
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              name="quantity"
              label="Quantity *"
              type="number"
              placeholder="1"
              value={movementQuantity}
              onChange={(e) => setMovementQuantity(parseInt(e.target.value) || 1)}
              min="1"
              required
            />
            <Input
              name="movementReferenceId"
              label="Reference ID (Optional)"
              placeholder="e.g., PO-12345"
              value={movementReferenceId}
              onChange={(e) => setMovementReferenceId(e.target.value)}
            />
          </div>
          <Textarea
            name="notes"
            label="Notes (Optional)"
            placeholder="Reason for movement, supplier name, etc."
            value={movementNotes}
            onChange={(e) => setMovementNotes(e.target.value)}
            rows={3}
          />
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">Record Movement</Button>
            <Button type="button" variant="outline" onClick={() => { setShowMovementModal(false); resetMovementForm(); }} className="flex-1">
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