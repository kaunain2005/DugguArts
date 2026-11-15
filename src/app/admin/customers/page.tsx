"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { formatPrice, formatDateTime } from "@/lib/utils";
import { Search, Filter, Users, X, Eye, Edit, Trash2, Package, DollarSign } from "lucide-react";
import { useRouter } from "next/navigation";

interface Customer {
  id: string;
  customerId: string;
  customerName: string;
  phone: string;
  email?: string;
  createdAt: string;
  contactConsent: boolean;
  orders?: Order[];
  totalOrders: number;
  totalSpent: number;
}

interface Order {
  orderId: string;
  orderDate: string;
  totalAmount: number;
  orderStatus: string;
  paymentStatus: string;
}

const fetchCustomers = async (page = 1, pageSize = 20, search = "") => {
  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString(),
  });
  if (search) params.append("search", search);

  const response = await fetch(`/api/admin/customers?${params.toString()}`, {
    credentials: "include",
  });
  const result = await response.json();
  return result;
};

const formatCustomerName = (name: string) => {
  return name.split(' ').map(n => n[0]).join('.').toUpperCase();
};

export default function AdminCustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 20;
  const [searchQuery, setSearchQuery] = useState("");
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const fetchCustomersData = async (page = 1) => {
    try {
      setIsLoading(true);
      const result = await fetchCustomers(page, pageSize, searchQuery);
      if (result.success) {
        setCustomers(result.data.items);
        setTotalPages(result.data.totalPages);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error("Failed to fetch customers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomersData(currentPage);
  }, [currentPage, searchQuery]);

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowCustomerModal(true);
  };

  // Customer columns for data table
  const customerColumns = [
    { 
      key: "customerId", 
      header: "Customer ID", 
      sortable: true,
      render: (item: Customer) => (
        <span className="font-mono text-sm">{item.customerId}</span>
      )
    },
    { 
      key: "customerName", 
      header: "Name", 
      sortable: true,
      render: (item: Customer) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-medium text-sm">{formatCustomerName(item.customerName)}</span>
          </div>
          <span className="font-medium text-text">{item.customerName}</span>
        </div>
      )
    },
    { key: "phone", header: "Phone", sortable: true },
    { 
      key: "email", 
      header: "Email", 
      sortable: true,
      render: (item: Customer) => item.email || "—"
    },
    { 
      key: "totalOrders", 
      header: "Orders", 
      sortable: true,
      render: (item: Customer) => (
        <Badge variant="outline">{item.totalOrders}</Badge>
      )
    },
    { 
      key: "totalSpent", 
      header: "Total Spent", 
      sortable: true,
      render: (item: Customer) => formatPrice(item.totalSpent)
    },
    { 
      key: "contactConsent", 
      header: "Marketing", 
      sortable: true,
      render: (item: Customer) => (
        <Badge variant={item.contactConsent ? "success" : "outline"}>
          {item.contactConsent ? "Opted In" : "Opted Out"}
        </Badge>
      )
    },
    { 
      key: "createdAt", 
      header: "Joined", 
      sortable: true,
      render: (item: Customer) => formatDateTime(item.createdAt)
    },
  ];

  const filteredCustomers = customers;

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-heading text-2xl lg:text-3xl font-bold text-text">Customers</h1>
            <p className="text-text-muted mt-1">Manage customer database</p>
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
          <h1 className="font-heading text-2xl lg:text-3xl font-bold text-text">Customers</h1>
          <p className="text-text-muted mt-1">Manage customer database</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-surface border border-border rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-muted">Total Customers</p>
              <p className="font-heading text-3xl font-bold text-text">{customers.length}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" aria-hidden="true" />
            </div>
          </div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-muted">With Orders</p>
              <p className="font-heading text-3xl font-bold text-text">{customers.filter(c => c.totalOrders > 0).length}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Package className="w-6 h-6 text-primary" aria-hidden="true" />
            </div>
          </div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-muted">Marketing Opt-in</p>
              <p className="font-heading text-3xl font-bold text-text">{customers.filter(c => c.contactConsent).length}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-success" aria-hidden="true" />
            </div>
          </div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-muted">Total Revenue</p>
              <p className="font-heading text-3xl font-bold text-text">
                {formatPrice(customers.reduce((sum, c) => sum + c.totalSpent, 0))}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-secondary" aria-hidden="true" />
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
              placeholder="Search customers (name, phone, email)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-lg text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <AdminDataTable
        data={filteredCustomers}
        columns={customerColumns}
        keyField="id"
        searchable={false}
        pagination={{
          currentPage,
          totalPages,
          onPageChange: fetchCustomersData,
        }}
        loading={isLoading}
        emptyMessage="No customers found"
        onRowClick={(customer) => handleViewCustomer(customer)}
        actionsHeader=""
      />
      </div>

  {/* Customer Detail Modal */}
  {(showCustomerModal && selectedCustomer) && (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
      <div className="bg-surface border border-border rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="font-heading text-xl font-semibold text-text">Customer Details</h2>
          <button
            onClick={() => { setShowCustomerModal(false); setSelectedCustomer(null); }}
            className="p-1 text-text-muted hover:text-text rounded-lg transition-colors"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Customer Info */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-primary font-bold text-xl">{formatCustomerName(selectedCustomer?.customerName || "")}</span>
            </div>
            <div>
              <h3 className="font-heading text-xl font-semibold text-text">{selectedCustomer?.customerName}</h3>
              <p className="text-text-muted">{selectedCustomer?.email || "No email"}</p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              {selectedCustomer?.contactConsent ? (
                <Badge variant="success">Marketing Opt-in</Badge>
              ) : (
                <Badge variant="outline">Marketing Opt-out</Badge>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-surface-elevated p-4 rounded-lg text-center">
              <p className="text-sm text-text-muted">Total Orders</p>
              <p className="font-heading text-2xl font-bold text-text">{selectedCustomer?.totalOrders}</p>
            </div>
            <div className="bg-surface-elevated p-4 rounded-lg text-center">
              <p className="text-sm text-text-muted">Total Spent</p>
              <p className="font-heading text-2xl font-bold text-text">{formatPrice(selectedCustomer?.totalSpent || 0)}</p>
            </div>
            <div className="bg-surface-elevated p-4 rounded-lg text-center">
              <p className="text-sm text-text-muted">Member Since</p>
              <p className="font-medium text-text">{formatDateTime(selectedCustomer?.createdAt || "")}</p>
            </div>
          </div>

          {/* Contact Info */}
          <div className="border-t border-border pt-6">
            <h3 className="font-heading text-lg font-semibold text-text mb-4">Contact Information</h3>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-text-muted">Phone</p>
                <p className="text-text">{selectedCustomer?.phone}</p>
              </div>
              <div>
                <p className="text-text-muted">Email</p>
                <p className="text-text">{selectedCustomer?.email || "Not provided"}</p>
              </div>
              <div>
                <p className="text-text-muted">Customer ID</p>
                <p className="font-mono text-text">{selectedCustomer?.customerId}</p>
              </div>
              <div>
                <p className="text-text-muted">Joined</p>
                <p className="text-text">{formatDateTime(selectedCustomer?.createdAt || "")}</p>
              </div>
            </div>
          </div>

          {/* Orders History */}
          {selectedCustomer?.orders && selectedCustomer.orders.length > 0 && (
            <div className="border-t border-border pt-6">
              <h3 className="font-heading text-lg font-semibold text-text mb-4">Recent Orders</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-surface border-b border-border">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Order ID</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Total</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Payment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {selectedCustomer.orders.map((order) => (
                      <tr key={order.orderId}>
                        <td className="px-4 py-3 text-sm font-mono text-text">{order.orderId}</td>
                        <td className="px-4 py-3 text-sm text-text">{formatDateTime(order.orderDate)}</td>
                        <td className="px-4 py-3 text-sm font-medium text-text">{formatPrice(order.totalAmount)}</td>
                        <td className="px-4 py-3 text-sm">
                          <Badge variant="outline" className="text-xs">{order.orderStatus}</Badge>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <Badge variant="outline" className="text-xs">{order.paymentStatus}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-border">
            <Button variant="outline" onClick={() => { setShowCustomerModal(false); setSelectedCustomer(null); }}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  )}
</>
  );
}

import { CheckCircle } from "lucide-react";