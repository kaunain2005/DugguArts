"use client";

import React from "react";
import Link from "next/link";
import { Gift, Heart, Star, Sparkles, Smile, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Occasion {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface OccasionSectionProps {
  occasions?: Occasion[];
  title?: string;
  description?: string;
  className?: string;
}

const defaultOccasions: Occasion[] = [
  {
    id: "birthdays",
    name: "Birthdays",
    slug: "birthdays",
    description: "Make their day bloom forever",
    imageUrl: "/images/occasions/birthday.svg",
    icon: Gift,
    color: "from-pink-400 to-rose-500",
  },
  {
    id: "anniversaries",
    name: "Anniversaries",
    slug: "anniversaries",
    description: "Love that lasts forever",
    imageUrl: "/images/occasions/anniversary.svg",
    icon: Heart,
    color: "from-red-400 to-red-600",
  },
  {
    id: "just-because",
    name: "Just Because",
    slug: "just-because",
    description: "No reason needed to smile",
    imageUrl: "/images/occasions/just-because.svg",
    icon: Sparkles,
    color: "from-amber-400 to-orange-500",
  },
  {
    id: "thank-you",
    name: "Thank You",
    slug: "thank-you",
    description: "Gratitude that blooms",
    imageUrl: "/images/occasions/thank-you.svg",
    icon: Star,
    color: "from-emerald-400 to-teal-500",
  },
  {
    id: "special-surprises",
    name: "Special Surprises",
    slug: "special-surprises",
    description: "Unexpected moments of joy",
    imageUrl: "/images/occasions/surprise.svg",
    icon: Smile,
    color: "from-purple-400 to-violet-500",
  },
];

export function OccasionSection({
  occasions = [],
  title = "Made for Every Occasion",
  description = "Find the perfect handmade flowers for every special moment",
  className,
}: OccasionSectionProps) {
  const displayOccasions = occasions.length > 0 ? occasions : defaultOccasions;

  return (
    <section className={cn("section bg-surface/30", className)} aria-labelledby="occasion-heading">
      <div className="container">
        <header className="section-heading text-center max-w-3xl mx-auto">
          <h2 id="occasion-heading" className="animate-slide-up">
            {title}
          </h2>
          <p className="animate-slide-up" style={{ animationDelay: "100ms" }}>
            {description}
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mt-12">
          {displayOccasions.map((occasion, index) => (
            <Link
              key={occasion.id || occasion.slug}
              href={`/shop?occasion=${occasion.slug}`}
              className="group relative overflow-hidden rounded-2xl bg-surface border border-border animate-slide-up h-56 sm:h-64"
              style={{ animationDelay: `${index * 80 + 100}ms` }}
            >
              <div className="absolute inset-0 bg-gradient-to-br" style={{ background: occasion.color }} aria-hidden="true">
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-300" />
              </div>

              <div className="relative h-full flex flex-col items-center justify-center p-6 text-center text-white">
                <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center mb-4 backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                  <occasion.icon className="w-7 h-7 text-white" aria-hidden="true" />
                </div>
                <h3 className="font-heading text-lg sm:text-xl font-bold mb-1">{occasion.name}</h3>
                <p className="text-white/80 text-sm mb-4 line-clamp-2">{occasion.description}</p>
                <div className="flex items-center justify-center gap-1.5 text-white/70">
                  <span className="text-sm font-medium">Shop</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-10 text-center animate-fade-in">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 bg-surface border border-border rounded-lg text-text font-medium hover:bg-surface-elevated hover:border-primary transition-colors"
          >
            View All Occasions
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}