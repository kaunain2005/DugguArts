import React, { useRef, useEffect } from "react";
import Link from "next/link";
import { Heart, ShoppingBag, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { Product } from "@/types/product";
import { gsap } from "gsap";
import { useHoverAnimation, useEntranceAnimation, useTapAnimation } from "@/hooks/useGSAP";

interface ProductCardProps {
  product: Product;
  variant?: "default" | "compact" | "featured";
  showAddToCart?: boolean;
  onAddToCart?: (product: Product) => void;
  className?: string;
  style?: React.CSSProperties;
}

export function ProductCard({
  product,
  variant = "default",
  showAddToCart = true,
  onAddToCart,
  className,
  style,
}: ProductCardProps) {
  const cardRef = useRef<HTMLElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const quickAddRef = useRef<HTMLButtonElement | null>(null);
  const wishlistRef = useRef<HTMLButtonElement | null>(null);
  const addToCartRef = useRef<HTMLButtonElement | null>(null);
  
  const isFeatured = product.featured || variant === "featured";
  const primaryImage = product.imageUrl || product.galleryUrls?.[0] || "/images/placeholders/product-placeholder.svg";

  // GSAP Animations
  useEntranceAnimation(cardRef, { opacity: 0, y: 30 }, 0.6, 0.1);
  useHoverAnimation(cardRef, { y: -8, scale: 1.02 }, 0.3);
  useTapAnimation(cardRef);
  useHoverAnimation(imageRef, { scale: 1.05 }, 0.4);
  useHoverAnimation(quickAddRef, { scale: 1.05, y: -2 }, 0.2);
  useHoverAnimation(wishlistRef, { scale: 1.15, rotation: 10 }, 0.3);
  useHoverAnimation(addToCartRef, { scale: 1.05 }, 0.2);
  useTapAnimation(quickAddRef);
  useTapAnimation(wishlistRef);
  useTapAnimation(addToCartRef);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product);
    }
  };

  return (
    <article
      ref={cardRef}
      className={cn(
        "bg-surface border border-border rounded-xl overflow-hidden",
        "group",
        className
      )}
      style={style}
    >
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-surface-elevated">
        <Link
          href={`/products/${product.slug}`}
          className="block aspect-square overflow-hidden"
          aria-label={`View ${product.name}`}
        >
          <img
            ref={imageRef}
            src={primaryImage}
            alt={`${product.name} - handmade pipe cleaner flower`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {isFeatured && (
            <Badge variant="primary" className="text-xs">
              Featured
            </Badge>
          )}
          {product.stockStatus === "low_stock" && (
            <Badge variant="warning" className="text-xs">
              Low Stock
            </Badge>
          )}
          {product.stockStatus === "out_of_stock" && (
            <Badge variant="error" className="text-xs">
              Out of Stock
            </Badge>
          )}
          {product.stockStatus === "made_to_order" && (
            <Badge variant="outline" className="text-xs">
              Made to Order
            </Badge>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          ref={wishlistRef}
          type="button"
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center text-text-muted hover:text-error hover:border-error transition-colors opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Add to wishlist"
        >
          <Heart className="w-4 h-4" aria-hidden="true" />
        </button>

        {/* Quick Add to Cart */}
        {showAddToCart && product.stockStatus !== "out_of_stock" && (
          <button
            ref={quickAddRef}
            type="button"
            onClick={handleAddToCart}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 w-full max-w-[200px] px-4 py-2 bg-primary text-white rounded-lg font-medium text-sm opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:bg-accent shadow-lg"
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingBag className="w-4 h-4 mr-2 inline-block" aria-hidden="true" />
            Add to Cart
          </button>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Category */}
        <div className="flex items-center gap-2 mb-2">
          <Tag className="w-3 h-3 text-text-muted" aria-hidden="true" />
          <span className="text-xs text-text-muted uppercase tracking-wide">
            {product.categoryName || "Flowers"}
          </span>
        </div>

        {/* Name */}
        <Link href={`/products/${product.slug}`} className="block">
          <h3 className="font-heading font-semibold text-text mb-2 line-clamp-1 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Colours */}
        {product.colours && product.colours.length > 0 && (
          <div className="flex items-center gap-1.5 mb-3" aria-label="Available colours">
            {product.colours.slice(0, 5).map((colour, index) => (
              <span
                key={colour}
                className="w-5 h-5 rounded-full border border-border flex-shrink-0"
                style={{ backgroundColor: colour.toLowerCase() }}
                title={colour}
                aria-label={`Colour: ${colour}`}
              />
            ))}
            {product.colours.length > 5 && (
              <span className="w-5 h-5 rounded-full border border-border bg-surface flex items-center justify-center text-xs text-text-muted flex-shrink-0">
                +{product.colours.length - 5}
              </span>
            )}
          </div>
        )}

        {/* Price & Action */}
        <div className="flex items-center justify-between">
          <div>
            <span className="font-heading text-xl font-bold text-text">
              {formatPrice(product.price)}
            </span>
            {product.stockStatus === "made_to_order" && (
              <span className="ml-2 text-xs text-text-muted">(Made to Order)</span>
            )}
          </div>

          {showAddToCart && product.stockStatus !== "out_of_stock" && onAddToCart && (
            <Button
              ref={addToCartRef}
              size="sm"
              variant="outline"
              onClick={handleAddToCart}
              className="h-9 px-3"
              aria-label={`Add ${product.name} to cart`}
            >
              <ShoppingBag className="w-4 h-4" aria-hidden="true" />
            </Button>
          )}

          {product.stockStatus === "out_of_stock" && (
            <Badge variant="error" className="text-xs">
              Out of Stock
            </Badge>
          )}
        </div>
      </div>
    </article>
  );
}

export function ProductCardSkeleton({ variant = "default" }: { variant?: "default" | "compact" }) {
  return (
    <article className="bg-surface border border-border rounded-xl overflow-hidden animate-pulse">
      <div className="aspect-square bg-border" />
      <div className="p-4 space-y-3">
        <div className="h-3 w-1/4 bg-border rounded" />
        <div className="h-5 w-3/4 bg-border rounded" />
        <div className="h-4 w-1/2 bg-border rounded" />
        <div className="flex items-center justify-between">
          <div className="h-6 w-24 bg-border rounded" />
          <div className="h-9 w-9 bg-border rounded-lg" />
        </div>
      </div>
    </article>
  );
}