"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { Product } from "@/types/product";

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  selectedColour?: string;
  personalisation?: string;
  wrapping?: boolean;
  messageCard?: string;
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  addItem: (product: Product, options?: Partial<CartItem>) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  updateItemOptions: (itemId: string, options: Partial<CartItem>) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

interface CartProviderProps {
  children: React.ReactNode;
  onItemAdded?: (productName: string) => void;
}

// Default context value for when used outside provider (should not happen in practice)
const defaultCartContext: CartContextType = {
  items: [],
  itemCount: 0,
  subtotal: 0,
  addItem: () => {},
  removeItem: () => {},
  updateQuantity: () => {},
  updateItemOptions: () => {},
  clearCart: () => {},
  isCartOpen: false,
  openCart: () => {},
  closeCart: () => {},
  toggleCart: () => {},
};

export const CartContext = createContext<CartContextType>(defaultCartContext);
const CART_STORAGE_KEY = "duggu-arts-cart";

export function CartProvider({ children, onItemAdded }: CartProviderProps) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch (error) {
      console.error("Failed to load cart from localStorage:", error);
    } finally {
      setHydrated(true);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (hydrated) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      } catch (error) {
        console.error("Failed to save cart to localStorage:", error);
      }
    }
  }, [items, hydrated]);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const addItem = useCallback((product: Product, options?: Partial<CartItem>) => {
    setItems((prev) => {
      // Check if same product with same options already exists
      const existingIndex = prev.findIndex(
        (item) =>
          item.productId === product.id &&
          item.selectedColour === (options?.selectedColour || product.colours?.[0]) &&
          item.personalisation === (options?.personalisation || "") &&
          item.wrapping === (options?.wrapping || false) &&
          item.messageCard === (options?.messageCard || "")
      );

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + (options?.quantity || 1),
        };
        return updated;
      }

      const newItem: CartItem = {
        id: `${product.id}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.imageUrl || product.galleryUrls?.[0] || "/images/placeholders/product-placeholder.svg",
        quantity: options?.quantity || 1,
        selectedColour: options?.selectedColour || product.colours?.[0],
        personalisation: options?.personalisation,
        wrapping: options?.wrapping,
        messageCard: options?.messageCard,
      };

      return [...prev, newItem];
    });
    setIsCartOpen(true);
    // Notify that an item was added (for toast notifications)
    onItemAdded?.(product.name);
  }, [onItemAdded]);

  const removeItem = useCallback((itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  }, [removeItem]);

  const updateItemOptions = useCallback((itemId: string, options: Partial<CartItem>) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, ...options } : item
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);
  const toggleCart = useCallback(() => setIsCartOpen((prev) => !prev), []);

  if (!hydrated) {
    return (
      <CartContext.Provider value={{
        items: [],
        itemCount: 0,
        subtotal: 0,
        addItem: () => {},
        removeItem: () => {},
        updateQuantity: () => {},
        updateItemOptions: () => {},
        clearCart: () => {},
        isCartOpen: false,
        openCart: () => {},
        closeCart: () => {},
        toggleCart: () => {},
      }}>
        {children}
      </CartContext.Provider>
    );
  }

  return (
    <CartContext.Provider value={{
      items,
      itemCount,
      subtotal,
      addItem,
      removeItem,
      updateQuantity,
      updateItemOptions,
      clearCart,
      isCartOpen,
      openCart,
      closeCart,
      toggleCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}