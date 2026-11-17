"use client";

import React from "react";
import Link from "next/link";
import { Flower2, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface BloomCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  count: number;
  color: string;
  icon?: React.ReactNode;
}

interface ShopByBloomSectionProps {
  categories?: BloomCategory[];
  title?: string;
  description?: string;
  showViewAll?: boolean;
  viewAllHref?: string;
  className?: string;
}

const defaultCategories: BloomCategory[] = [
  {
    id: "roses",
    name: "Roses",
    slug: "roses",
    description: "Classic elegance in every petal",
    imageUrl: "/images/categories/roses.svg",
    count: 12,
    color: "from-red-400 to-red-600",
  },
  {
    id: "tulips",
    name: "Tulips",
    slug: "tulips",
    description: "Graceful blooms for every season",
    imageUrl: "/images/categories/tulips.svg",
    count: 8,
    color: "from-pink-400 to-pink-600",
  },
  {
    id: "daisies",
    name: "Daisies",
    slug: "daisies",
    description: "Cheerful simplicity at its best",
    imageUrl: "/images/categories/daisies.svg",
    count: 10,
    color: "from-yellow-400 to-orange-500",
  },
  {
    id: "bouquets",
    name: "Custom Bouquets",
    slug: "bouquets",
    description: "Curated collections ready to gift",
    imageUrl: "/images/categories/bouquets.svg",
    count: 15,
    color: "from-purple-400 to-pink-500",
  },
  {
    id: "gifts",
    name: "Handmade Gifts",
    slug: "gifts",
    description: "Unique handcrafted treasures",
    imageUrl: "/images/categories/gifts.svg",
    count: 6,
    color: "from-emerald-400 to-teal-600",
  },
];

export function ShopByBloomSection({
  categories = [],
  title = "Shop by Bloom",
  description = "Explore our collection of handcrafted flowers by type",
  showViewAll = true,
  viewAllHref = "/shop",
  className,
}: ShopByBloomSectionProps) {
  const displayCategories = categories.length > 0 ? categories : defaultCategories;

  return (
    <section className={cn("section", className)} aria-labelledby="shop-by-bloom-heading">
      <div className="container">
        <header className="section-heading text-center max-w-3xl mx-auto">
          <h2 id="shop-by-bloom-heading" className="animate-slide-up">
            {title}
          </h2>
          <p className="animate-slide-up" style={{ animationDelay: "100ms" }}>
            {description}
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mt-12">
          {displayCategories.map((category, index) => (
            <Link
              key={category.id || category.slug}
              href={`/shop?category=${category.slug}`}
              className="group relative overflow-hidden rounded-2xl bg-surface border border-border animate-slide-up"
              style={{ animationDelay: `${index * 80 + 100}ms` }}
            >
              <div className="absolute inset-0 bg-gradient-to-br" style={{ background: category.color }} aria-hidden="true">
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-300" />
              </div>

              {/* Category Image */}
              <div className="relative h-48 sm:h-56 flex items-center justify-center p-4">
                {category.imageUrl && category.imageUrl !== "/images/categories/placeholder.jpg" ? (
                  <img
                    src={category.imageUrl}
                    alt={`${category.name} category`}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <Flower2 className="w-16 h-16 text-white/50 group-hover:text-white transition-colors duration-300 relative z-10" aria-hidden="true" />
                )}
              </div>

              {/* Category Content */}
              <div className="relative p-5 text-white">
                <span className="text-xs font-medium bg-white/20 px-2.5 py-1 rounded-full backdrop-blur-sm">
                  {category.count} items
                </span>
                <h3 className="font-heading text-xl font-bold mt-2 mb-1">{category.name}</h3>
                <p className="text-white/80 text-xs mb-3 line-clamp-2">{category.description}</p>
                <div className="flex items-center gap-1.5 text-white/70">
                  <span className="text-sm font-medium">Shop</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {showViewAll && (
          <div className="mt-10 text-center animate-fade-in">
            <Link
              href={viewAllHref}
              className="inline-flex items-center gap-2 px-6 py-3 bg-surface border border-border rounded-lg text-text font-medium hover:bg-surface-elevated hover:border-primary transition-colors"
            >
              View All Categories
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}