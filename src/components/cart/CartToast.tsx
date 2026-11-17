"use client";

import React, { useState, useEffect } from "react";
import { useCartToast } from "@/context/CartToastContext";

interface CartToastProps {
  productName?: string;
  onViewCart: () => void;
  onClose: () => void;
  duration?: number;
}

export function CartToast(props: CartToastProps) {
  const { productName = "Item", onViewCart, onClose, duration = 3500 } = props;
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        setIsVisible(false);
        setIsExiting(false);
      }, 300);
    }, props.duration || 3500);

    return () => clearTimeout(props.duration);
  }, [props.duration]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed bottom-4 right-4 z-[600] w-full max-w-sm sm:max-w-md ${isExiting ? "animate-fade-out animate-slide-down" : "animate-slide-up"} transition-all duration-300 ease-out pointer-events-auto`}
      role="alert"
      aria-live="polite"
    >
      <div
        className={`group relative w-full rounded-xl border border-border bg-surface shadow-xl p-4 flex items-start gap-3 backdrop-blur-sm bg-background/95 transition-all duration-300 ease-out ${isExiting ? "animate-fade-out animate-slide-down" : "animate-slide-up"}`}
        role="alert"
        aria-live="polite"
      >
        <div className="flex-shrink-0 mt-0.5 w-10 h-10 flex-shrink-0 rounded-lg bg-primary/10 flex items-center justify-center">
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a2 2 0 00-2-2H6a2 2 0 00-2 2v7a2 2 0 002 2h8a2 2 0 002-2v-4" />
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-medium text-text text-sm">
            <span className="font-semibold text-text">{props.productName || "Item"}</span>{" "}
            <span className="text-text-muted">added to cart</span>
          </p>
          <p className="text-xs text-text-muted mt-0.5">
            Your cart has been updated.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0 ml-4">
          <button
            type="button"
            onClick={() => {
              props.onViewCart();
              setIsVisible(false);
            }}
            className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            View Cart
          </button>
          <button
            type="button"
            onClick={() => {
              setIsExiting(true);
              setTimeout(() => setIsVisible(false), 300);
            }}
            className="p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-surface transition-colors"
            aria-label="Dismiss"
          >
            <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

interface CartToastProps {
  productName?: string;
  onViewCart: () => void;
  onClose: () => void;
  duration?: number;
}

export function CartToastContainer() {
  const { toasts, removeToast } = useCartToast();

  const toastElements = toasts.map((toast) => (
    <CartToast
      key={toast.id}
      productName={toast.productName}
      onViewCart={() => removeToast(toast.id)}
      onClose={() => removeToast(toast.id)}
    />
  ));

  return (
    <div className="fixed bottom-4 right-4 z-[600] w-full max-w-sm sm:max-w-md pointer-events-none">
      {toastElements}
    </div>
  );
}

export function CartToastPlaceholder() {
  return null;
}