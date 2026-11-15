"use client";

import React from "react";
import { Heart, Leaf, Sparkles, Gift, Shield, Truck, RotateCcw, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

interface WhyHandmadeSectionProps {
  title?: string;
  description?: string;
  className?: string;
}

const features = [
  {
    icon: Heart,
    title: "Handmade with Love",
    description: "Each flower is carefully crafted by hand, ensuring unique character and charm in every piece.",
  },
  {
    icon: Leaf,
    title: "Eco-Friendly Materials",
    description: "Made from high-quality pipe cleaners and floral wire - no fresh flowers wasted.",
  },
  {
    icon: Sparkles,
    title: "Long-Lasting Beauty",
    description: "Unlike fresh flowers, our creations stay beautiful for years with minimal care.",
  },
  {
    icon: Gift,
    title: "Perfect for Gifting",
    description: "Customizable bouquets for birthdays, anniversaries, weddings, and special moments.",
  },
  {
    icon: Shield,
    title: "Quality Guaranteed",
    description: "Every piece undergoes careful quality checks before it reaches your hands.",
  },
  {
    icon: Truck,
    title: "Free Delivery ₹999+",
    description: "Enjoy complimentary shipping on orders above ₹999 across India.",
  },
  {
    icon: RotateCcw,
    title: "Easy Returns",
    description: "7-day hassle-free return policy if you're not completely satisfied.",
  },
  {
    icon: Award,
    title: "Handmade in India",
    description: "Proudly crafted by local artisans supporting Indian craftsmanship.",
  },
];

export function WhyHandmadeSection({
  title = "Why Choose Handmade Flowers?",
  description = "Discover the benefits of choosing our handcrafted pipe-cleaner flowers over fresh blooms",
  className,
}: WhyHandmadeSectionProps) {
  return (
    <section className={cn("section bg-surface/50", className)} aria-labelledby="why-handmade-heading">
      <div className="container">
        <header className="section-heading">
          <h2 id="why-handmade-heading" className="animate-slide-up">
            {title}
          </h2>
          <p className="animate-slide-up" style={{ animationDelay: "100ms" }}>
            {description}
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card
              key={feature.title}
              className="animate-slide-up hover:shadow-lg transition-shadow duration-300"
              style={{ animationDelay: `${index * 100 + 200}ms` }}
            >
              <CardContent className="text-center p-6">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-7 h-7 text-primary" aria-hidden="true" />
                </div>
                <h3 className="font-heading text-xl font-semibold text-text mb-2">{feature.title}</h3>
                <p className="text-text-muted">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}