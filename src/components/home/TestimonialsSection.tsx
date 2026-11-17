"use client";

import React from "react";
import { Star, Quote, MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface Testimonial {
  id: string;
  name: string;
  location: string;
  rating: number;
  text: string;
  product: string;
  avatar?: string;
  date?: string;
}

interface TestimonialsSectionProps {
  testimonials?: Testimonial[];
  title?: string;
  description?: string;
  showViewAll?: boolean;
  viewAllHref?: string;
  className?: string;
}

const defaultTestimonials: Testimonial[] = [
  {
    id: "1",
    name: "Priya Sharma",
    location: "Mumbai",
    rating: 5,
    text: "Absolutely stunning! The roses look so realistic and the quality is incredible. My mother loved her birthday bouquet and it's been 6 months - still looks fresh!",
    product: "Classic Red Rose",
    date: "2024-01-15",
  },
  {
    id: "2",
    name: "Arjun Patel",
    location: "Delhi",
    rating: 5,
    text: "Ordered a custom bouquet for our anniversary. The team was so helpful with the design and it arrived perfectly packaged. Highly recommend for special occasions!",
    product: "Custom Bouquet",
    date: "2024-02-20",
  },
  {
    id: "3",
    name: "Sneha Reddy",
    location: "Bangalore",
    rating: 5,
    text: "These last forever! I've had my daisies for over a year and they still look brand new. Great value for money and such a unique gift idea.",
    product: "Sunshine Daisy",
    date: "2024-03-10",
  },
  {
    id: "4",
    name: "Kavya Nair",
    location: "Kochi",
    rating: 5,
    text: "The tulips are my favorite - so elegant and lifelike. I've ordered multiple times and the quality is consistently amazing. Fast shipping too!",
    product: "Pink Tulip Bunch",
    date: "2024-04-05",
  },
  {
    id: "5",
    name: "Rohit Mehta",
    location: "Pune",
    rating: 5,
    text: "Gifted a mixed bouquet to my sister for her housewarming. She was blown away by the detail and craftsmanship. The gift wrapping was beautiful too.",
    product: "Romantic Mixed Bouquet",
    date: "2024-05-12",
  },
  {
    id: "6",
    name: "Anjali Gupta",
    location: "Jaipur",
    rating: 5,
    text: "Perfect for my wedding decor! Used custom bouquets as centerpieces and they looked stunning in photos. No wilting, no stress. Will cherish them forever.",
    product: "Custom Bouquet",
    date: "2024-06-18",
  },
];

export function TestimonialsSection({
  testimonials = [],
  title = "Customer Love",
  description = "Real stories from happy customers who chose Duggu Arts",
  showViewAll = true,
  viewAllHref = "/reviews",
  className,
}: TestimonialsSectionProps) {
  const displayTestimonials = testimonials.length > 0 ? testimonials : defaultTestimonials;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <section className={cn("section bg-surface/50", className)} aria-labelledby="testimonials-heading">
      <div className="container">
        <header className="section-heading">
          <h2 id="testimonials-heading" className="animate-slide-up">
            {title}
          </h2>
          <p className="animate-slide-up" style={{ animationDelay: "100ms" }}>
            {description}
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayTestimonials.map((testimonial, index) => (
            <Card key={testimonial.id} className="animate-slide-up" style={{ animationDelay: `${index * 100 + 100}ms` }}>
              <CardContent className="p-6">
                {/* Rating */}
                <div className="flex items-center gap-1 mb-4" aria-label={`${testimonial.rating} out of 5 stars`}>
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${i < testimonial.rating ? "text-warning fill-current" : "text-border"}`}
                      fill="currentColor"
                      aria-hidden="true"
                    />
                  ))}
                </div>

                {/* Quote Icon */}
                <Quote className="w-8 h-8 text-primary/30 mb-2" aria-hidden="true" />

                {/* Testimonial Text */}
                <p className="text-text mb-4 leading-relaxed">"{testimonial.text}"</p>

                {/* Customer Info */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-medium">
                      {testimonial.avatar ? (
                        <img src={testimonial.avatar} alt="" className="w-10 h-10 rounded-full" />
                      ) : (
                        getInitials(testimonial.name)
                      )}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-text">{testimonial.name}</p>
                    <p className="text-sm text-text-muted">{testimonial.location}</p>
                  </div>
                </div>

                <p className="mt-3 text-xs text-text-muted">Product: {testimonial.product}</p>
                {testimonial.date && (
                  <p className="mt-1 text-xs text-text-muted">Reviewed on {new Date(testimonial.date).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {showViewAll && (
          <div className="mt-10 text-center animate-fade-in">
            <Button variant="outline" size="lg" asChild>
              <a href={viewAllHref}>Read All Reviews</a>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}