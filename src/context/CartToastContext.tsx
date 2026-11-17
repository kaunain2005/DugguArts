"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

interface CartToast {
  id: string;
  productName: string;
}

interface CartToastContextType {
  toasts: CartToast[];
  addToast: (productName: string) => void;
  removeToast: (id: string) => void;
}

const CartToastContext = createContext<CartToastContextType | undefined>(undefined);

export function CartToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<CartToast[]>([]);

  const addToast = useCallback((productName: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    setToasts((prev) => [...prev, { id, productName }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <CartToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
    </CartToastContext.Provider>
  );
}

export function useCartToast() {
  const context = useContext(CartToastContext);
  if (context === undefined) {
    throw new Error("useCartToast must be used within a CartToastProvider");
  }
  return context;
}