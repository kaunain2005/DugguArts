"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { 
  Package, 
  Clock, 
  Truck, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Eye,
  Mail,
  MapPin,
  Phone,
  CreditCard,
  Download,
  Filter,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { cn } from "@/lib/utils";
import { APP_CONFIG, WHATSAPP_CONFIG } from "@/lib/constants";
import { useCart } from "@/context/CartContext";
import { CartDrawer } from "@/components/cart/CartDrawer";

interface Order {
  id: string;
  orderId: string;
  orderReference: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  subtotal: number;
  packagingCharge: number;
  deliveryCharge: number;
  items: OrderItem[];
  customerName: string;
  phone: string;
  email?: string;
  deliveryAddress: string;
  pincode: string;
  city: string;
  state: string;
  customerNotes?: string;
  createdAt: string;
  updatedAt: string;
  whatsappUrl?: string;
}

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  selectedColour?: string;
  wrapping?: boolean;
  messageCard?: string;
  lineTotal: number;
}

type OrderStatus = 
  | "new" 
  | "contacted" 
  | "confirmed" 
  | "in_production" 
  | "ready" 
  | "dispatched" 
  | "delivered" 
  | "completed" 
  | "cancelled";

type PaymentStatus = 
  | "unpaid" 
  | "advance_received" 
  | "partially_paid" 
  | "paid" 
  | "refunded";

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: React.ReactNode }> = {
  new: { label: "New", color: "bg-blue-100 text-blue-800", icon: <Package className="w-3 h-3" /> },
  contacted: { label: "Contacted", color: "bg-yellow-100 text-yellow-800", icon: <Mail className="w-3 h-3" /> },
  confirmed: { label: "Confirmed", color: "bg-green-100 text-green-800", icon: <CheckCircle className="w-3 h-3" /> },
  in_production: { label: "In Production", color: "bg-purple-100 text-purple-800", icon: <Loader2 className="w-3 h-3 animate-spin" /> },
  ready: { label: "Ready", color: "bg-indigo-100 text-indigo-800", icon: <CheckCircle className="w-3 h-3" /> },
  dispatched: { label: "Dispatched", color: "bg-orange-100 text-orange-800", icon: <Truck className="w-3 h-3" /> },
  delivered: { label: "Delivered", color: "bg-green-100 text-green-800", icon: <CheckCircle className="w-3 h-3" /> },
  completed: { label: "Completed", color: "bg-gray-100 text-gray-800", icon: <CheckCircle className="w-3 h-3" /> },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-800", icon: <XCircle className="w-3 h-3" /> },
};

const PAYMENT_STATUS_CONFIG: Record<PaymentStatus, { label: string; color: string }> = {
  unpaid: { label: "Unpaid", color: "bg-red-100 text-red-800" },
  advance_received: { label: "Advance Received", color: "bg-yellow-100 text-yellow-800" },
  partially_paid: { label: "Partially Paid", color: "bg-orange-100 text-orange-800" },
  paid: { label: "Paid", color: "bg-green-100 text-green-800" },
  refunded: { label: "Refunded", color: "bg-blue-100 text-blue-800" },
};

const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
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

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", { 
    year: "numeric", 
    month: "short", 
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);

  const fetchOrders = async () => {
    if (!user?.email) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(`/api/customer/orders`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }
      
      const data = await response.json();
      if (data.success) {
        setOrders(data.data.orders || data.data.items || []);
      } else {
        setError(data.message || "Failed to load orders");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const matchesSearch = order.orderReference.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getWhatsAppUrl = (order: Order) => {
    if (order.whatsappUrl) return order.whatsappUrl;
    const phone = WHATSAPP_CONFIG.businessNumber || "91XXXXXXXXXX";
    const message = `Hello ${APP_CONFIG.name}, I'd like to discuss my order ${order.orderReference}.`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  };

  if (!user?.email) {
    return (
      <div className="container py-16 lg:py-24">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-primary" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.22 2.01.14 6 1.23 6 3.22-2.29 1.94-4.5 3.22-6 3.22z"/>
            </svg>
          </div>
          <h1 className="font-heading text-2xl font-bold text-text mb-4">Sign In Required</h1>
          <p className="text-text-muted mb-6">Please sign in to view your order history.</p>
          <Link href="/login?callbackUrl=/orders">
            <Button size="lg">Sign In with Google</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 lg:py-12">
      <CartDrawer />
      
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="font-heading text-3xl font-bold text-text">My Orders</h1>
            <p className="text-text-muted mt-1">Track and manage your order history</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <Input
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              type="search"
            />
          </div>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={STATUS_OPTIONS}
            placeholder="All Status"
          />
        </div>
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-surface border border-border rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div className="h-6 w-48 bg-gray-200 animate-pulse rounded" />
                  <div className="h-6 w-32 bg-gray-200 animate-pulse rounded" />
                </div>
                <div className="mt-4 grid grid-cols-3 gap-4">
                  <div className="h-4 bg-gray-200 animate-pulse rounded" />
                  <div className="h-4 bg-gray-200 animate-pulse rounded" />
                  <div className="h-4 bg-gray-200 animate-pulse rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="font-heading text-xl font-semibold text-text mb-2">Unable to Load Orders</h2>
          <p className="text-text-muted mb-4">{error}</p>
          <Button onClick={fetchOrders} variant="outline">Try Again</Button>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-16">
          <Package className="w-16 h-16 text-text-muted/50 mx-auto mb-4" />
          <h2 className="font-heading text-xl font-semibold text-text mb-2">
            {searchQuery || statusFilter !== "all" ? "No Matching Orders" : "No Orders Yet"}
          </h2>
          <p className="text-text-muted mb-6">
            {searchQuery || statusFilter !== "all" 
              ? "Try adjusting your search or filter criteria."
              : "You haven't placed any orders yet."}
          </p>
          {(!searchQuery && statusFilter === "all") && (
            <Link href="/shop">
              <Button size="lg" className="mt-2">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Start Shopping
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <OrderCard 
              key={order.id} 
              order={order} 
              onViewDetails={() => {
                setSelectedOrder(order);
                setShowOrderDetail(true);
              }}
              getWhatsAppUrl={getWhatsAppUrl}
            />
          ))}
        </div>
      )}
      
      {/* Order Detail Modal */}
      {showOrderDetail && selectedOrder && (
        <OrderDetailModal 
          order={selectedOrder} 
          onClose={() => setShowOrderDetail(false)}
          getWhatsAppUrl={getWhatsAppUrl}
        />
      )}
    </div>
  );
}

interface OrderCardProps {
  order: Order;
  onViewDetails: () => void;
  getWhatsAppUrl: (order: Order) => string;
}

function OrderCard({ order, onViewDetails, getWhatsAppUrl }: OrderCardProps) {
  const statusConfig = STATUS_CONFIG[order.status];
  const paymentConfig = PAYMENT_STATUS_CONFIG[order.paymentStatus];

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-sm text-text-muted">Order</span>
            <span className="font-mono font-semibold text-text">{order.orderReference}</span>
            <Badge variant="outline" className="gap-1">
              {statusConfig.icon}
              {statusConfig.label}
            </Badge>
          </div>
          <div className="flex items-center gap-2 sm:ml-auto">
            <Badge variant="outline" className="border border-current text-text">
              {paymentConfig.label}
            </Badge>
            <span className="text-sm text-text-muted hidden sm:block">
              {new Date(order.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Items Preview */}
          <div className="flex flex-wrap gap-2">
            {order.items.slice(0, 3).map((item, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-text-muted">
                <span className="font-medium">{item.productName}</span>
                <span className="text-text-muted">×{item.quantity}</span>
              </div>
            ))}
            {order.items.length > 3 && (
              <span className="text-sm text-text-muted">+{order.items.length - 3} more</span>
            )}
          </div>

          {/* Delivery Info */}
          <div className="flex flex-wrap gap-4 text-sm text-text-muted">
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span className="truncate max-w-[200px]">{order.deliveryAddress}, {order.city} - {order.pincode}</span>
            </div>
            <div className="flex items-center gap-1">
              <Phone className="w-3 h-3" />
              <span>{order.phone}</span>
            </div>
          </div>

          {/* Totals */}
          <div className="border-t border-border pt-4">
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Subtotal</span>
              <span className="font-medium">{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Packaging</span>
              <span className="font-medium">{formatCurrency(order.packagingCharge)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Delivery</span>
              <span className="font-medium">{formatCurrency(order.deliveryCharge)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t border-border pt-3 mt-2">
              <span>Total</span>
              <span>{formatCurrency(order.totalAmount)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onViewDetails}
              className="flex-1 sm:flex-none"
            >
              <Eye className="w-4 h-4 mr-1" />
              View Details
            </Button>
            <Link 
              href={getWhatsAppUrl(order)} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 sm:flex-none gap-1"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.02-.2-.04-.4-.04-.6 0-.2.02-.4.04-.6l2.627-1.58c.31-.18.48-.5.48-.85 0-.36-.22-.68-.55-.82L19.41 2.5c-.36-.14-.75-.07-.94.2L8.54 9.46c-.19.14-.3.35-.3.56v4.93c0 .5.38.9.84.98l4.2.39c.3.03.58-.1.78-.33l2.66-2.47c.24-.23.3-.58.17-.9zm-1.5 4.75c-.07.2-.13.4-.13.6 0 .4.17.77.46 1.02 1.05.85 2.72 1.4 4.57 1.46 1.2.02 2.4-.1 3.55-.34.07-.02.13-.03.19-.03.37 0 .71.05 1.04.14.33.1.63.26.9.45.28.19.54.42.77.7l.51.58c.31.29.5.65.5.97 0 .13-.06.27-.17.37-.25.21-.56.26-.9.2-.19-.02-.38-.04-.57-.05-.51-.03-1-.07-1.5-.14-.5-.06-1-.12-1.5-.19-.5-.08-.97-.2-1.4-.35-.43-.16-.82-.36-1.2-.59l-.87-.51c-.26-.15-.55-.25-.84-.3-.3-.06-.6-.08-.9-.08-.31 0-.61.02-.91.07-.48.08-.92.23-1.33.42-.41.18-.81.38-1.18.61l-.51.52c-.22.25-.39.54-.49.84-.11.3-.13.6-.1 1zm-6.1-4.12c.41-.36.74-.78 1-1.22l-4.8-2.85c-.2-.12-.4-.1-.6.05l-4.02 4.27c-.2.2-.2.5 0 .7l4.1 4.3c.2.2.4.2.6 0l4.15-2.47z"/>
                </svg>
                WhatsApp
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface OrderDetailModalProps {
  order: Order;
  onClose: () => void;
  getWhatsAppUrl: (order: Order) => string;
}

function OrderDetailModal({ order, onClose, getWhatsAppUrl }: OrderDetailModalProps) {
  const statusConfig = STATUS_CONFIG[order.status];
  const paymentConfig = PAYMENT_STATUS_CONFIG[order.paymentStatus];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
      <div 
        className="absolute inset-0" 
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-auto bg-surface rounded-2xl shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-surface/95 backdrop-blur z-10 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-surface transition-colors text-text-muted hover:text-text"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div>
              <p className="font-mono font-semibold text-text">Order {order.orderReference}</p>
              <p className="text-sm text-text-muted">
                Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border border-current text-text">
              {statusConfig.label}
            </Badge>
            <Badge variant="outline" className="border border-current text-text">
              {paymentConfig.label}
            </Badge>
          </div>
        </div>

        <div className="p-6 max-h-[60vh] overflow-auto">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Order Items */}
            <div>
              <h3 className="font-heading text-lg font-semibold text-text mb-4">Order Items</h3>
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <Card key={index} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-text">{item.productName}</p>
                          {item.selectedColour && (
                            <p className="text-sm text-text-muted">Colour: {item.selectedColour}</p>
                          )}
                          {item.wrapping && (
                            <Badge variant="outline" className="mt-1">Gift Wrapped</Badge>
                          )}
                          {item.messageCard && (
                            <p className="text-sm text-text-muted mt-1">💬 {item.messageCard}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-right sm:ml-4">
                          <div className="text-sm text-text-muted">
                            Qty: {item.quantity}
                          </div>
                          <div className="font-medium text-text">
                            {formatCurrency(item.unitPrice * item.quantity)}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Order Summary & Details */}
            <div className="space-y-6">
              {/* Totals */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">Subtotal</span>
                    <span className="font-medium">{formatCurrency(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">Packaging</span>
                    <span className="font-medium">{formatCurrency(order.packagingCharge)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">Delivery</span>
                    <span className="font-medium">{formatCurrency(order.deliveryCharge)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t border-border pt-3">
                    <span>Total</span>
                    <span>{formatCurrency(order.totalAmount)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Customer Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Delivery Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-text-muted">Email</p>
                      <p className="font-medium">{order.email || "Not provided"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-text-muted">Phone</p>
                      <p className="font-medium">{order.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mt-1">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-text-muted">Address</p>
                      <p className="font-medium">{order.deliveryAddress}</p>
                      <p className="text-sm text-text-muted">{order.city}, {order.state} - {order.pincode}</p>
                    </div>
                  </div>
                  {order.customerNotes && (
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mt-1">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-text-muted">Notes</p>
                        <p className="font-medium">{order.customerNotes}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* WhatsApp Action */}
              <a 
                href={getWhatsAppUrl(order)} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button 
                  className="w-full gap-2" 
                  size="lg"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.02-.2-.04-.4-.04-.6 0-.2.02-.4.04-.6l2.627-1.58c.31-.18.48-.5.48-.85 0-.36-.22-.68-.55-.82L19.41 2.5c-.36-.14-.75-.07-.94.2L8.54 9.46c-.19.14-.3.35-.3.56v4.93c0 .5.38.9.84.98l4.2.39c.3.03.58-.1.78-.33l2.66-2.47c.24-.23.3-.58.17-.9zm-1.5 4.75c-.07.2-.13.4-.13.6 0 .4.17.77.46 1.02 1.05.85 2.72 1.4 4.57 1.46 1.2.02 2.4-.1 3.55-.34.07-.02.13-.03.19-.03.37 0 .71.05 1.04.14.33.1.63.26.9.45.28.19.54.42.77.7l.51.58c.31.29.5.65.5.97 0 .13-.06.27-.17.37-.25.21-.56.26-.9.2-.19-.02-.38-.04-.57-.05-.51-.03-1-.07-1.5-.14-.5-.06-1-.12-1.5-.19-.5-.08-.97-.2-1.4-.35-.43-.16-.82-.36-1.2-.59l-.87-.51c-.26-.15-.55-.25-.84-.3-.3-.06-.6-.08-.9-.08-.31 0-.61.02-.91.07-.48.08-.92.23-1.33.42-.41.18-.81.38-1.18.61l-.51.52c-.22.25-.39.54-.49.84-.11.3-.13.6-.1 1zm-6.1-4.12c.41-.36.74-.78 1-1.22l-4.8-2.85c-.2-.12-.4-.1-.6.05l-4.02 4.27c-.2.2-.2.5 0 .7l4.1 4.3c.2.2.4.2.6 0l4.15-2.47z"/>
                  </svg>
                  Contact via WhatsApp
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}