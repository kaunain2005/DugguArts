"use client";

import React from "react";
import { Heart, Leaf, Sparkles, Gift, Palette, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface WhyChooseItem {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

interface WhyChooseSectionProps {
  items?: WhyChooseItem[];
  title?: string;
  subtitle?: string;
  className?: string;
}

const defaultItems: WhyChooseItem[] = [
  {
    icon: Heart,
    title: "Handmade with Care",
    description: "Every flower is meticulously crafted by skilled artisans who pour their passion into each petal and stem.",
  },
  {
    icon: Leaf,
    title: "Thoughtful Gifting",
    description: "Give a gift that lasts forever. Our flowers don't wilt, creating lasting memories for your loved ones.",
  },
  {
    icon: Palette,
    title: "Customisation Options",
    description: "Create your perfect bouquet with custom colors, flower types, wrapping styles, and personal messages.",
  },
  {
    icon: Shield,
    title: "Made to Last",
    description: "Quality materials and expert craftsmanship ensure your flowers stay beautiful for years to come.",
  },
  {
    icon: Sparkles,
    title: "Personal Touches",
    description: "Add custom messages, gift wrapping, and special touches that make every order uniquely yours.",
  },
  {
    icon: Gift,
    title: "Eco-Friendly Choice",
    description: "Sustainable alternative to fresh flowers - no water needed, no waste, just everlasting beauty.",
  },
];

export function WhyChooseSection({
  items = [],
  title = "Why Choose Duggu Arts",
  subtitle = "Handcrafted quality that makes every occasion special",
  className,
}: WhyChooseSectionProps) {
  const displayItems = items.length > 0 ? items : defaultItems;

  return (
    <section className={cn("section", className)} aria-labelledby="why-choose-heading">
      <div className="container">
        <header className="section-heading text-center max-w-3xl mx-auto">
          <h2 id="why-choose-heading" className="animate-slide-up">
            {title}
          </h2>
          <p className="animate-slide-up" style={{ animationDelay: "100ms" }}>
            {subtitle}
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          {displayItems.map((item, index) => (
            <div
              key={item.title}
              className="bg-surface border border-border rounded-2xl p-6 text-center animate-slide-up"
              style={{ animationDelay: `${index * 80 + 100}ms` }}
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <item.icon className="w-7 h-7 text-primary" aria-hidden="true" />
              </div>
              <h3 className="font-heading text-xl font-bold text-text mb-2">{item.title}</h3>
              <p className="text-text-muted">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}