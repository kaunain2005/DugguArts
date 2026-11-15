"use client";

import React, { ReactNode } from "react";
import { ThemeProvider } from "@/context/ThemeContext";
import { CartProvider } from "@/context/CartContext";
import { ToastProvider, useToast } from "@/context/ToastContext";

function CartProviderWrapper({ children }: { children: ReactNode }) {
  const { showToast } = useToast();
  return (
    <CartProvider onItemAdded={(productName) => showToast("success", `${productName} added to cart`)}>
      {children}
    </CartProvider>
  );
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <CartProviderWrapper>
          {children}
        </CartProviderWrapper>
      </ToastProvider>
    </ThemeProvider>
  );
}