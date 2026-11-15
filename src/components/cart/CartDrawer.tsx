"use client";

import React, { useEffect } from "react";
import { X, Trash2, Minus, Plus, ShoppingBag, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn, formatPrice } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import type { CartItem } from "@/context/CartContext";

export function CartDrawer() {
  const { items, itemCount, subtotal, updateQuantity, removeItem, clearCart, isCartOpen, closeCart } = useCart();

  // Prevent body scroll when cart is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  const itemTotal = (item: CartItem) => item.price * item.quantity;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-55 animate-fade-in"
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className="fixed right-0 top-0 bottom-0 w-full max-w-sm md:max-w-md lg:max-w-lg z-60 bg-surface border-l border-border flex flex-col animate-slide-in-right"
        role="dialog"
        aria-label="Shopping cart"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={closeCart}
              className="p-2 rounded-lg text-text-muted hover:text-text hover:bg-surface transition-colors"
              aria-label="Close cart"
            >
              <ArrowLeft className="w-5 h-5" aria-hidden="true" />
            </button>
            <h2 className="font-heading text-xl font-bold text-text">Shopping Cart</h2>
          </div>
          {itemCount > 0 && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary text-white">
              {itemCount} item{itemCount !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center">
              <ShoppingBag className="w-16 h-16 text-border mb-4" aria-hidden="true" />
              <h3 className="font-heading text-lg font-semibold text-text mb-2">Your cart is empty</h3>
              <p className="text-text-muted mb-6">Looks like you haven't added any flowers yet.</p>
              <Button onClick={closeCart} className="w-full max-w-xs">
                Continue Shopping
              </Button>
            </div>
          ) : (
            <>
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 p-3 bg-surface-elevated rounded-xl border border-border"
                >
                  {/* Product Image */}
                  <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-surface">
                    <img
                      src={item.image}
                      alt={`${item.name} - ${item.selectedColour || "default"}`}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-text truncate">{item.name}</h4>
                    {item.selectedColour && (
                      <p className="text-sm text-text-muted">Colour: {item.selectedColour}</p>
                    )}
                    {item.personalisation && (
                      <p className="text-sm text-text-muted">Personalisation: {item.personalisation}</p>
                    )}
                    {item.wrapping && (
                      <p className="text-sm text-text-muted">Gift Wrapping: Yes</p>
                    )}
                    {item.messageCard && (
                      <p className="text-sm text-text-muted">Message Card: Included</p>
                    )}

                    <div className="flex items-center justify-between mt-2">
                      <span className="font-heading text-lg font-bold text-text">
                        {formatPrice(itemTotal(item))}
                      </span>

                      {/* Quantity Selector */}
                      <div className="flex items-center border border-border rounded-lg overflow-hidden">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="p-2 text-text-muted hover:text-text hover:bg-surface transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-4 h-4" aria-hidden="true" />
                        </button>
                        <span className="w-10 text-center font-medium text-text">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= 50}
                          className="p-2 text-text-muted hover:text-text hover:bg-surface transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-4 h-4" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="p-2 text-text-muted hover:text-error hover:bg-error/10 rounded-lg transition-colors flex-shrink-0"
                    aria-label={`Remove ${item.name} from cart`}
                  >
                    <Trash2 className="w-5 h-5" aria-hidden="true" />
                  </button>
                </div>
              ))}

              {/* Cart Summary in Drawer */}
              <div className="border-t border-border pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Subtotal</span>
                  <span className="text-text font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Estimated Packaging</span>
                  <span className="text-text font-medium">{formatPrice(50)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Estimated Delivery</span>
                  <span className="text-text font-medium">{formatPrice(subtotal >= 999 ? 0 : 100)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t border-border pt-3">
                  <span className="text-text">Estimated Total</span>
                  <span className="text-text">
                    {formatPrice(subtotal + 50 + (subtotal >= 999 ? 0 : 100))}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-border space-y-3">
          {items.length > 0 && (
            <>
              <Button variant="outline" className="w-full" onClick={closeCart}>
                <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
                Continue Shopping
              </Button>
              <Button size="lg" className="w-full" asChild>
                <a href="/checkout">Proceed to Checkout</a>
              </Button>
              {items.length > 1 && (
                <Button variant="ghost" className="w-full text-error" onClick={clearCart}>
                  Clear Cart ({items.length} items)
                </Button>
              )}
            </>
          )}
        </div>
      </aside>
    </>
  );
}