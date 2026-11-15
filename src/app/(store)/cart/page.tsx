"use client";

import React from "react";
import { Trash2, Minus, Plus, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn, formatPrice } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import type { CartItem } from "@/context/CartContext";

export default function CartPage() {
  const { items, itemCount, subtotal, updateQuantity, removeItem, clearCart } = useCart();

  const itemTotal = (item: CartItem) => item.price * item.quantity;
  const packagingCharge = items.length > 0 ? 50 : 0;
  const deliveryCharge = items.length > 0 && subtotal < 999 ? 100 : 0;
  const total = subtotal + packagingCharge + deliveryCharge;

  if (items.length === 0) {
    return (
      <div className="container py-16 lg:py-24">
        <div className="max-w-md mx-auto text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-surface border border-border rounded-2xl flex items-center justify-center">
            <svg className="w-10 h-10 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h1 className="font-heading text-3xl font-bold text-text mb-4">Your Cart is Empty</h1>
          <p className="text-text-muted mb-8">Looks like you haven't added any flowers yet.</p>
          <Button asChild className="w-full sm:w-auto">
            <a href="/shop">Start Shopping</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 lg:py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold text-text">Shopping Cart</h1>
          <p className="text-text-muted mt-1">
            {itemCount} {itemCount === 1 ? "item" : "items"} in your cart
          </p>
        </div>
        {items.length > 1 && (
          <Button variant="ghost" className="text-error" onClick={clearCart}>
            <Trash2 className="w-4 h-4 mr-2" aria-hidden="true" />
            Clear Cart
          </Button>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {/* Product Image */}
                  <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-surface">
                    <img
                      src={item.image}
                      alt={`${item.name} - ${item.selectedColour || "default"}`}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-heading font-semibold text-text">{item.name}</h3>
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-text-muted">
                          {item.selectedColour && (
                            <span className="flex items-center gap-1">
                              <span className="w-3 h-3 rounded-full border" style={{ backgroundColor: item.selectedColour!.toLowerCase() }} />
                              {item.selectedColour}
                            </span>
                          )}
                          {item.personalisation && (
                            <span>Personalised</span>
                          )}
                          {item.wrapping && (
                            <Badge variant="outline" className="text-xs">Gift Wrapped</Badge>
                          )}
                          {item.messageCard && (
                            <Badge variant="outline" className="text-xs">Message Card</Badge>
                          )}
                        </div>
                      </div>

                      {/* Price & Quantity */}
                      <div className="flex flex-col items-end gap-3 flex-shrink-0">
                        <span className="font-heading text-xl font-bold text-text">
                          {formatPrice(itemTotal(item))}
                        </span>

                        <div className="flex items-center border border-border rounded-lg overflow-hidden">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="px-3 py-2 text-text-muted hover:text-text hover:bg-surface transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-4 h-4" aria-hidden="true" />
                          </button>
                          <span className="px-4 py-2 font-medium text-text border-x border-border min-w-[3rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= 50}
                            className="px-3 py-2 text-text-muted hover:text-text hover:bg-surface transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-4 h-4" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <div className="mt-4 pt-4 border-t border-border flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="flex items-center gap-1 text-sm text-text-muted hover:text-error transition-colors"
                      >
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardContent className="p-6 space-y-4">
              <h2 className="font-heading text-xl font-bold text-text">Order Summary</h2>

              <div className="space-y-3 border-t border-border pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Subtotal</span>
                  <span className="text-text font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Packaging</span>
                  <span className="text-text font-medium">{formatPrice(packagingCharge)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Delivery</span>
                  <span className="text-text font-medium">
                    {subtotal >= 999 ? (
                      <>
                        <span className="text-success">Free</span>
                        <span className="text-xs text-text-muted ml-1">(₹999+)</span>
                      </>
                    ) : (
                      formatPrice(deliveryCharge)
                    )}
                  </span>
                </div>
                {subtotal < 999 && subtotal > 0 && (
                  <p className="text-xs text-primary bg-primary/10 px-3 py-2 rounded-lg">
                    Add ₹{999 - subtotal} more for free delivery!
                  </p>
                )}
              </div>

              <div className="border-t border-border pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-text">Total</span>
                  <span className="text-text">{formatPrice(total)}</span>
                </div>
                <p className="text-xs text-text-muted mt-1">Tax included. Shipping calculated at checkout.</p>
              </div>

              <Button size="lg" className="w-full" asChild>
                <a href="/checkout">Proceed to Checkout</a>
              </Button>

              <Button variant="outline" className="w-full" onClick={() => window.history.back()}>
                <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
                Continue Shopping
              </Button>

              {/* Trust Indicators */}
              <div className="border-t border-border pt-4 space-y-3">
                <div className="flex items-center gap-3 text-sm text-text-muted">
                  <svg className="w-5 h-5 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  <span>Secure Checkout</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-text-muted">
                  <svg className="w-5 h-5 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                  <span>Quality Guaranteed</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-text-muted">
                  <svg className="w-5 h-5 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                  <span>7-Day Returns</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}