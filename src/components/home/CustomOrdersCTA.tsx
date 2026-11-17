"use client";

import React from "react";
import Link from "next/link";
import { Flower2, Sparkles, Heart, Palette, Gift, Quote } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface CustomOrdersCTAProps {
  title?: string;
  description?: string;
  features?: Array<{ icon: React.ComponentType<{ className?: string }>; title: string; description: string }>;
  ctaText?: string;
  ctaHref?: string;
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
  className?: string;
}

const defaultFeatures = [
  {
    icon: Palette,
    title: "Choose Your Flowers",
    description: "Select from roses, tulips, daisies, and more",
  },
  {
    icon: Sparkles,
    title: "Pick Your Colours",
    description: "Match your theme or occasion perfectly",
  },
  {
    icon: Gift,
    title: "Custom Wrapping",
    description: "Kraft paper, cellophane, fabric, or gift box",
  },
  {
    icon: Heart,
    title: "Add a Message",
    description: "Include a personalized note for your recipient",
  },
];

export function CustomOrdersCTA({
  title = "Design Your Custom Bouquet",
  description = "Can't find exactly what you're looking for? Create a personalized bouquet with your favorite flowers, colours, and style. We'll bring your vision to life!",
  features = defaultFeatures,
  ctaText = "Start Custom Order",
  ctaHref = "/custom-order",
  secondaryCtaText = "Browse Ready-Made",
  secondaryCtaHref = "/shop",
  className,
}: CustomOrdersCTAProps) {
  return (
    <section className={cn("section", className)} aria-labelledby="custom-orders-heading">
      <div className="container">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-primary via-primary to-accent p-8 md:p-16 text-center text-white">
          {/* Decorative Background */}
          <div className="absolute inset-0" aria-hidden="true">
            <Flower2 className="absolute top-4 left-4 w-12 h-12 text-white/10" />
            <Flower2 className="absolute top-8 right-4 w-16 h-16 text-white/10" />
            <Flower2 className="absolute bottom-4 left-1/3 w-10 h-10 text-white/10" />
            <Flower2 className="absolute bottom-8 right-1/4 w-14 h-14 text-white/10" />
            <Flower2 className="absolute top-1/2 left-1/4 w-8 h-8 text-white/5" />
            <Flower2 className="absolute top-1/3 right-1/3 w-10 h-10 text-white/5" />
          </div>

          <div className="relative max-w-3xl mx-auto">
            <Quote className="w-14 h-14 text-white/20 mx-auto mb-6 animate-fade-in" aria-hidden="true" />
            <h2 id="custom-orders-heading" className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold mb-4 animate-slide-up">
              {title}
            </h2>
            <p className="text-white/90 text-lg md:text-xl mb-10 animate-slide-up" style={{ animationDelay: "100ms" }}>
              {description}
            </p>

            {/* Features */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
              {features.map((feature, index) => (
                <div key={feature.title} className="animate-slide-up" style={{ animationDelay: `${index * 100 + 200}ms` }}>
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
                    <feature.icon className="w-6 h-6 text-white" aria-hidden="true" />
                  </div>
                  <h3 className="font-medium text-white mb-1">{feature.title}</h3>
                  <p className="text-white/70 text-sm">{feature.description}</p>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: "400ms" }}>
              <Button size="lg" variant="secondary" className="w-full sm:w-auto" asChild>
                <Link href={ctaHref}>{ctaText}</Link>
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10" asChild>
                <Link href={secondaryCtaHref}>{secondaryCtaText}</Link>
              </Button>
            </div>

            <p className="mt-6 text-white/60 text-sm animate-fade-in" style={{ animationDelay: "500ms" }}>
              Final price confirmed after consultation • Made to order in 3-5 days
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}