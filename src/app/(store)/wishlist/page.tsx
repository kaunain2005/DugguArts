"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { 
  Heart, 
  ShoppingBag, 
  Plus, 
  Trash2, 
  Loader2,
  AlertCircle,
  CheckCircle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { APP_CONFIG, WHATSAPP_CONFIG } from "@/lib/constants";
import { useCart } from "@/context/CartContext";
import { CartDrawer } from "@/components/cart/CartDrawer";

interface WishlistItem {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  availableColours: string[];
  selectedColour: string;
  inStock: boolean;
  addedAt: string;
}

export default function WishlistPage() {
  const { user } = useAuth();
  const { itemCount: cartCount } = useCart();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEmptyState, setShowEmptyState] = useState(false);

  const fetchWishlist = async () => {
    if (!user?.email) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(`/api/customer/wishlist`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch wishlist");
      }
      
      const data = await response.json();
      if (data.success) {
        setWishlist(data.data.wishlist || data.data.items || []);
        setShowEmptyState(data.data.wishlist?.length === 0 || false);
      } else {
        setError(data.message || "Failed to load wishlist");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load wishlist");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [user]);

  const handleRemoveFromWishlist = async (productId: string) => {
    if (!user?.email) return;
    
    try {
      const response = await fetch(`/api/customer/wishlist`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productId }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to remove from wishlist");
      }
      
      setWishlist(prev => prev.filter(item => item.productId !== productId));
      if (wishlist.length === 1) {
        setShowEmptyState(true);
      }
    } catch (err) {
      console.error("Failed to remove from wishlist:", err);
      alert("Failed to remove item. Please try again.");
    }
  };

  const handleAddToCart = async (item: WishlistItem) => {
    // This would integrate with your cart context
    // For now, show a message
    alert(`${item.productName} added to cart! (Implement cart integration)`);
  };

  const handleMoveAllToCart = () => {
    wishlist.forEach(item => handleAddToCart(item));
  };

  const handleClearWishlist = async () => {
    if (!confirm("Are you sure you want to clear your wishlist?")) return;
    
    if (!user?.email) return;
    
    try {
      const response = await fetch(`/api/customer/wishlist/clear`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({}),
      });
      
      if (!response.ok) {
        throw new Error("Failed to clear wishlist");
      }
      
      setWishlist([]);
      setShowEmptyState(true);
    } catch (err) {
      console.error("Failed to clear wishlist:", err);
      alert("Failed to clear wishlist. Please try again.");
    }
  };

  if (!user?.email) {
    return (
      <div className="container py-16 lg:py-24">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
            <Heart className="w-10 h-10 text-primary" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-text mb-4">Sign In Required</h1>
          <p className="text-text-muted mb-6">Please sign in to view your wishlist.</p>
          <Link href="/login?callbackUrl=/wishlist">
            <Button size="lg">Sign In with Google</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 lg:py-12">
      <CartDrawer />
      
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="font-heading text-3xl font-bold text-text">My Wishlist</h1>
            <p className="text-text-muted mt-1">
              {wishlist.length} {wishlist.length === 1 ? "item" : "items"} saved for later
            </p>
          </div>
          {wishlist.length > 0 && (
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleMoveAllToCart}
                disabled={wishlist.length === 0}
              >
                <ShoppingBag className="w-4 h-4 mr-1" />
                Move All to Cart
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleClearWishlist}
                className="text-red-500 hover:text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Clear All
              </Button>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-gray-200 rounded-xl mb-3" />
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="font-heading text-xl font-semibold text-text mb-2">Unable to Load Wishlist</h2>
            <p className="text-text-muted mb-4">{error}</p>
            <Button onClick={fetchWishlist} variant="outline">Try Again</Button>
          </div>
        ) : wishlist.length === 0 || showEmptyState ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
              <Heart className="w-12 h-12 text-primary" />
            </div>
            <h2 className="font-heading text-2xl font-semibold text-text mb-2">Your Wishlist is Empty</h2>
            <p className="text-text-muted mb-6 max-w-md mx-auto">
              Save items you love for later. They'll be waiting for you when you're ready to shop.
            </p>
            <Link href="/shop">
              <Button size="lg">
                <Heart className="w-4 h-4 mr-2" />
                Start Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.map((item) => (
              <WishlistItemCard 
                key={item.id} 
                item={item} 
                onRemove={() => handleRemoveFromWishlist(item.productId)}
                onAddToCart={() => handleAddToCart(item)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface WishlistItemCardProps {
  item: WishlistItem;
  onRemove: (productId: string) => void;
  onAddToCart: (item: WishlistItem) => void;
}

function WishlistItemCard({ item, onRemove, onAddToCart }: WishlistItemCardProps) {
  const discount = item.originalPrice && item.originalPrice > item.price
    ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
    : 0;

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg flex flex-col">
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-surface">
        <img 
          src={item.imageUrl} 
          alt={item.productName}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          loading="lazy"
        />
        {item.inStock ? null : (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Badge variant="error" className="text-lg px-3 py-1">
              Out of Stock
            </Badge>
          </div>
        )}
        
        {/* Wishlist Badge */}
        <div className="absolute top-2 left-2">
          <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
            <Heart className="w-4 h-4 text-white" fill="currentColor" />
          </div>
        </div>

        {/* Remove Button */}
        <button
          type="button"
          onClick={() => onRemove(item.productId)}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 hover:bg-red-50 hover:text-red-500 text-text-muted transition-colors flex items-center justify-center shadow-sm"
          aria-label="Remove from wishlist"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Discount Badge */}
        {item.originalPrice && item.originalPrice > item.price && (
          <div className="absolute bottom-2 left-2">
            <Badge variant="default" className="text-sm">
              -{Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}%
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="flex-1 flex flex-col p-4">
        {/* Product Name */}
        <Link href={`/products/${item.productSlug}`}>
          <h3 className="font-medium text-text line-clamp-2 mb-2 hover:text-primary transition-colors">
            {item.productName}
          </h3>
        </Link>

        {/* Colour Selection */}
        {item.availableColours.length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-text-muted mb-1">Colour:</p>
            <div className="flex flex-wrap gap-1">
              {item.availableColours.map((colour) => (
                <button
                  key={colour}
                  type="button"
                  className={cn(
                    "w-6 h-6 rounded-full border-2 transition-all",
                    item.selectedColour === colour
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-border hover:border-primary/50"
                  )}
                  style={{ backgroundColor: colour }}
                  onClick={() => {}}
                  aria-label={colour}
                  disabled
                />
              ))}
            </div>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2 mb-4">
          <span className="font-bold text-lg text-text">
            ₹{item.price.toLocaleString("en-IN")}
          </span>
          {item.originalPrice && item.originalPrice > item.price && (
            <span className="text-sm text-text-muted line-through">
              ₹{item.originalPrice.toLocaleString("en-IN")}
            </span>
          )}
          {!item.inStock && (
            <Badge variant="error" className="ml-auto text-xs">
              Out of Stock
            </Badge>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-auto pt-2 border-t border-border">
          <Button
            variant={item.inStock ? "secondary" : "outline"}
            size="sm"
            className="flex-1"
            onClick={() => onAddToCart(item)}
            disabled={!item.inStock}
          >
            <ShoppingBag className="w-4 h-4 mr-1" />
            Add to Cart
          </Button>
          <Link 
            href={`/products/${item.productSlug}`} 
            className="flex-1"
          >
            <Button variant="outline" size="sm">
              View Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}