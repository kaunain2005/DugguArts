"use client";

import React from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { User, LogOut, Bell, Menu, X, ChevronDown, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface AdminHeaderProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function AdminHeader({ user }: AdminHeaderProps) {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [notificationsOpen, setNotificationsOpen] = React.useState(false);
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);

  const handleSignOut = () => {
    signOut({ callbackUrl: "/admin-login" });
  };

  return (
    <header className="admin-header sticky top-0 z-40 bg-surface/95 backdrop-blur-sm border-b border-border">
      <div className="container">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Mobile Menu Button */}
          <button
            type="button"
            className="lg:hidden p-2 rounded-lg text-text-muted hover:text-text hover:bg-surface transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-admin-menu"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Page Title */}
          <div className="flex-1 lg:hidden">
            <h1 className="font-heading text-lg font-semibold text-text">Admin</h1>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <div className="relative">
              <button
                type="button"
                className="relative p-2 rounded-lg text-text-muted hover:text-text hover:bg-surface transition-colors"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                aria-expanded={notificationsOpen}
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" aria-hidden="true" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full" aria-hidden="true" />
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-surface border border-border rounded-xl shadow-lg py-2 z-50 animate-slide-down">
                  <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                    <h3 className="font-medium text-text">Notifications</h3>
                    <Button variant="ghost" size="sm" onClick={() => setNotificationsOpen(false)}>
                      <X className="w-4 h-4" aria-hidden="true" />
                    </Button>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    <div className="px-4 py-3 text-center text-text-muted text-sm">
                      No new notifications
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                type="button"
                className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-surface transition-colors"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                aria-expanded={userMenuOpen}
                aria-label="User menu"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  {user.image ? (
                    <img src={user.image} alt="" className="w-8 h-8 rounded-full" />
                  ) : (
                    <User className="w-5 h-5 text-primary" aria-hidden="true" />
                  )}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-text">{user.name || "Admin"}</p>
                  <p className="text-xs text-text-muted">{user.email}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-text-muted" aria-hidden="true" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-surface border border-border rounded-xl shadow-lg py-2 z-50 animate-slide-down">
                  <div className="px-4 py-3 border-b border-border">
                    <p className="font-medium text-text">{user.name || "Admin"}</p>
                    <p className="text-xs text-text-muted">{user.email}</p>
                  </div>
                  <Link
                    href="/admin/settings"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-text hover:bg-surface transition-colors"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <Settings className="w-4 h-4" aria-hidden="true" />
                    Settings
                  </Link>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-error hover:bg-error/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" aria-hidden="true" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>

            {/* Mobile View Store Link */}
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary hover:text-accent transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              View Store
            </Link>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div
            id="mobile-admin-menu"
            className="lg:hidden fixed inset-0 z-50 bg-background border-t border-border animate-slide-down"
            role="navigation"
            aria-label="Mobile admin menu"
          >
            <div className="p-4 space-y-2">
              <Link
                href="/admin"
                className="block px-4 py-3 rounded-lg text-text hover:bg-surface transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <LayoutDashboard className="w-5 h-5 inline mr-3" aria-hidden="true" />
                Dashboard
              </Link>
              <Link
                href="/admin/products"
                className="block px-4 py-3 rounded-lg text-text hover:bg-surface transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Package className="w-5 h-5 inline mr-3" aria-hidden="true" />
                Products
              </Link>
              <Link
                href="/admin/orders"
                className="block px-4 py-3 rounded-lg text-text hover:bg-surface transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <ShoppingBag className="w-5 h-5 inline mr-3" aria-hidden="true" />
                Orders
              </Link>
              <Link
                href="/admin/requests"
                className="block px-4 py-3 rounded-lg text-text hover:bg-surface transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <MessageSquare className="w-5 h-5 inline mr-3" aria-hidden="true" />
                Custom Requests
              </Link>
              <Link
                href="/admin/reviews"
                className="block px-4 py-3 rounded-lg text-text hover:bg-surface transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <BarChart2 className="w-5 h-5 inline mr-3" aria-hidden="true" />
                Reviews
              </Link>
              <Link
                href="/admin/customers"
                className="block px-4 py-3 rounded-lg text-text hover:bg-surface transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Users className="w-5 h-5 inline mr-3" aria-hidden="true" />
                Customers
              </Link>
              <Link
                href="/admin/inventory"
                className="block px-4 py-3 rounded-lg text-text hover:bg-surface transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Package2 className="w-5 h-5 inline mr-3" aria-hidden="true" />
                Inventory
              </Link>
              <Link
                href="/admin/settings"
                className="block px-4 py-3 rounded-lg text-text hover:bg-surface transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Settings className="w-5 h-5 inline mr-3" aria-hidden="true" />
                Settings
              </Link>
              <hr className="border-border my-2" />
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-error hover:bg-error/10 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" aria-hidden="true" />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

// Missing imports
import { Settings, LayoutDashboard, Package, ShoppingBag, MessageSquare, Users, Package2 } from "lucide-react";