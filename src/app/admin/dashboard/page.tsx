import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { appsScriptService, AdminOrdersResponse, AdminCustomRequest, AdminInventoryMaterial } from "@/services/apps-script.server";
import { StatCard } from "@/components/admin/StatCard";
import { RecentActivity } from "@/components/admin/RecentActivity";
import { LowStockAlert } from "@/components/admin/LowStockAlert";
import { cn } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  // Fetch dashboard data
  const [products, orders, requests, reviews, inventory, customers] = await Promise.all([
    appsScriptService.listProducts({ pageSize: 1, active: true }),
    appsScriptService.adminRequest<{ items: any[]; total: number }>('orders.list', { pageSize: 10 }),
    appsScriptService.adminRequest<{ items: any[]; total: number }>('requests.list', { pageSize: 10 }),
    appsScriptService.listReviews({ approvedOnly: true, pageSize: 1 }),
    appsScriptService.adminRequest<{ items: any[]; total: number }>('inventory.list', { lowStockOnly: true, pageSize: 5 }),
    appsScriptService.adminRequest<{ items: any[]; total: number }>('customers.list', { pageSize: 1 }),
  ]);

  const stats = {
    totalProducts: products.total,
    activeProducts: products.total,
    totalOrders: orders.total || 0,
    newEnquiries: orders.items?.filter((o: any) => o.orderStatus === 'new').length || 0,
    pendingRequests: requests.items?.filter((r: any) => r.requestStatus === 'pending').length || 0,
    pendingReviews: reviews.total || 0,
    lowStockMaterials: inventory.items?.length || 0,
    totalCustomers: customers.total || 0,
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl lg:text-3xl font-bold text-text">Dashboard</h1>
          <p className="text-text-muted mt-1">Welcome back! Here's an overview of your store.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          icon="Package"
          trend={{ value: 5, label: "this month" }}
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon="ShoppingBag"
          trend={{ value: 12, label: "this week" }}
          variant="primary"
        />
        <StatCard
          title="New Enquiries"
          value={stats.newEnquiries}
          icon="MessageSquare"
          variant="warning"
        />
        <StatCard
          title="Pending Requests"
          value={stats.pendingRequests}
          icon="MessageSquare"
          variant="info"
        />
        <StatCard
          title="Pending Reviews"
          value={stats.pendingReviews}
          icon="Star"
          variant="secondary"
        />
        <StatCard
          title="Low Stock Materials"
          value={stats.lowStockMaterials}
          icon="AlertTriangle"
          variant="error"
        />
        <StatCard
          title="Total Customers"
          value={stats.totalCustomers}
          icon="Users"
          trend={{ value: 8, label: "this month" }}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Recent Activity & Low Stock */}
        <div className="lg:col-span-2 space-y-8">
          <RecentActivity activities={orders.items || []} />
          <LowStockAlert materials={inventory.items || []} />
        </div>

        {/* Right Column - Quick Actions */}
        <div className="space-y-6">
          <div className="bg-surface border border-border rounded-xl p-6">
            <h2 className="font-heading text-lg font-semibold text-text mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <a href="/admin/products/new" className="p-4 rounded-lg border border-border hover:bg-surface hover:border-primary transition-colors text-center">
                <span className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
                </span>
                <p className="font-medium text-text">Add Product</p>
              </a>
              <a href="/admin/orders" className="p-4 rounded-lg border border-border hover:bg-surface hover:border-primary transition-colors text-center">
                <span className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
                </span>
                <p className="font-medium text-text">View Orders</p>
              </a>
              <a href="/admin/requests" className="p-4 rounded-lg border border-border hover:bg-surface hover:border-primary transition-colors text-center">
                <span className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                </span>
                <p className="font-medium text-text">Custom Requests</p>
              </a>
              <a href="/admin/products/new" className="p-4 rounded-lg border border-border hover:bg-surface hover:border-primary transition-colors text-center">
                <span className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
                </span>
                <p className="font-medium text-text">Manage Inventory</p>
              </a>
            </div>
          </div>

          {/* Recent Customers */}
          <div className="bg-surface border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-lg font-semibold text-text">Recent Customers</h2>
              <a href="/admin/customers" className="text-sm text-primary hover:text-accent">View All</a>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-surface-elevated rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-medium">P</span>
                  </div>
                  <div>
                    <p className="font-medium text-text">Priya Sharma</p>
                    <p className="text-xs text-text-muted">priya@example.com</p>
                  </div>
                </div>
                <span className="text-sm text-text-muted">2 orders</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-surface-elevated rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-medium">A</span>
                  </div>
                  <div>
                    <p className="font-medium text-text">Arjun Patel</p>
                    <p className="text-xs text-text-muted">arjun@example.com</p>
                  </div>
                </div>
                <span className="text-sm text-text-muted">1 order</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-surface-elevated rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-medium">S</span>
                  </div>
                  <div>
                    <p className="font-medium text-text">Sneha Reddy</p>
                    <p className="text-xs text-text-muted">sneha@example.com</p>
                  </div>
                </div>
                <span className="text-sm text-text-muted">3 orders</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Missing imports for icons
function Star({ className }: { className?: string }) {
  return <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>;
}
function AlertTriangle({ className }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>;
}