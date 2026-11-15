"use client";

import React from "react";
import Link from "next/link";
import { Flower2, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Category } from "@/types/product";

// Extended category type for display with additional UI properties
interface DisplayCategory extends Category {
  count: number;
  color: string;
}

interface CategorySectionProps {
  categories?: DisplayCategory[];
  title?: string;
  description?: string;
  showViewAll?: boolean;
  viewAllHref?: string;
  className?: string;
}

const defaultCategories: DisplayCategory[] = [
  {
    id: "roses",
    categoryId: "roses",
    name: "Roses",
    slug: "roses",
    description: "Classic elegance in every petal",
    imageUrl: "/images/categories/roses.svg",
    active: true,
    displayOrder: 1,
    count: 12,
    color: "from-red-400 to-red-600",
  },
  {
    id: "tulips",
    categoryId: "tulips",
    name: "Tulips",
    slug: "tulips",
    description: "Graceful blooms for every season",
    imageUrl: "/images/categories/tulips.svg",
    active: true,
    displayOrder: 2,
    count: 8,
    color: "from-pink-400 to-pink-600",
  },
  {
    id: "daisies",
    categoryId: "daisies",
    name: "Daisies",
    slug: "daisies",
    description: "Cheerful simplicity at its best",
    imageUrl: "/images/categories/daisies.svg",
    active: true,
    displayOrder: 3,
    count: 10,
    color: "from-yellow-400 to-orange-500",
  },
  {
    id: "bouquets",
    categoryId: "bouquets",
    name: "Bouquets",
    slug: "bouquets",
    description: "Curated collections ready to gift",
    imageUrl: "/images/categories/bouquets.svg",
    active: true,
    displayOrder: 4,
    count: 15,
    color: "from-purple-400 to-pink-500",
  },
];

export function CategorySection({
  categories = [],
  title = "Shop by Category",
  description = "Explore our collection of handcrafted flowers",
  showViewAll = true,
  viewAllHref = "/shop",
  className,
}: CategorySectionProps) {
  const displayCategories = categories.length > 0 ? categories : defaultCategories;

  return (
    <section className={cn("section", className)} aria-labelledby="categories-heading">
      <div className="container">
        <header className="section-heading">
          <h2 id="categories-heading" className="animate-slide-up">
            {title}
          </h2>
          <p className="animate-slide-up" style={{ animationDelay: "100ms" }}>
            {description}
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayCategories.map((category, index) => (
            <Link
              key={category.id || category.slug}
              href={`/shop?category=${category.slug}`}
              className="group relative overflow-hidden rounded-2xl bg-surface border border-border animate-slide-up"
              style={{ animationDelay: `${index * 100 + 100}ms` }}
            >
              <div className="absolute inset-0 bg-gradient-to-br" style={{ background: category.color }} aria-hidden="true">
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-300" />
              </div>

              {/* Category Image */}
              <div className="relative h-56 sm:h-64 flex items-center justify-center">
                {category.imageUrl && category.imageUrl !== "/images/categories/placeholder.jpg" ? (
                  <img
                    src={category.imageUrl}
                    alt={`${category.name} category`}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <Flower2 className="w-20 h-20 text-white/50 group-hover:text-white transition-colors duration-300 relative z-10" aria-hidden="true" />
                )}
              </div>

              {/* Category Content */}
              <div className="relative p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                    {category.count} products
                  </span>
                </div>
                <h3 className="font-heading text-2xl font-bold mb-1">{category.name}</h3>
                <p className="text-white/80 text-sm mb-4 line-clamp-2">{category.description}</p>
                <div className="flex items-center gap-2 text-white/70">
                  <span className="text-sm font-medium">Shop Now</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
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