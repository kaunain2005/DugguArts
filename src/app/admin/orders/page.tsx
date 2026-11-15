"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { formatPrice, formatDateTime } from "@/lib/utils";
import { Search, Filter, ChevronLeft, ChevronRight, ShoppingBag, Truck, Package, X, Eye, Edit, Minus, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

interface Order {
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
  items?: OrderItem[];
}

interface OrderItem {
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

const ORDER_STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "confirmed", label: "Confirmed" },
  { value: "in_production", label: "In Production" },
  { value: "ready", label: "Ready" },
  { value: "dispatched", label: "Dispatched" },
  { value: "delivered", label: "Delivered" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const PAYMENT_STATUS_OPTIONS = [
  { value: "", label: "All Payment Status" },
  { value: "unpaid", label: "Unpaid" },
  { value: "advance_received", label: "Advance Received" },
  { value: "partially_paid", label: "Partially Paid" },
  { value: "paid", label: "Paid" },
  { value: "refunded", label: "Refunded" },
];

const ORDER_STATUS_LABELS: Record<string, string> = {
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

const ORDER_STATUS_VARIANTS: Record<string, string> = {
  new: "default",
  contacted: "warning",
  confirmed: "info",
  in_production: "secondary",
  ready: "info",
  dispatched: "primary",
  delivered: "success",
  completed: "success",
  cancelled: "error",
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  unpaid: "Unpaid",
  advance_received: "Advance Received",
  partially_paid: "Partially Paid",
  paid: "Paid",
  refunded: "Refunded",
};

const PAYMENT_STATUS_VARIANTS: Record<string, string> = {
  unpaid: "error",
  advance_received: "warning",
  partially_paid: "warning",
  paid: "success",
  refunded: "info",
};

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 20;
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  // Form state for editing order
  const [formData, setFormData] = useState({
    orderStatus: "",
    paymentStatus: "",
    internalNotes: "",
  });

  const fetchOrders = async (page = 1) => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });
      if (searchQuery) params.append("search", searchQuery);
      if (statusFilter) params.append("status", statusFilter);
      if (paymentStatusFilter) params.append("paymentStatus", paymentStatusFilter);

      const response = await fetch(`/api/admin/orders?${params.toString()}`, {
        credentials: "include",
      });
      const result = await response.json();
      if (result.success) {
        setOrders(result.data.items);
        setTotalPages(result.data.totalPages);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(currentPage);
  }, [currentPage, searchQuery, statusFilter, paymentStatusFilter]);

  const handleUpdateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;
    try {
      const response = await fetch(`/api/admin/orders/${editingOrder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include",
      });
      const result = await response.json();
      if (result.success) {
        setShowOrderModal(false);
        setEditingOrder(null);
        fetchOrders(currentPage);
      } else {
        alert(result.error?.message || "Failed to update order");
      }
    } catch (error) {
      console.error("Failed to update order:", error);
      alert("Failed to update order");
    }
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const handleEditOrder = (order: Order) => {
    setEditingOrder(order);
    setFormData({
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      internalNotes: "",
    });
    setShowOrderModal(true);
  };

  // Order columns for data table
  const orderColumns = [
    { 
      key: "orderId", 
      header: "Order ID", 
      sortable: true,
      render: (item: Order) => (
        <span className="font-mono text-sm">{item.orderId}</span>
      )
    },
    { key: "customerName", header: "Customer", sortable: true },
    { 
      key: "totalAmount", 
      header: "Total", 
      sortable: true,
      render: (item: Order) => formatPrice(item.totalAmount)
    },
    { 
      key: "orderStatus", 
      header: "Order Status", 
      sortable: true,
      render: (item: Order) => (
        <Badge variant={ORDER_STATUS_VARIANTS[item.orderStatus] as any}>
          {ORDER_STATUS_LABELS[item.orderStatus] || item.orderStatus}
        </Badge>
      )
    },
    { 
      key: "paymentStatus", 
      header: "Payment", 
      sortable: true,
      render: (item: Order) => (
        <Badge variant={PAYMENT_STATUS_VARIANTS[item.paymentStatus] as any}>
          {PAYMENT_STATUS_LABELS[item.paymentStatus] || item.paymentStatus}
        </Badge>
      )
    },
    { 
      key: "orderDate", 
      header: "Date", 
      sortable: true,
      render: (item: Order) => formatDateTime(item.orderDate)
    },
  ];

  const filteredOrders = orders;

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-heading text-2xl lg:text-3xl font-bold text-text">Orders</h1>
            <p className="text-text-muted mt-1">Manage customer orders</p>
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
          <h1 className="font-heading text-2xl lg:text-3xl font-bold text-text">Orders</h1>
          <p className="text-text-muted mt-1">Manage customer orders</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-surface border border-border rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-muted">Total Orders</p>
              <p className="font-heading text-3xl font-bold text-text">{orders.length}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-primary" aria-hidden="true" />
            </div>
          </div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-muted">New</p>
              <p className="font-heading text-3xl font-bold text-text">{orders.filter(o => o.orderStatus === 'new').length}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center">
              <Package className="w-6 h-6 text-warning" aria-hidden="true" />
            </div>
          </div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-muted">In Production</p>
              <p className="font-heading text-3xl font-bold text-text">{orders.filter(o => ['in_production', 'ready'].includes(o.orderStatus)).length}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center">
              <Truck className="w-6 h-6 text-secondary" aria-hidden="true" />
            </div>
          </div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-muted">Dispatched</p>
              <p className="font-heading text-3xl font-bold text-text">{orders.filter(o => o.orderStatus === 'dispatched').length}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Truck className="w-6 h-6 text-primary" aria-hidden="true" />
            </div>
          </div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-muted">Completed</p>
              <p className="font-heading text-3xl font-bold text-text">{orders.filter(o => ['delivered', 'completed'].includes(o.orderStatus)).length}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
              <Package className="w-6 h-6 text-success" aria-hidden="true" />
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
              placeholder="Search orders (ID, customer name)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-lg text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={ORDER_STATUS_OPTIONS}
            placeholder="Filter by Order Status"
            className="w-[200px]"
          />
          <Select
            value={paymentStatusFilter}
            onChange={(e) => setPaymentStatusFilter(e.target.value)}
            options={PAYMENT_STATUS_OPTIONS}
            placeholder="Filter by Payment Status"
            className="w-[220px]"
          />
        </div>
      </div>

      {/* Orders Table */}
      <AdminDataTable
        data={filteredOrders}
        columns={orderColumns}
        keyField="id"
        searchable={false}
        pagination={{
          currentPage,
          totalPages,
          onPageChange: fetchOrders,
        }}
        loading={isLoading}
        emptyMessage="No orders found"
        onRowClick={(order) => handleViewOrder(order)}
        onEdit={handleEditOrder}
        onView={handleViewOrder}
        actionsHeader="Actions"
      />
      </div>

  {/* Order Detail / Edit Modal */}
  {(showOrderModal && (selectedOrder || editingOrder)) && (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
      <div className="bg-surface border border-border rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="font-heading text-xl font-semibold text-text">
            {editingOrder ? "Edit Order" : "Order Details"}
            <span className="font-mono text-sm ml-2">#{editingOrder?.orderId || selectedOrder?.orderId}</span>
          </h2>
          <button
            onClick={() => { setShowOrderModal(false); setSelectedOrder(null); setEditingOrder(null); }}
            className="p-1 text-text-muted hover:text-text rounded-lg transition-colors"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {editingOrder ? (
          // Edit Mode
          <form onSubmit={handleUpdateOrder} className="p-6 space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <Select
                name="orderStatus"
                label="Order Status *"
                value={formData.orderStatus}
                onChange={(e) => setFormData({ ...formData, orderStatus: e.target.value })}
                options={ORDER_STATUS_OPTIONS.filter(o => o.value)}
                required
              />
              <Select
                name="paymentStatus"
                label="Payment Status *"
                value={formData.paymentStatus}
                onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                options={PAYMENT_STATUS_OPTIONS.filter(o => o.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-2">Internal Notes</label>
              <textarea
                name="internalNotes"
                value={formData.internalNotes}
                onChange={(e) => setFormData({ ...formData, internalNotes: e.target.value })}
                rows={3}
                className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg text-text placeholder-text-muted resize-y min-h-[100px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="Internal notes for team..."
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">Update Order</Button>
              <Button type="button" variant="outline" onClick={() => { setShowOrderModal(false); setEditingOrder(null); }} className="flex-1">
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          // View Mode
          <div className="p-6 space-y-6">
            {/* Order Info */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-surface-elevated p-4 rounded-lg">
                <p className="text-sm text-text-muted">Order ID</p>
                <p className="font-mono font-semibold text-text">{selectedOrder?.orderId}</p>
              </div>
              <div className="bg-surface-elevated p-4 rounded-lg">
                <p className="text-sm text-text-muted">Customer</p>
                <p className="font-medium text-text">{selectedOrder?.customerName}</p>
              </div>
              <div className="bg-surface-elevated p-4 rounded-lg">
                <p className="text-sm text-text-muted">Phone</p>
                <p className="font-medium text-text">{selectedOrder?.phone}</p>
              </div>
              <div className="bg-surface-elevated p-4 rounded-lg">
                <p className="text-sm text-text-muted">Date</p>
                <p className="font-medium text-text">{formatDateTime(selectedOrder?.orderDate || "")}</p>
              </div>
            </div>

            {/* Status Badges */}
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <p className="text-sm text-text-muted mb-1">Order Status</p>
                <Badge variant={ORDER_STATUS_VARIANTS[selectedOrder?.orderStatus || ""] as any}>
                  {ORDER_STATUS_LABELS[selectedOrder?.orderStatus || ""] || selectedOrder?.orderStatus}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-text-muted mb-1">Payment Status</p>
                <Badge variant={PAYMENT_STATUS_VARIANTS[selectedOrder?.paymentStatus || ""] as any}>
                  {PAYMENT_STATUS_LABELS[selectedOrder?.paymentStatus || ""] || selectedOrder?.paymentStatus}
                </Badge>
              </div>
              <Button variant="outline" onClick={() => { setEditingOrder(selectedOrder!); setFormData({ orderStatus: selectedOrder?.orderStatus || "", paymentStatus: selectedOrder?.paymentStatus || "", internalNotes: "" }); }}>
                <Edit className="w-4 h-4 mr-2" aria-hidden="true" />
                Edit Order
              </Button>
            </div>

            {/* Order Items */}
            <div className="border-t border-border pt-6">
              <h3 className="font-heading text-lg font-semibold text-text mb-4">Order Items</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-surface border-b border-border">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Product</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Qty</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Unit Price</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Total</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {selectedOrder?.items?.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-3 text-sm text-text">{item.productNameSnapshot}</td>
                        <td className="px-4 py-3 text-sm text-text">{item.quantity}</td>
                        <td className="px-4 py-3 text-sm text-text">{formatPrice(item.unitPriceSnapshot)}</td>
                        <td className="px-4 py-3 text-sm font-medium text-text">{formatPrice(item.lineTotal)}</td>
                        <td className="px-4 py-3 text-sm text-text-muted">
                          {item.selectedColour && <span>Colour: {item.selectedColour}</span>}
                          {item.personalisation && <span className="ml-2">Personalised: {item.personalisation}</span>}
                          {item.wrapping && <span className="ml-2">Gift Wrapped</span>}
                          {item.messageCard && <span className="ml-2">Message Card</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Order Summary */}
            <div className="border-t border-border pt-6">
              <div className="flex justify-end">
                <div className="w-full max-w-xs space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">Subtotal</span>
                    <span className="text-text font-medium">{formatPrice(selectedOrder?.subtotal || 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">Packaging</span>
                    <span className="text-text font-medium">{formatPrice(selectedOrder?.packagingCharge || 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">Delivery</span>
                    <span className="text-text font-medium">{formatPrice(selectedOrder?.deliveryCharge || 0)}</span>
                  </div>
                  <div className="border-t border-border pt-3 flex justify-between text-lg font-bold">
                    <span className="text-text">Total</span>
                    <span className="text-text">{formatPrice(selectedOrder?.totalAmount || 0)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Details */}
            <div className="border-t border-border pt-6">
              <h3 className="font-heading text-lg font-semibold text-text mb-4">Customer Details</h3>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-text-muted">Name</p>
                  <p className="text-text">{selectedOrder?.customerName}</p>
                </div>
                <div>
                  <p className="text-text-muted">Phone</p>
                  <p className="text-text">{selectedOrder?.phone}</p>
                </div>
                <div>
                  <p className="text-text-muted">Email</p>
                  <p className="text-text">{selectedOrder?.email || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-text-muted">Pincode</p>
                  <p className="text-text">{selectedOrder?.pincode}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-text-muted">Address</p>
                  <p className="text-text">{selectedOrder?.deliveryAddress}, {selectedOrder?.city}, {selectedOrder?.state} - {selectedOrder?.pincode}</p>
                </div>
              </div>
            </div>

            {/* Customer Notes */}
            {selectedOrder?.customerNotes && (
              <div className="border-t border-border pt-6">
                <h3 className="font-heading text-lg font-semibold text-text mb-2">Customer Notes</h3>
                <p className="text-text-muted">{selectedOrder.customerNotes}</p>
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t border-border">
              <Button variant="outline" onClick={() => { setShowOrderModal(false); setSelectedOrder(null); }}>
                Close
              </Button>
              <Button onClick={() => { setEditingOrder(selectedOrder!); setFormData({ orderStatus: selectedOrder?.orderStatus || "", paymentStatus: selectedOrder?.paymentStatus || "", internalNotes: "" }); }}>
                <Edit className="w-4 h-4 mr-2" aria-hidden="true" />
                Edit Order
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )}
</>
  );
}