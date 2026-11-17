"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import { Menu, X, ShoppingBag, Flower2, User, Heart, LogOut, UserCog, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { FlowerThemeToggle, ThemeSwitcherDropdown } from "@/components/theme/ThemeSwitcher";
import { useTheme } from "@/context/ThemeContext";
import { useCart } from "@/context/CartContext";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { Button } from "@/components/ui/Button";

type Theme = "white" | "dark" | "pink";
const THEME_ORDER: Theme[] = ["white", "dark", "pink"];

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/custom-order", label: "Custom Orders" },
  { href: "/reviews", label: "Reviews" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { itemCount, toggleCart } = useCart();
  const { data: session, status } = useSession();
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";
  const user = session?.user;
  const isAdmin = (user as { isAdmin?: boolean } | undefined)?.isAdmin ?? false;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    setIsProfileOpen(false);
  }, [pathname]);

  // Handle escape key for mobile menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  // Focus management for mobile menu
  useEffect(() => {
    if (isMobileMenuOpen && mobileMenuRef.current) {
      // Focus the first focusable element
      const focusableElements = mobileMenuRef.current.querySelectorAll(
        'a[href], button, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements.length > 0) {
        (focusableElements[0] as HTMLElement).focus();
      }
    }
  }, [isMobileMenuOpen]);

  const handleSignIn = () => {
    signIn("google", { callbackUrl: isAdmin ? "/admin/dashboard" : "/" });
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
    setIsProfileOpen(false);
  };

  const getInitials = (name?: string | null, email?: string | null) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return "U";
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-background/95 backdrop-blur-sm border-b border-border shadow-sm"
          : "bg-transparent"
      )}
    >
      <nav className="container" aria-label="Main navigation">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-heading font-bold text-text hover:opacity-80 transition-opacity"
            aria-label="Duggu Arts - Home"
          >
            <Flower2 className="w-7 h-7 text-primary" aria-hidden="true" />
            <span className="hidden sm:block">Duggu Arts</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors relative py-2",
                  pathname === link.href
                    ? "text-primary"
                    : "text-text-muted hover:text-text"
                )}
                aria-current={pathname === link.href ? "page" : undefined}
              >
                {link.label}
                {pathname === link.href && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full" aria-hidden="true" />
                )}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-4">
            <FlowerThemeToggle size="md" />

            {/* Wishlist */}
            <button
              type="button"
              className="relative p-2 rounded-lg text-text-muted hover:text-text hover:bg-surface transition-colors"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" aria-hidden="true" />
            </button>

            {/* Cart */}
            <button
              type="button"
              onClick={toggleCart}
              className="relative p-2 rounded-lg text-text-muted hover:text-text hover:bg-surface transition-colors"
              aria-label={`Shopping cart${itemCount > 0 ? ` with ${itemCount} items` : ""}`}
            >
              <ShoppingBag className="w-5 h-5" aria-hidden="true" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center text-xs font-bold text-white bg-primary rounded-full">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </button>

            {/* Auth / Profile */}
            {isLoading ? (
              <div className="w-10 h-10 rounded-full bg-surface animate-pulse" aria-hidden="true" />
            ) : isAuthenticated ? (
              <div className="relative" onClick={() => setIsProfileOpen(!isProfileOpen)}>
                <button
                  type="button"
                  className="flex items-center gap-2 p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-surface transition-colors"
                  aria-label="User menu"
                  aria-expanded={isProfileOpen}
                  aria-haspopup="true"
                >
                  <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 text-primary font-medium text-sm">
                    {getInitials(user?.name, user?.email)}
                  </div>
                  <ChevronDown className={cn("w-4 h-4 text-text-muted transition-transform", isProfileOpen && "rotate-180")} />
                </button>

                {/* Profile Dropdown */}
                {isProfileOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsProfileOpen(false)}
                      aria-hidden="true"
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-surface border border-border rounded-xl shadow-lg overflow-hidden z-50 animate-slide-down">
                      <div className="p-3 border-b border-border">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                            {getInitials(user?.name, user?.email)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-text truncate">{user?.name || "User"}</p>
                            <p className="text-xs text-text-muted truncate">{user?.email}</p>
                          </div>
                          {isAdmin && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full">
                              Admin
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <nav className="p-1">
                        <Link
                          href={isAdmin ? "/admin/dashboard" : "/account"}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-text hover:bg-surface transition-colors"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <UserCog className="w-4 h-4" aria-hidden="true" />
                          <span>{isAdmin ? "Admin Dashboard" : "My Account"}</span>
                        </Link>
                        <Link
                          href="/orders"
                          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-text hover:bg-surface transition-colors"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a2 2 0 00-2-2H6a2 2 0 00-2 2v7a2 2 0 002 2h8a2 2 0 002-2v-4" />
                          </svg>
                          <span>My Orders</span>
                        </Link>
                        <Link
                          href="/wishlist"
                          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-text hover:bg-surface transition-colors"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <Heart className="w-4 h-4" aria-hidden="true" />
                          <span>Wishlist</span>
                        </Link>
                        <hr className="my-1 border-border" />
                        <button
                          type="button"
                          onClick={handleSignOut}
                          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-500/10 transition-colors"
                        >
                          <LogOut className="w-4 h-4" aria-hidden="true" />
                          <span>Sign Out</span>
                        </button>
                      </nav>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignIn}
                className="gap-2"
              >
                <User className="w-4 h-4" aria-hidden="true" />
                <span className="hidden sm:inline">Sign In</span>
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="lg:hidden p-2 rounded-lg text-text hover:bg-surface transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu-overlay"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm animate-fade-in lg:hidden"
            onClick={closeMobileMenu}
            aria-hidden="true"
          />
          <div
            ref={mobileMenuRef}
            id="mobile-menu-overlay"
            className="fixed inset-0 z-50 lg:hidden flex flex-col animate-slide-in-right bg-background"
            role="navigation"
            aria-label="Mobile navigation"
          >
            {/* Mobile Menu Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <Link
                href="/"
                className="flex items-center gap-2 text-xl font-heading font-bold text-text"
                aria-label="Duggu Arts - Home"
                onClick={closeMobileMenu}
              >
                <Flower2 className="w-7 h-7 text-primary" aria-hidden="true" />
                <span>Duggu Arts</span>
              </Link>
              <button
                type="button"
                className="p-2 rounded-lg text-text hover:bg-surface transition-colors"
                onClick={closeMobileMenu}
                aria-label="Close menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-2">
              <ul className="space-y-1" role="list">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={cn(
                        "flex items-center gap-3 px-4 py-4 rounded-xl text-lg font-medium transition-all duration-200",
                        pathname === link.href
                          ? "bg-primary/10 text-primary"
                          : "text-text hover:bg-surface"
                      )}
                      aria-current={pathname === link.href ? "page" : undefined}
                      onClick={closeMobileMenu}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>

              {/* Divider */}
              <hr className="my-4 border-border" />

              {/* Mobile Profile/Auth */}
              <div className="space-y-3">
                {isLoading ? (
                  <div className="h-20 bg-surface animate-pulse rounded-xl" />
                ) : isAuthenticated ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-4 bg-surface rounded-xl">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-lg">
                        {getInitials(user?.name, user?.email)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-text truncate">{user?.name || "User"}</p>
                        <p className="text-xs text-text-muted truncate">{user?.email}</p>
                      </div>
                      {isAdmin && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full">
                          Admin
                        </span>
                      )}
                    </div>
                    <Link
                      href={isAdmin ? "/admin/dashboard" : "/account"}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-base text-text hover:bg-surface transition-colors"
                      onClick={closeMobileMenu}
                    >
                      <UserCog className="w-5 h-5" aria-hidden="true" />
                      <span>{isAdmin ? "Admin Dashboard" : "My Account"}</span>
                    </Link>
                    <Link
                      href="/orders"
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-base text-text hover:bg-surface transition-colors"
                      onClick={closeMobileMenu}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a2 2 0 00-2-2H6a2 2 0 00-2 2v7a2 2 0 002 2h8a2 2 0 002-2v-4" />
                      </svg>
                      <span>My Orders</span>
                    </Link>
                    <Link
                      href="/wishlist"
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-base text-text hover:bg-surface transition-colors"
                      onClick={closeMobileMenu}
                    >
                      <Heart className="w-5 h-5" aria-hidden="true" />
                      <span>Wishlist</span>
                    </Link>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-base text-red-500 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut className="w-5 h-5" aria-hidden="true" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                ) : (
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full py-4"
                    onClick={handleSignIn}
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" aria-hidden="true">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 1 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    <span>Sign In with Google</span>
                  </Button>
                )}
              </div>

              {/* Theme Selector in Mobile Menu */}
              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-base font-medium text-text">Theme</span>
                  <ThemeSwitcherDropdown />
                </div>
              </div>

              {/* Mobile Actions - Wishlist & Cart */}
              <div className="p-4 space-y-3 border-t border-border">
                <button
                  type="button"
                  className="flex items-center justify-center gap-3 w-full px-4 py-4 rounded-xl bg-surface text-text border border-border"
                  onClick={closeMobileMenu}
                >
                  <Heart className="w-6 h-6" aria-hidden="true" />
                  <span>Wishlist</span>
                </button>
                <button
                  type="button"
                  onClick={() => { toggleCart(); closeMobileMenu(); }}
                  className="flex items-center justify-center gap-3 w-full px-4 py-4 rounded-xl bg-primary text-white"
                >
                  <ShoppingBag className="w-6 h-6" aria-hidden="true" />
                  <span>Cart</span>
                  {itemCount > 0 && (
                    <span className="w-6 h-6 flex items-center justify-center text-sm font-bold bg-primary/80 text-white rounded-full">
                      {itemCount > 99 ? "99+" : itemCount}
                    </span>
                  )}
                </button>
              </div>
            </nav>
          </div>
        </>
      )}

      <CartDrawer />
    </header>
  );
}