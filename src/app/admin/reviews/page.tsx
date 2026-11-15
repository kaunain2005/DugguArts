"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { formatDateTime } from "@/lib/utils";
import { Search, Filter, Star, X, Eye, Edit, Trash2, CheckCircle, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface Review {
  id: string;
  reviewId: string;
  customerName: string;
  productId: string;
  productName?: string;
  rating: number;
  title: string;
  reviewText: string;
  reviewDate: string;
  photoUrl?: string;
  displayPermission: boolean;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

const APPROVAL_STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

const APPROVAL_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

const APPROVAL_STATUS_VARIANTS: Record<string, string> = {
  pending: "warning",
  approved: "success",
  rejected: "error",
};

export default function AdminReviewsPage() {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 20;
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [featuredFilter, setFeaturedFilter] = useState("");
  const [productFilter, setProductFilter] = useState("");
  const products = [
    { id: "", name: "All Products" },
    { id: "classic-red-rose", name: "Classic Red Rose" },
    { id: "pink-tulip-bunch", name: "Pink Tulip Bunch" },
    { id: "sunshine-daisy", name: "Sunshine Daisy" },
    { id: "romantic-mixed-bouquet", name: "Romantic Mixed Bouquet" },
  ];

  const fetchReviews = async (page = 1) => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });
      if (searchQuery) params.append("search", searchQuery);
      if (statusFilter) params.append("approvalStatus", statusFilter);
      if (featuredFilter) params.append("featured", featuredFilter);
      if (productFilter) params.append("productId", productFilter);

      const response = await fetch(`/api/admin/reviews?${params.toString()}`, {
        credentials: "include",
      });
      const result = await response.json();
      if (result.success) {
        setReviews(result.data.items);
        setTotalPages(result.data.totalPages);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews(currentPage);
  }, [currentPage, searchQuery, statusFilter, featuredFilter, productFilter]);

  const handleUpdateReview = async (review: Review, approvalStatus: 'approved' | 'rejected', featured?: boolean) => {
    try {
      const response = await fetch(`/api/admin/reviews/${review.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approvalStatus, featured }),
        credentials: "include",
      });
      const result = await response.json();
      if (result.success) {
        fetchReviews(currentPage);
      } else {
        alert(result.error?.message || "Failed to update review");
      }
    } catch (error) {
      console.error("Failed to update review:", error);
      alert("Failed to update review");
    }
  };

  const handleDeleteReview = async (review: Review) => {
    if (!confirm(`Are you sure you want to delete this review by ${review.customerName}?`)) return;
    try {
      const response = await fetch(`/api/admin/reviews/${review.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const result = await response.json();
      if (result.success) {
        fetchReviews(currentPage);
      } else {
        alert(result.error?.message || "Failed to delete review");
      }
    } catch (error) {
      console.error("Failed to delete review:", error);
      alert("Failed to delete review");
    }
  };

  // Review columns for data table
  const reviewColumns = [
    { 
      key: "reviewId", 
      header: "Review ID", 
      sortable: true,
      render: (item: Review) => (
        <span className="font-mono text-sm">{item.reviewId}</span>
      )
    },
    { key: "customerName", header: "Customer", sortable: true },
    { 
      key: "productName", 
      header: "Product", 
      sortable: true,
      render: (item: Review) => item.productName || "—"
    },
    { 
      key: "rating", 
      header: "Rating", 
      sortable: true,
      render: (item: Review) => (
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className={`w-4 h-4 ${i < item.rating ? "text-warning fill-current" : "text-border"}`} fill="currentColor" aria-hidden="true" />
          ))}
        </div>
      )
    },
    { 
      key: "title", 
      header: "Title", 
      sortable: true,
      render: (item: Review) => (
        <span className="max-w-[200px] truncate block">{item.title}</span>
      )
    },
    { 
      key: "approvalStatus", 
      header: "Status", 
      sortable: true,
      render: (item: Review) => (
        <Badge variant={APPROVAL_STATUS_VARIANTS[item.approvalStatus] as any}>
          {APPROVAL_STATUS_LABELS[item.approvalStatus]}
        </Badge>
      )
    },
    { 
      key: "featured", 
      header: "Featured", 
      sortable: true,
      render: (item: Review) => (
        <Badge variant={item.featured ? "success" : "outline"}>
          {item.featured ? "Yes" : "No"}
        </Badge>
      )
    },
    { 
      key: "reviewDate", 
      header: "Date", 
      sortable: true,
      render: (item: Review) => formatDateTime(item.reviewDate)
    },
  ];

  const filteredReviews = reviews;

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-heading text-2xl lg:text-3xl font-bold text-text">Reviews</h1>
            <p className="text-text-muted mt-1">Moderate customer reviews</p>
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
          <h1 className="font-heading text-2xl lg:text-3xl font-bold text-text">Reviews</h1>
          <p className="text-text-muted mt-1">Moderate customer reviews</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-surface border border-border rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-muted">Total Reviews</p>
              <p className="font-heading text-3xl font-bold text-text">{reviews.length}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Star className="w-6 h-6 text-primary" aria-hidden="true" />
            </div>
          </div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-muted">Pending</p>
              <p className="font-heading text-3xl font-bold text-text">{reviews.filter(r => r.approvalStatus === 'pending').length}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center">
              <Star className="w-6 h-6 text-warning" aria-hidden="true" />
            </div>
          </div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-muted">Approved</p>
              <p className="font-heading text-3xl font-bold text-text">{reviews.filter(r => r.approvalStatus === 'approved').length}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-success" aria-hidden="true" />
            </div>
          </div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-muted">Featured</p>
              <p className="font-heading text-3xl font-bold text-text">{reviews.filter(r => r.featured).length}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-info/10 flex items-center justify-center">
              <Star className="w-6 h-6 text-info" aria-hidden="true" />
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
              placeholder="Search reviews (customer, product, title)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-lg text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={APPROVAL_STATUS_OPTIONS}
            placeholder="Filter by Status"
            className="w-[180px]"
          />
          <Select
            value={featuredFilter}
            onChange={(e) => setFeaturedFilter(e.target.value)}
            options={[
              { value: "", label: "All" },
              { value: "true", label: "Featured" },
              { value: "false", label: "Not Featured" },
            ]}
            placeholder="Featured"
            className="w-[180px]"
          />
          <Select
            value={productFilter}
            onChange={(e) => setProductFilter(e.target.value)}
            options={products.map(p => ({ value: p.id, label: p.name }))}
            placeholder="Filter by Product"
            className="w-[200px]"
          />
        </div>
      </div>

      {/* Reviews Table */}
      <AdminDataTable
        data={filteredReviews}
        columns={reviewColumns}
        keyField="id"
        searchable={false}
        pagination={{
          currentPage,
          totalPages,
          onPageChange: fetchReviews,
        }}
        loading={isLoading}
        emptyMessage="No reviews found"
        onView={(review) => {
          // Quick actions via custom render
        }}
        actionsHeader="Actions"
      />
      </div>

  {/* Custom Actions Render */}
  <script dangerouslySetInnerHTML={{
    __html: `
      // This is a placeholder for custom actions
      // The AdminDataTable doesn't have built-in quick actions for approve/reject/feature
      // We'll handle this via row click or custom column renders
    `
  }} />
      <style jsx>{`
        .review-action-btn {
          @apply p-2 text-text-muted hover:text-primary hover:bg-primary/10 rounded-lg transition-colors;
        }
        .review-action-btn.approve:hover {
          @apply text-success bg-success/10;
        }
        .review-action-btn.reject:hover {
          @apply text-error bg-error/10;
        }
        .review-action-btn.feature:hover {
          @apply text-info bg-info/10;
        }
      `}
      </style>
    </>
  );
}