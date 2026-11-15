"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ShoppingBag, Flower2, User, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { FlowerThemeToggle, ThemeSwitcherDropdown } from "@/components/theme/ThemeSwitcher";
import { useTheme } from "@/context/ThemeContext";
import { useCart } from "@/context/CartContext";
import { CartDrawer } from "@/components/cart/CartDrawer";

type Theme = "white" | "dark" | "pink";
const THEME_ORDER: Theme[] = ["white", "dark", "pink"];

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/custom-order", label: "Custom Bouquet" },
  { href: "/reviews", label: "Reviews" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { itemCount, toggleCart } = useCart();

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

            {/* Admin Link */}
            <Link
              href="/admin"
              className="px-4 py-2 text-sm font-medium text-primary hover:text-accent transition-colors"
            >
              Admin
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="lg:hidden p-2 rounded-lg text-text hover:bg-surface transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          id="mobile-menu"
          className={cn(
            "lg:hidden overflow-hidden transition-all duration-300 ease-in-out",
            isMobileMenuOpen ? "max-h-96 opacity-100 pb-4 bg-background" : "max-h-0 opacity-0"
          )}
          role="navigation"
          aria-label="Mobile navigation"
        >
          <div className="flex flex-col gap-1 pt-4 border-t border-border">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-3 rounded-lg text-base font-medium transition-colors",
                  pathname === link.href
                    ? "bg-primary/10 text-primary"
                    : "text-text hover:bg-surface"
                )}
                aria-current={pathname === link.href ? "page" : undefined}
              >
                {link.label}
              </Link>
            ))}
            
            <div className="px-4 py-3 border-t border-border flex items-center justify-between">
              <span className="text-sm font-medium text-text">Theme</span>
              <ThemeSwitcherDropdown />
            </div>

            <div className="px-4 py-3 flex items-center gap-4">
              <button
                type="button"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-surface text-text border border-border"
              >
                <Heart className="w-5 h-5" aria-hidden="true" />
                <span>Wishlist</span>
              </button>
              <button
                type="button"
                onClick={toggleCart}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-primary text-white"
              >
                <ShoppingBag className="w-5 h-5" aria-hidden="true" />
                <span>Cart</span>
                {itemCount > 0 && (
                  <span className="w-5 h-5 flex items-center justify-center text-xs font-bold bg-primary/80 text-white rounded-full">
                    {itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>
      <CartDrawer />
    </header>
  );
}