"use client";

import React, { ReactNode } from "react";
import { ThemeProvider } from "@/context/ThemeContext";
import { CartProvider } from "@/context/CartContext";
import { ToastProvider, useToast } from "@/context/ToastContext";
import { CartToastProvider, useCartToast } from "@/context/CartToastContext";
import { CartToastContainer } from "@/components/cart/CartToast";
import { AuthProvider } from "@/context/AuthContext";

function CartProviderWrapper({ children }: { children: ReactNode }) {
  const { showToast } = useToast();
  const { addToast: addCartToast } = useCartToast();
  return (
    <CartProvider
      onItemAdded={(productName) => {
        showToast("success", `${productName} added to cart`);
        addCartToast(productName);
      }}
    >
      {children}
    </CartProvider>
  );
}

function CartToastProviderWrapper({ children }: { children: ReactNode }) {
  return (
    <CartToastProvider>
      {children}
      <CartToastContainer />
    </CartToastProvider>
  );
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ToastProvider>
          <CartToastProviderWrapper>
            <CartProviderWrapper>{children}</CartProviderWrapper>
          </CartToastProviderWrapper>
        </ToastProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
