"use client";

import React from "react";
import { Flower2, Sparkles, Heart, Leaf, Award, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface BrandStorySectionProps {
  title?: string;
  subtitle?: string;
  story?: string[];
  stats?: Array<{ value: string; label: string; icon: React.ComponentType<{ className?: string }> }>;
  ctaText?: string;
  ctaHref?: string;
  className?: string;
}

const defaultStory = [
  "Duggu Arts began as a small passion project in a home workshop, where our founder discovered the joy of creating everlasting flowers from simple pipe cleaners.",
  "What started as a creative hobby soon blossomed into a mission: to bring the beauty of flowers into homes without the waste of fresh blooms that wilt within days.",
  "Today, every Duggu Arts flower is still made by hand with the same care and attention to detail. We believe that handmade items carry a special energy - the love and intention of the maker becomes part of the creation.",
  "Our flowers have brightened countless celebrations, from weddings and anniversaries to simple 'thinking of you' moments. Each piece tells a story, and we're honored to be part of yours.",
];

const defaultStats = [
  { value: "5000+", label: "Happy Customers", icon: Heart },
  { value: "50+", label: "Unique Designs", icon: Sparkles },
  { value: "100%", label: "Handmade", icon: Leaf },
  { value: "7", label: "Years of Craft", icon: Award },
];

export function BrandStorySection({
  title = "Our Story",
  subtitle = "Handcrafted with passion, designed to last forever",
  story = defaultStory,
  stats = defaultStats,
  ctaText = "Learn More About Us",
  ctaHref = "/about",
  className,
}: BrandStorySectionProps) {
  return (
    <section className={cn("section bg-surface/30", className)} aria-labelledby="brand-story-heading">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Story Content */}
          <div className="animate-slide-up">
            <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
              Our Journey
            </span>
            <h2 id="brand-story-heading" className="font-heading text-3xl md:text-4xl font-bold text-text mb-6">
              {title}
            </h2>
            <p className="text-text-muted text-lg mb-4">{subtitle}</p>

            <div className="space-y-4 mb-8">
              {story.map((paragraph, index) => (
                <p key={index} className="text-text leading-relaxed animate-slide-up" style={{ animationDelay: `${index * 100 + 200}ms` }}>
                  {paragraph}
                </p>
              ))}
            </div>

            <Button size="lg" variant="outline" asChild className="animate-slide-up" style={{ animationDelay: "500ms" }}>
              <a href={ctaHref}>{ctaText}</a>
            </Button>
          </div>

          {/* Visual Side - Stats & Decorative */}
          <div className="relative animate-fade-in" style={{ animationDelay: "300ms" }}>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {stats.map((stat, index) => (
                <div
                  key={stat.label}
                  className="bg-surface border border-border rounded-xl p-6 text-center animate-slide-up"
                  style={{ animationDelay: `${index * 100 + 400}ms` }}
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <stat.icon className="w-6 h-6 text-primary" aria-hidden="true" />
                  </div>
                  <div className="font-heading text-3xl font-bold text-text">{stat.value}</div>
                  <div className="text-sm text-text-muted mt-1">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Decorative Flower Illustration */}
            <div className="relative aspect-square max-w-md mx-auto">
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
          </div>
        </div>
      </div>
    </section>
  );
}