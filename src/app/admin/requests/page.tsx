"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { formatPrice, formatDateTime } from "@/lib/utils";
import { Search, Filter, MessageSquare, X, Eye, Edit, Minus, Plus, DollarSign } from "lucide-react";
import { useRouter } from "next/navigation";

interface CustomRequest {
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
  messageCard: string;
  requiredDate: string;
  notes?: string;
  quotedPrice?: number;
  requestStatus: string;
  createdAt: string;
  updatedAt: string;
}

const REQUEST_STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "pending", label: "Pending" },
  { value: "contacted", label: "Contacted" },
  { value: "quoted", label: "Quoted" },
  { value: "confirmed", label: "Confirmed" },
  { value: "in_production", label: "In Production" },
  { value: "ready", label: "Ready" },
  { value: "delivered", label: "Delivered" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const REQUEST_STATUS_LABELS: Record<string, string> = {
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

const REQUEST_STATUS_VARIANTS: Record<string, string> = {
  pending: "default",
  contacted: "warning",
  quoted: "info",
  confirmed: "primary",
  in_production: "secondary",
  ready: "info",
  delivered: "success",
  completed: "success",
  cancelled: "error",
};

const WRAPPING_LABELS: Record<string, string> = {
  none: "No Wrapping",
  paper: "Kraft Paper",
  cellophane: "Clear Cellophane",
  fabric: "Fabric Wrap",
  box: "Gift Box",
};

const BOUQUET_SIZE_LABELS: Record<string, string> = {
  small: "Small (5-7 flowers)",
  medium: "Medium (8-12 flowers)",
  large: "Large (13-18 flowers)",
  extra_large: "Extra Large (19+ flowers)",
};

const MESSAGE_CARD_LABELS: Record<string, string> = {
  none: "No Card",
  standard: "Standard Card",
  premium: "Premium Card with Envelope",
};

export default function AdminRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<CustomRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 20;
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<CustomRequest | null>(null);
  const [editingRequest, setEditingRequest] = useState<CustomRequest | null>(null);

  // Form state for editing request
  const [formData, setFormData] = useState({
    requestStatus: "",
    quotedPrice: 0,
    internalNotes: "",
  });

  const fetchRequests = async (page = 1) => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });
      if (searchQuery) params.append("search", searchQuery);
      if (statusFilter) params.append("status", statusFilter);

      const response = await fetch(`/api/admin/requests?${params.toString()}`, {
        credentials: "include",
      });
      const result = await response.json();
      if (result.success) {
        setRequests(result.data.items);
        setTotalPages(result.data.totalPages);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error("Failed to fetch requests:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests(currentPage);
  }, [currentPage, searchQuery, statusFilter]);

  const handleUpdateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRequest) return;
    try {
      const response = await fetch(`/api/admin/requests/${editingRequest.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include",
      });
      const result = await response.json();
      if (result.success) {
        setShowRequestModal(false);
        setEditingRequest(null);
        fetchRequests(currentPage);
      } else {
        alert(result.error?.message || "Failed to update request");
      }
    } catch (error) {
      console.error("Failed to update request:", error);
      alert("Failed to update request");
    }
  };

  const handleViewRequest = (request: CustomRequest) => {
    setSelectedRequest(request);
    setShowRequestModal(true);
  };

  const handleEditRequest = (request: CustomRequest) => {
    setEditingRequest(request);
    setFormData({
      requestStatus: request.requestStatus,
      quotedPrice: request.quotedPrice || 0,
      internalNotes: "",
    });
    setShowRequestModal(true);
  };

  // Request columns for data table
  const requestColumns = [
    { 
      key: "requestId", 
      header: "Request ID", 
      sortable: true,
      render: (item: CustomRequest) => (
        <span className="font-mono text-sm">{item.requestId}</span>
      )
    },
    { key: "customerName", header: "Customer", sortable: true },
    { 
      key: "bouquetSize", 
      header: "Size", 
      sortable: true,
      render: (item: CustomRequest) => BOUQUET_SIZE_LABELS[item.bouquetSize] || item.bouquetSize
    },
    { 
      key: "budgetMin", 
      header: "Budget", 
      sortable: true,
      render: (item: CustomRequest) => `${formatPrice(item.budgetMin)} - ${formatPrice(item.budgetMax)}`
    },
    { 
      key: "requestStatus", 
      header: "Status", 
      sortable: true,
      render: (item: CustomRequest) => (
        <Badge variant={REQUEST_STATUS_VARIANTS[item.requestStatus] as any}>
          {REQUEST_STATUS_LABELS[item.requestStatus] || item.requestStatus}
        </Badge>
      )
    },
    { 
      key: "quotedPrice", 
      header: "Quoted Price", 
      sortable: true,
      render: (item: CustomRequest) => item.quotedPrice ? formatPrice(item.quotedPrice) : "—"
    },
    { 
      key: "requiredDate", 
      header: "Required Date", 
      sortable: true,
      render: (item: CustomRequest) => formatDateTime(item.requiredDate)
    },
    { 
      key: "createdAt", 
      header: "Created", 
      sortable: true,
      render: (item: CustomRequest) => formatDateTime(item.createdAt)
    },
  ];

  const filteredRequests = requests;

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-heading text-2xl lg:text-3xl font-bold text-text">Custom Requests</h1>
            <p className="text-text-muted mt-1">Manage custom bouquet requests</p>
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
          <h1 className="font-heading text-2xl lg:text-3xl font-bold text-text">Custom Requests</h1>
          <p className="text-text-muted mt-1">Manage custom bouquet requests</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-surface border border-border rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-muted">Total Requests</p>
              <p className="font-heading text-3xl font-bold text-text">{requests.length}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-primary" aria-hidden="true" />
            </div>
          </div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-muted">Pending</p>
              <p className="font-heading text-3xl font-bold text-text">{requests.filter(r => r.requestStatus === 'pending').length}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-warning" aria-hidden="true" />
            </div>
          </div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-muted">Quoted</p>
              <p className="font-heading text-3xl font-bold text-text">{requests.filter(r => r.requestStatus === 'quoted').length}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-info/10 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-info" aria-hidden="true" />
            </div>
          </div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-muted">In Production</p>
              <p className="font-heading text-3xl font-bold text-text">{requests.filter(r => ['in_production', 'ready'].includes(r.requestStatus)).length}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-secondary" aria-hidden="true" />
            </div>
          </div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-muted">Completed</p>
              <p className="font-heading text-3xl font-bold text-text">{requests.filter(r => ['delivered', 'completed'].includes(r.requestStatus)).length}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-success" aria-hidden="true" />
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
              placeholder="Search requests (ID, customer name)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-lg text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={REQUEST_STATUS_OPTIONS}
            placeholder="Filter by Status"
            className="w-[200px]"
          />
        </div>
      </div>

      {/* Requests Table */}
      <AdminDataTable
        data={filteredRequests}
        columns={requestColumns}
        keyField="id"
        searchable={false}
        pagination={{
          currentPage,
          totalPages,
          onPageChange: fetchRequests,
        }}
        loading={isLoading}
        emptyMessage="No custom requests found"
        onRowClick={(request) => handleViewRequest(request)}
        onEdit={handleEditRequest}
        onView={handleViewRequest}
        actionsHeader="Actions"
      />
      </div>

  {/* Request Detail / Edit Modal */}
  {(showRequestModal && (selectedRequest || editingRequest)) && (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
      <div className="bg-surface border border-border rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="font-heading text-xl font-semibold text-text">
            {editingRequest ? "Edit Request" : "Request Details"}
            <span className="font-mono text-sm ml-2">#{editingRequest?.requestId || selectedRequest?.requestId}</span>
          </h2>
          <button
            onClick={() => { setShowRequestModal(false); setSelectedRequest(null); setEditingRequest(null); }}
            className="p-1 text-text-muted hover:text-text rounded-lg transition-colors"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {editingRequest ? (
          // Edit Mode
          <form onSubmit={handleUpdateRequest} className="p-6 space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <Select
                name="requestStatus"
                label="Request Status *"
                value={formData.requestStatus}
                onChange={(e) => setFormData({ ...formData, requestStatus: e.target.value })}
                options={REQUEST_STATUS_OPTIONS.filter(o => o.value)}
                required
              />
              <Input
                name="quotedPrice"
                label="Quoted Price (₹)"
                type="number"
                placeholder="0"
                value={formData.quotedPrice}
                onChange={(e) => setFormData({ ...formData, quotedPrice: parseFloat(e.target.value) || 0 })}
                min="0"
                step="0.01"
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
              <Button type="submit" className="flex-1">Update Request</Button>
              <Button type="button" variant="outline" onClick={() => { setShowRequestModal(false); setEditingRequest(null); }} className="flex-1">
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          // View Mode
          <div className="p-6 space-y-6">
            {/* Request Info */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-surface-elevated p-4 rounded-lg">
                <p className="text-sm text-text-muted">Request ID</p>
                <p className="font-mono font-semibold text-text">{selectedRequest?.requestId}</p>
              </div>
              <div className="bg-surface-elevated p-4 rounded-lg">
                <p className="text-sm text-text-muted">Customer</p>
                <p className="font-medium text-text">{selectedRequest?.customerName}</p>
              </div>
              <div className="bg-surface-elevated p-4 rounded-lg">
                <p className="text-sm text-text-muted">Phone</p>
                <p className="font-medium text-text">{selectedRequest?.phone}</p>
              </div>
              <div className="bg-surface-elevated p-4 rounded-lg">
                <p className="text-sm text-text-muted">Required Date</p>
                <p className="font-medium text-text">{formatDateTime(selectedRequest?.requiredDate || "")}</p>
              </div>
            </div>

            {/* Status & Quote */}
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <p className="text-sm text-text-muted mb-1">Request Status</p>
                <Badge variant={REQUEST_STATUS_VARIANTS[selectedRequest?.requestStatus || ""] as any}>
                  {REQUEST_STATUS_LABELS[selectedRequest?.requestStatus || ""] || selectedRequest?.requestStatus}
                </Badge>
              </div>
              {selectedRequest?.quotedPrice && (
                <div>
                  <p className="text-sm text-text-muted mb-1">Quoted Price</p>
                  <Badge variant="primary">{formatPrice(selectedRequest.quotedPrice)}</Badge>
                </div>
              )}
              <Button variant="outline" onClick={() => { setEditingRequest(selectedRequest!); setFormData({ requestStatus: selectedRequest?.requestStatus || "", quotedPrice: selectedRequest?.quotedPrice || 0, internalNotes: "" }); }}>
                <Edit className="w-4 h-4 mr-2" aria-hidden="true" />
                Edit Request
              </Button>
            </div>

            {/* Request Details */}
            <div className="border-t border-border pt-6 space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-heading text-lg font-semibold text-text mb-3">Bouquet Details</h3>
                  <dl className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-text-muted">Bouquet Size</dt>
                      <dd className="text-text font-medium">{BOUQUET_SIZE_LABELS[selectedRequest?.bouquetSize || ""] || selectedRequest?.bouquetSize}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-text-muted">Wrapping</dt>
                      <dd className="text-text font-medium">{WRAPPING_LABELS[selectedRequest?.wrapping || ""] || selectedRequest?.wrapping}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-text-muted">Message Card</dt>
                      <dd className="text-text font-medium">{MESSAGE_CARD_LABELS[selectedRequest?.messageCard || ""] || selectedRequest?.messageCard}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-text-muted">Budget Range</dt>
                      <dd className="text-text font-medium">{formatPrice(selectedRequest?.budgetMin || 0)} - {formatPrice(selectedRequest?.budgetMax || 0)}</dd>
                    </div>
                  </dl>
                </div>
                <div>
                  <h3 className="font-heading text-lg font-semibold text-text mb-3">Flower Selection</h3>
                  <div className="space-y-2">
                    {selectedRequest?.flowers.map((flower, index) => (
                      <div key={index} className="flex justify-between p-3 bg-surface-elevated rounded-lg">
                        <span className="text-text">{flower}</span>
                        <span className="text-text-muted font-medium">Qty: {selectedRequest?.quantities[index] || 0}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-heading text-lg font-semibold text-text mb-3">Colour Preferences</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedRequest?.colours.map((colour) => (
                    <Badge key={colour} variant="outline">{colour}</Badge>
                  ))}
                </div>
              </div>

              {selectedRequest?.notes && (
                <div>
                  <h3 className="font-heading text-lg font-semibold text-text mb-2">Customer Notes</h3>
                  <p className="text-text-muted">{selectedRequest.notes}</p>
                </div>
              )}

              <div className="border-t border-border pt-4">
                <h3 className="font-heading text-lg font-semibold text-text mb-3">Customer Details</h3>
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-text-muted">Name</p>
                    <p className="text-text">{selectedRequest?.customerName}</p>
                  </div>
                  <div>
                    <p className="text-text-muted">Phone</p>
                    <p className="text-text">{selectedRequest?.phone}</p>
                  </div>
                  <div>
                    <p className="text-text-muted">Email</p>
                    <p className="text-text">{selectedRequest?.email || "Not provided"}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-border">
              <Button variant="outline" onClick={() => { setShowRequestModal(false); setSelectedRequest(null); }}>
                Close
              </Button>
              <Button onClick={() => { setEditingRequest(selectedRequest!); setFormData({ requestStatus: selectedRequest?.requestStatus || "", quotedPrice: selectedRequest?.quotedPrice || 0, internalNotes: "" }); }}>
                <Edit className="w-4 h-4 mr-2" aria-hidden="true" />
                Edit Request
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