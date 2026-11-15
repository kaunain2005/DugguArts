"use client";

import { useRef, useState } from "react";
import { CategorySection } from "@/components/home/CategorySection";
import { FeaturedProductsSection } from "@/components/home/FeaturedProductsSection";
import { BestSellerSection } from "@/components/home/BestSellerSection";
import { WhyHandmadeSection } from "@/components/home/WhyHandmadeSection";
import { BrandStorySection } from "@/components/home/BrandStorySection";
import { CustomBouquetCTA } from "@/components/home/CustomBouquetCTA";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { InstagramGallery } from "@/components/home/InstagramGallery";
import { Button } from "@/components/ui/Button";
import { useScrollReveal, useEntranceAnimation } from "@/hooks/useGSAP";
// import { Flower2, Truck, RotateCcw, Gift, Sparkles, Heart, Leaf, Award, Quote } from "lucide-react";
import { FlowerViewer } from "@/components/3d/FlowerViewer";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const heroRef = useRef<HTMLElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const heroFlowerRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const trustRef = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);

  // GSAP Animations
  useScrollReveal(heroRef, { animation: { opacity: 1 }, once: true });
  useEntranceAnimation(heroContentRef, { opacity: 0, y: 30 }, 0.8, 0.1);
  useEntranceAnimation(heroFlowerRef, { opacity: 0, x: 30 }, 0.8, 0.2);
  useEntranceAnimation(badgeRef, { opacity: 0, y: 20 }, 0.5, 0);
  useEntranceAnimation(headingRef, { opacity: 0, y: 30 }, 0.8, 0.1);
  useEntranceAnimation(descriptionRef, { opacity: 0, y: 30 }, 0.8, 0.2);
  useEntranceAnimation(buttonsRef, { opacity: 0, y: 30 }, 0.8, 0.3);
  useEntranceAnimation(trustRef, { opacity: 0, y: 30 }, 0.8, 0.3);
  useEntranceAnimation(scrollIndicatorRef, { opacity: 0, y: 20 }, 0.8, 0.7);

  // Floating animation for decorative flowers
  const [, forceUpdate] = useState(0);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative min-h-[85vh] flex items-center overflow-hidden"
        aria-labelledby="hero-heading"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" aria-hidden="true" />

        <div className="container relative z-10 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Column - Content */}
            <div
              ref={heroContentRef}
              className="lg:order-1 text-center lg:text-left"
            >
              <span
                ref={badgeRef}
                className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6"
              >
                Handmade with Love 💖
              </span>
              <h1
                ref={headingRef}
                id="hero-heading"
                className="font-heading font-bold text-4xl md:text-5xl lg:text-6xl text-text mb-6 leading-tight"
              >
                Handmade Pipe Cleaner{" "}
                <span className="text-primary">Flowers</span>{" "}
                That Last Forever
              </h1>
              <p
                ref={descriptionRef}
                className="text-lg md:text-xl text-text-muted mb-10 max-w-xl lg:mx-0"
              >
                Beautiful, eco-friendly flowers crafted by hand. Perfect for gifts,
                home decor, and special occasions. Custom bouquets available.
              </p>
              <div
                ref={buttonsRef}
                className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4"
              >
                <Button size="lg" asChild>
                  <a href="/shop">Shop Now</a>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <a href="/custom-order">Create Custom Bouquet</a>
                </Button>
              </div>

              {/* Trust indicators */}
              <div
                ref={trustRef}
                className="mt-16 flex flex-wrap items-center justify-center lg:justify-start gap-6 lg:gap-8"
              >
                <div className="flex items-center gap-2 text-text-muted">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span className="text-sm">Free Delivery ₹999+</span>
                </div>
                <div className="flex items-center gap-2 text-text-muted">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                  <span className="text-sm">7-Day Returns</span>
                </div>
                <div className="flex items-center gap-2 text-text-muted">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                  <span className="text-sm">Gift Wrapping</span>
                </div>
                <div className="flex items-center gap-2 text-text-muted">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  <span className="text-sm">Handmade Quality</span>
                </div>
              </div>
            </div>

            {/* Right Column - 3D Interactive Flower */}
            <div
              ref={heroFlowerRef}
              className="lg:order-2 relative"
              aria-hidden="true"
            >
              <div className="relative aspect-square max-w-lg mx-auto lg:mx-0">
                {/* Decorative background glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-secondary/10 rounded-3xl blur-3xl" aria-hidden="true" />
                
                {/* Subtle floating particles */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
                  {[...Array(12)].map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "absolute w-1.5 h-1.5 bg-primary/20 rounded-full animate-float-slow",
                        `top-[${5 + (i * 7)}%] left-[${10 + (i * 6)}%]`,
                        `animation-delay-[${i * 300}ms]`
                      )}
                    />
                  ))}
                </div>

                {/* Interactive 3D Flower Viewer */}
                <FlowerViewer className="w-full max-w-[650px]" />
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          ref={scrollIndicatorRef}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          aria-hidden="true"
        >
          <svg className="w-6 h-6 text-text-muted animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Why Handmade Section - Using Component */}
      <WhyHandmadeSection />

      {/* Categories Section - Using Component */}
      <CategorySection />

      {/* Featured Products Section - Using Component */}
      <FeaturedProductsSection />

      {/* Bestsellers Section - Using Component */}
      <BestSellerSection />

      {/* Brand Story Section - Using Component */}
      <BrandStorySection />

      {/* Custom Bouquet CTA - Using Component */}
      <CustomBouquetCTA />

      {/* Testimonials Section - Using Component */}
      <TestimonialsSection />

      {/* Instagram Gallery - Using Component */}
      <InstagramGallery />

      {/* Newsletter Section */}
      <section className="section bg-surface/50" aria-labelledby="newsletter-heading">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <h2 id="newsletter-heading" className="font-heading text-3xl md:text-4xl font-bold text-text mb-4">
              Stay Updated
            </h2>
            <p className="text-text-muted mb-8">
              Subscribe to our newsletter for new arrivals, special offers, and floral inspiration.
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-surface border border-border rounded-lg text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                aria-label="Email address"
                required
              />
              <Button type="submit" size="lg" className="whitespace-nowrap">
                Subscribe
              </Button>
            </form>
            <p className="mt-4 text-xs text-text-muted">
              We respect your privacy. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}