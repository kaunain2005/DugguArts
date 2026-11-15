"use client";

import React, { useContext } from "react";
import Link from "next/link";
import { ProductCard } from "@/components/products/ProductCard";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";
import { CartContext } from "@/context/CartContext";

interface FeaturedProductsSectionProps {
  products?: Product[];
  title?: string;
  description?: string;
  showViewAll?: boolean;
  viewAllHref?: string;
  className?: string;
}

const defaultProducts: Product[] = [
  {
    id: "1",
    productId: "PROD_1",
    name: "Classic Red Rose",
    slug: "classic-red-rose",
    categoryId: "roses",
    categoryName: "Roses",
    description: "A timeless symbol of love and passion, handcrafted with premium pipe cleaners.",
    price: 299,
    imageUrl: "/images/products/red-rose.svg",
    galleryUrls: ["/images/products/red-rose.svg"],
    colours: ["Red", "Deep Red", "Burgundy"],
    stockStatus: "in_stock",
    featured: true,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    productId: "PROD_2",
    name: "Pink Tulip Bunch",
    slug: "pink-tulip-bunch",
    categoryId: "tulips",
    categoryName: "Tulips",
    description: "Elegant pink tulips that bring spring to your home all year round.",
    price: 399,
    imageUrl: "/images/products/pink-tulips.svg",
    galleryUrls: ["/images/products/pink-tulips.svg"],
    colours: ["Pink", "Light Pink", "White"],
    stockStatus: "in_stock",
    featured: false,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    productId: "PROD_3",
    name: "Sunshine Daisy",
    slug: "sunshine-daisy",
    categoryId: "daisies",
    categoryName: "Daisies",
    description: "Bright and cheerful daisies to brighten any room.",
    price: 199,
    imageUrl: "/images/products/yellow-daisy.svg",
    galleryUrls: ["/images/products/yellow-daisy.svg"],
    colours: ["Yellow", "White", "Orange"],
    stockStatus: "in_stock",
    featured: false,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "4",
    productId: "PROD_4",
    name: "Romantic Mixed Bouquet",
    slug: "romantic-mixed-bouquet",
    categoryId: "bouquets",
    categoryName: "Bouquets",
    description: "A stunning arrangement of roses, tulips, and daisies in harmonious colours.",
    price: 1299,
    imageUrl: "/images/products/romantic-bouquet.svg",
    galleryUrls: ["/images/products/romantic-bouquet.svg"],
    colours: ["Mixed"],
    stockStatus: "in_stock",
    featured: true,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function FeaturedProductsSection({
  products = [],
  title = "Featured Products",
  description = "Our handpicked favorites, loved by customers",
  showViewAll = true,
  viewAllHref = "/shop",
  className,
}: FeaturedProductsSectionProps) {
  const displayProducts = products.length > 0 ? products : defaultProducts;
  const { addItem } = useContext(CartContext);

  const handleAddToCart = (product: Product) => {
    addItem(product);
  };

  return (
    <section className={cn("section bg-surface/50", className)} aria-labelledby="featured-heading">
      <div className="container">
        <header className="section-heading">
          <h2 id="featured-heading" className="animate-slide-up">
            {title}
          </h2>
          <p className="animate-slide-up" style={{ animationDelay: "100ms" }}>
            {description}
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayProducts.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              variant="default"
              showAddToCart={true}
              onAddToCart={handleAddToCart}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 100 + 100}ms` }}
            />
          ))}
        </div>

        {showViewAll && (
          <div className="mt-10 text-center animate-fade-in">
            <Button variant="outline" size="lg" asChild>
              <Link href={viewAllHref}>View All Products</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}