"use client";

import React from "react";
import Link from "next/link";
import { ProductCard } from "@/components/products/ProductCard";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";
import { useCart } from "@/context/CartContext";

interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  products: Product[];
}

interface CuratedCollectionsSectionProps {
  collections?: Collection[];
  title?: string;
  description?: string;
  className?: string;
}

const defaultCollections: Collection[] = [
  {
    id: "romantic",
    name: "Romantic Collection",
    slug: "romantic",
    description: "Soft pinks and reds for expressing love",
    imageUrl: "/images/collections/romantic.svg",
    products: [
      {
        id: "1",
        productId: "PROD_1",
        name: "Classic Red Rose",
        slug: "classic-red-rose",
        categoryId: "roses",
        categoryName: "Roses",
        description: "A timeless symbol of love and passion",
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
        description: "Elegant pink tulips for spring vibes",
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
        productId: "PROD_4",
        name: "Romantic Mixed Bouquet",
        slug: "romantic-mixed-bouquet",
        categoryId: "bouquets",
        categoryName: "Bouquets",
        description: "Roses, tulips, and daisies in harmony",
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
    ],
  },
  {
    id: "bright",
    name: "Bright & Cheerful",
    slug: "bright",
    description: "Vibrant colors to brighten any space",
    imageUrl: "/images/collections/bright.svg",
    products: [
      {
        id: "4",
        productId: "PROD_3",
        name: "Sunshine Daisy",
        slug: "sunshine-daisy",
        categoryId: "daisies",
        categoryName: "Daisies",
        description: "Bright and cheerful daisies",
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
    ],
  },
  {
    id: "elegant",
    name: "Elegant Whites",
    slug: "elegant",
    description: "Pure whites and creams for sophistication",
    imageUrl: "/images/collections/elegant.svg",
    products: [
      {
        id: "5",
        productId: "PROD_5",
        name: "White Rose Bouquet",
        slug: "white-rose-bouquet",
        categoryId: "bouquets",
        categoryName: "Bouquets",
        description: "Pure elegance in a hand-tied bouquet",
        price: 899,
        imageUrl: "/images/products/white-rose-bouquet.svg",
        galleryUrls: ["/images/products/white-rose-bouquet.svg"],
        colours: ["White", "Cream"],
        stockStatus: "in_stock",
        featured: true,
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
  },
];

export function CuratedCollectionsSection({
  collections = [],
  title = "Curated Collections",
  description = "Handpicked flower collections for every style and occasion",
  className,
}: CuratedCollectionsSectionProps) {
  const displayCollections = collections.length > 0 ? collections : defaultCollections;
  const { addItem } = useCart();

  const handleAddToCart = (product: Product) => {
    addItem(product);
  };

  return (
    <section className={cn("section bg-surface/30", className)} aria-labelledby="curated-collections-heading">
      <div className="container">
        <header className="section-heading text-center max-w-3xl mx-auto">
          <h2 id="curated-collections-heading" className="animate-slide-up">
            {title}
          </h2>
          <p className="animate-slide-up" style={{ animationDelay: "100ms" }}>
            {description}
          </p>
        </header>

        <div className="space-y-16 mt-12">
          {displayCollections.map((collection, collectionIndex) => (
            <div key={collection.id || collection.slug} className="animate-slide-up" style={{ animationDelay: `${collectionIndex * 150 + 100}ms` }}>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="font-heading text-2xl md:text-3xl font-bold text-text">{collection.name}</h3>
                  <p className="text-text-muted mt-1">{collection.description}</p>
                </div>
                <Link
                  href={`/shop?collection=${collection.slug}`}
                  className="hidden sm:inline-flex items-center gap-2 text-primary font-medium hover:text-primary/80 transition-colors"
                >
                  View Collection
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {collection.products.map((product, productIndex) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    variant="default"
                    showAddToCart={true}
                    onAddToCart={handleAddToCart}
                    className="animate-slide-up"
                    style={{ animationDelay: `${productIndex * 80 + 200}ms` }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center animate-fade-in">
          <Button variant="outline" size="lg" asChild>
            <Link href="/shop">View All Products</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}