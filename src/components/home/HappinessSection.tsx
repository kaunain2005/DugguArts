"use client";

import React from "react";
import { Flower2, Leaf, Heart, Sparkles, Truck, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface HappinessSectionProps {
  title?: string;
  subtitle?: string;
  features?: Array<{
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
  }>;
  ctaText?: string;
  ctaHref?: string;
  className?: string;
}

const defaultFeatures = [
  {
    icon: Heart,
    title: "Handmade with Love",
    description: "Every flower is crafted by skilled artisans who pour their heart into each petal, creating pieces that carry the warmth of human touch.",
  },
  {
    icon: Leaf,
    title: "Eco-Friendly Forever",
    description: "Unlike fresh flowers that wilt in days, our pipe cleaner blooms last for years without water, reducing waste and bringing lasting beauty.",
  },
  {
    icon: Sparkles,
    title: "Customisable Beauty",
    description: "Choose your colors, flower types, and arrangement style. Every bouquet is made to order, tailored perfectly to your vision.",
  },
];

export function HappinessSection({
  title = "Little Pieces of Happiness",
  subtitle = "Why our handmade flowers bring joy that lasts",
  features = defaultFeatures,
  ctaText = "Discover the Collection",
  ctaHref = "/shop",
  className,
}: HappinessSectionProps) {
  return (
    <section className={cn("section", className)} aria-labelledby="happiness-heading">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content Side */}
          <div className="animate-slide-up">
            <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
              Our Philosophy
            </span>
            <h2 id="happiness-heading" className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-text mb-6 leading-tight">
              {title}
            </h2>
            <p className="text-text-muted text-lg mb-8">{subtitle}</p>

            <div className="space-y-6 mb-10">
              {features.map((feature, index) => (
                <div key={feature.title} className="flex gap-4 animate-slide-up" style={{ animationDelay: `${index * 100 + 200}ms` }}>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-6 h-6 text-primary" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg text-text mb-1">{feature.title}</h3>
                    <p className="text-text-muted">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <Button size="lg" asChild className="animate-slide-up" style={{ animationDelay: "500ms" }}>
              <a href={ctaHref}>{ctaText}</a>
            </Button>
          </div>

          {/* Visual Side */}
          <div className="relative animate-fade-in" style={{ animationDelay: "300ms" }}>
            <div className="aspect-square max-w-md mx-auto relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-3xl" aria-hidden="true" />
              <div className="relative aspect-square flex items-center justify-center">
                <Flower2 className="w-48 h-48 text-primary/20" aria-hidden="true" />
                {/* Floating decorative elements */}
                <div className="absolute top-4 left-4 w-8 h-8 bg-primary/20 rounded-full blur-xl animate-pulse-slow" aria-hidden="true" />
                <div className="absolute top-10 right-4 w-6 h-6 bg-secondary/30 rounded-full blur-xl animate-pulse-slow" style={{ animationDelay: "1s" }} aria-hidden="true" />
                <div className="absolute bottom-4 left-8 w-10 h-10 bg-primary/15 rounded-full blur-xl animate-pulse-slow" style={{ animationDelay: "2s" }} aria-hidden="true" />
                <div className="absolute bottom-10 right-8 w-6 h-6 bg-secondary/20 rounded-full blur-xl animate-pulse-slow" style={{ animationDelay: "3s" }} aria-hidden="true" />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="bg-surface border border-border rounded-xl p-5 text-center animate-slide-up">
                <div className="font-heading text-3xl font-bold text-text">5000+</div>
                <div className="text-sm text-text-muted mt-1">Happy Customers</div>
              </div>
              <div className="bg-surface border border-border rounded-xl p-5 text-center animate-slide-up" style={{ animationDelay: "100ms" }}>
                <div className="font-heading text-3xl font-bold text-text">100%</div>
                <div className="text-sm text-text-muted mt-1">Handmade</div>
              </div>
              <div className="bg-surface border border-border rounded-xl p-5 text-center animate-slide-up" style={{ animationDelay: "200ms" }}>
                <div className="font-heading text-3xl font-bold text-text">50+</div>
                <div className="text-sm text-text-muted mt-1">Unique Designs</div>
              </div>
              <div className="bg-surface border border-border rounded-xl p-5 text-center animate-slide-up" style={{ animationDelay: "300ms" }}>
                <div className="font-heading text-3xl font-bold text-text">7+</div>
                <div className="text-sm text-text-muted mt-1">Years of Craft</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}