"use client";

import React, { useRef, useState } from "react";
import { Flower2, Heart, Leaf, Award, Truck, RotateCcw, Shield, Sparkles, Target, Users, Recycle, Gift, Sparkle, Palette, Scissors, Package, Sun } from "lucide-react";
import { useScrollReveal, useStaggeredAnimation, useEntranceAnimation } from "@/hooks/useGSAP";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { APP_CONFIG } from "@/lib/constants";
import { cn } from "@/lib/utils";

const VALUES = [
  {
    icon: Heart,
    title: "Handmade with Love",
    description: "Every flower is crafted by hand with attention to detail and genuine care.",
  },
  {
    icon: Leaf,
    title: "Eco-Friendly Materials",
    description: "We use sustainable pipe cleaners and biodegradable packaging materials.",
  },
  {
    icon: Award,
    title: "Premium Quality",
    description: "Our flowers are made to last for years without wilting or fading.",
  },
  {
    icon: Sparkles,
    title: "Custom Creations",
    description: "Design your own unique bouquet with our custom order service.",
  },
];

const STORY_POINTS = [
  {
    icon: Palette,
    title: "Choosing Colors",
    description: "We carefully select premium pipe cleaners in vibrant, lasting colors that capture nature's beauty.",
  },
  {
    icon: Scissors,
    title: "Shaping Petals",
    description: "Each petal is individually cut, folded, and shaped by hand to create realistic floral forms.",
  },
  {
    icon: Sparkle,
    title: "Creating Centers",
    description: "Flower centers are crafted with detailed textures - from pollen-dusted stamens to layered pistils.",
  },
  {
    icon: Package,
    title: "Assembling Stems",
    description: "Petals are attached to wire stems, wrapped with floral tape, and reinforced for durability.",
  },
  {
    icon: Sun,
    title: "Adding Leaves",
    description: "Green leaves are shaped and positioned to create natural, lifelike arrangements.",
  },
  {
    icon: Gift,
    title: "Wrapping & Gifting",
    description: "Each bouquet is wrapped in eco-friendly materials with optional personalized message cards.",
  },
];

const TEAM = [
  {
    name: "Duggu",
    role: "Founder & Chief Florist",
    bio: "Started this journey with a passion for creating everlasting beauty.",
  },
  {
    name: "Artisan Team",
    role: "Master Craftspeople",
    bio: "Skilled artisans who bring each flower to life with precision.",
  },
];

const MILESTONES = [
  { year: "2020", title: "Founded", description: "Started as a small home-based craft project" },
  { year: "2021", title: "First 100 Orders", description: "Gained recognition for quality and creativity" },
  { year: "2022", title: "Custom Bouquets Launched", description: "Introduced personalized bouquet design service" },
  { year: "2023", title: "Online Store Launch", description: "Expanded reach with full e-commerce platform" },
  { year: "2024", title: "10,000+ Flowers Delivered", description: "Milestone achievement in sustainable gifting" },
];

export default function AboutPage() {
  const heroRef = useRef<HTMLElement>(null);
  const valuesRef = useRef<HTMLDivElement>(null);
  const storyRef = useRef<HTMLDivElement>(null);
  const processRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const teamRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useScrollReveal(heroRef, { animation: { opacity: 0, y: 30 }, once: true });
  useEntranceAnimation(ctaRef, { opacity: 0, y: 30 }, 0.8, 0.3);
  useStaggeredAnimation(valuesRef, ".value-card", { opacity: 0, y: 30 }, 0.1, 0.6);
  useScrollReveal(storyRef, { animation: { opacity: 0, y: 30 }, once: true });
  useStaggeredAnimation(processRef, ".process-card", { opacity: 0, y: 30 }, 0.1, 0.5);
  useScrollReveal(timelineRef, { animation: { opacity: 0, y: 30 }, once: true });
  useStaggeredAnimation(teamRef, ".team-card", { opacity: 0, y: 30 }, 0.15, 0.5);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative min-h-[50vh] flex items-center justify-center overflow-hidden"
        aria-labelledby="about-hero-heading"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" aria-hidden="true" />
        
        {/* Floating decorative elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className={cn(
                "absolute w-2 h-2 bg-primary/10 rounded-full animate-float-slow",
                `top-[${5 + (i * 10)}%] left-[${10 + (i * 8)}%]`,
                `animation-delay-[${i * 400}ms]`
              )}
            />
          ))}
        </div>
        
        <div className="container relative z-10 py-16 lg:py-20 visible-by-default">
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
              Our Story
            </span>
            <h1
              id="about-hero-heading"
              className="font-heading font-bold text-4xl md:text-5xl lg:text-6xl text-text mb-6"
            >
              Flowers That{" "}
              <span className="text-primary">Last Forever</span>
            </h1>
            <p className="text-lg md:text-xl text-text-muted mb-10 max-w-2xl mx-auto">
              Handcrafted pipe cleaner flowers that bring eternal beauty to your space.
              Sustainable, customizable, and made with love in every petal.
            </p>
            <div
              ref={ctaRef}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button size="lg" asChild>
                <a href="/custom-order">Design Your Bouquet</a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="/shop">Shop Collection</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section
        ref={storyRef}
        className="section"
        aria-labelledby="story-heading"
      >
        <div className="container">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 id="story-heading" className="font-heading text-3xl md:text-4xl font-bold text-text mb-4">
              Our Story
            </h2>
            <p className="text-text-muted text-lg max-w-3xl mx-auto">
              What started as a simple passion for crafting has blossomed into a mission to bring 
              everlasting beauty into homes and hearts across the country. Every Duggu Arts flower 
              tells a story of patience, creativity, and the belief that the most meaningful gifts 
              are those made by hand.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="relative aspect-square max-w-md mx-auto md:mx-0">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 rounded-3xl blur-2xl" aria-hidden="true" />
              <div className="relative z-10 bg-surface border border-border rounded-3xl p-8 aspect-square flex items-center justify-center">
                <div className="text-center">
                  <div className="text-8xl sm:text-9xl md:text-[10rem] mb-4 animate-float-slow" aria-hidden="true">🌹</div>
                  <p className="text-text-muted">Handcrafted with precision and care</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="p-6 bg-surface border border-border rounded-2xl">
                <h3 className="font-heading text-2xl font-semibold text-text mb-3">
                  A Passion for Everlasting Beauty
                </h3>
                <p className="text-text-muted leading-relaxed">
                  Duggu Arts was born from a simple question: why should beauty fade? 
                  Fresh flowers bring joy for days, but handcrafted pipe cleaner flowers 
                  can bring that same joy for years. Each flower we create is a testament 
                  to the belief that the most precious things in life are made with time, 
                  patience, and genuine care.
                </p>
              </div>
              <div className="p-6 bg-surface border border-border rounded-2xl">
                <h3 className="font-heading text-2xl font-semibold text-text mb-3">
                  Sustainable by Design
                </h3>
                <p className="text-text-muted leading-relaxed">
                  We believe that creating beauty shouldn't come at the cost of our planet. 
                  Our flowers are made from durable, recyclable materials with biodegradable 
                  packaging. No water needed, no pesticides, no carbon footprint from 
                  international shipping - just pure, lasting beauty crafted responsibly.
                </p>
              </div>
              <div className="p-6 bg-surface border border-border rounded-2xl">
                <h3 className="font-heading text-2xl font-semibold text-text mb-3">
                  Made for You
                </h3>
                <p className="text-text-muted leading-relaxed">
                  Whether you're celebrating a milestone, expressing sympathy, or simply 
                  brightening someone's day, our custom bouquet service lets you design 
                  the perfect arrangement. Choose your colors, flowers, size, and personal 
                  touches - we'll bring your vision to life.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Process */}
      <section
        ref={processRef}
        className="section bg-surface/50"
        aria-labelledby="process-heading"
      >
        <div className="container">
          <div className="text-center mb-16">
            <h2 id="process-heading" className="font-heading text-3xl md:text-4xl font-bold text-text mb-4">
              Our Creative Process
            </h2>
            <p className="text-text-muted max-w-2xl mx-auto">
              From a simple pipe cleaner to a stunning forever flower - every step is done by hand with meticulous attention to detail.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {STORY_POINTS.map((step, index) => (
              <Card
                key={step.title}
                ref={index === 0 ? processRef : undefined}
                className={cn("process-card p-6 h-full border-border hover:shadow-xl transition-all", index === 0 && "ring-2 ring-primary/20")}
                variant="default"
              >
                <CardContent className="p-0 flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                    <step.icon className="w-8 h-8 text-primary" aria-hidden="true" />
                  </div>
                  <h3 className="font-heading text-xl font-semibold text-text mb-2">{step.title}</h3>
                  <p className="text-text-muted">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section
        ref={valuesRef}
        className="section"
        aria-labelledby="values-heading"
      >
        <div className="container">
          <div className="text-center mb-16">
            <h2 id="values-heading" className="font-heading text-3xl md:text-4xl font-bold text-text mb-4">
              Our Values
            </h2>
            <p className="text-text-muted max-w-2xl mx-auto">
              These principles guide everything we create, from the first petal to the final delivery.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((value, index) => (
              <Card
                key={value.title}
                className={cn("value-card p-6 h-full border-border transition-all hover:shadow-lg hover:-translate-y-1", index === 0 && "ring-2 ring-primary/20")}
                variant="outlined"
              >
                <CardContent className="p-0 flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                    <value.icon className="w-8 h-8 text-primary" aria-hidden="true" />
                  </div>
                  <h3 className="font-heading text-xl font-semibold text-text mb-2">{value.title}</h3>
                  <p className="text-text-muted">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Our Journey */}
      <section
        ref={timelineRef}
        className="section bg-surface/50"
        aria-labelledby="journey-heading"
      >
        <div className="container">
          <div className="text-center mb-16">
            <h2 id="journey-heading" className="font-heading text-3xl md:text-4xl font-bold text-text mb-4">
              Our Journey
            </h2>
            <p className="text-text-muted max-w-2xl mx-auto">
              From a small passion project to delivering thousands of smiles across the country.
            </p>
          </div>
          <div className="relative max-w-3xl mx-auto">
            {/* Timeline line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-border -translate-x-1/2" aria-hidden="true" />
            
            {MILESTONES.map((milestone, index) => (
              <div
                key={milestone.year}
                className="relative mb-12 flex items-center"
              >
                <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 ml-auto text-left'}`}>
                  <Card variant="outlined" className="p-6 hover:shadow-lg transition-shadow">
                    <CardContent className="p-0">
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="font-heading text-xl font-bold text-primary">{milestone.year}</span>
                        </div>
                        <div>
                          <h3 className="font-heading text-lg font-semibold text-text">{milestone.title}</h3>
                          <p className="text-text-muted text-sm">{milestone.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  {/* Timeline dot */}
                  <div className="absolute top-8 left-1/2 -translate-x-1/2 w-4 h-4 bg-primary rounded-full border-4 border-background z-10" aria-hidden="true" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Team */}
      <section
        ref={teamRef}
        className="section"
        aria-labelledby="team-heading"
      >
        <div className="container">
          <div className="text-center mb-16">
            <h2 id="team-heading" className="font-heading text-3xl md:text-4xl font-bold text-text mb-4">
              Meet the Makers
            </h2>
            <p className="text-text-muted max-w-2xl mx-auto">
              Behind every bloom is a pair of hands that crafted it with care and dedication.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {TEAM.map((member, index) => (
              <Card
                key={member.name}
                className={cn("team-card p-8 border-border hover:shadow-xl transition-all", index === 0 && "ring-2 ring-primary/20")}
                variant="default"
              >
                <CardContent className="p-0 flex flex-col items-center text-center">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="font-heading text-3xl font-bold text-primary">
                      {member.name.charAt(0)}
                    </span>
                  </div>
                  <h3 className="font-heading text-2xl font-semibold text-text mb-1">{member.name}</h3>
                  <p className="text-primary font-medium mb-4">{member.role}</p>
                  <p className="text-text-muted">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="section" aria-labelledby="choose-heading">
        <div className="container">
          <div className="text-center mb-16">
            <h2 id="choose-heading" className="font-heading text-3xl md:text-4xl font-bold text-text mb-4">
              Why Choose Duggu Arts?
            </h2>
            <p className="text-text-muted max-w-2xl mx-auto">
              We're committed to delivering not just flowers, but lasting memories and sustainable joy.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Truck,
                title: "Free Delivery",
                description: "On orders above ₹999 across India",
              },
              {
                icon: Shield,
                title: "Quality Guaranteed",
                description: "Each flower inspected before shipping",
              },
              {
                icon: RotateCcw,
                title: "Easy Returns",
                description: "7-day return policy for peace of mind",
              },
              {
                icon: Users,
                title: "Custom Designs",
                description: "Create your perfect bouquet from scratch",
              },
              {
                icon: Recycle,
                title: "Eco-Friendly",
                description: "Sustainable materials & packaging",
              },
              {
                icon: Gift,
                title: "Gift Wrapping",
                description: "Beautiful presentation included",
              },
            ].map((feature, index) => (
              <Card
                key={feature.title}
                className={cn("p-6 h-full border-border hover:shadow-lg transition-all", index === 0 && "ring-2 ring-primary/20")}
                variant="default"
              >
                <CardContent className="p-0 flex flex-col items-center text-center">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-7 h-7 text-primary" aria-hidden="true" />
                  </div>
                  <h3 className="font-heading text-lg font-semibold text-text mb-2">{feature.title}</h3>
                  <p className="text-text-muted text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section" aria-labelledby="cta-heading">
        <div className="container">
          <Card className="bg-primary text-white border-0 overflow-hidden">
            <CardContent className="p-8 md:p-12 lg:p-16 text-center">
              <div className="max-w-2xl mx-auto">
                <h2 id="cta-heading" className="font-heading text-3xl md:text-4xl font-bold mb-4">
                  Ready to Experience Forever Flowers?
                </h2>
                <p className="text-primary/90 text-lg mb-8">
                  Join thousands of happy customers who chose sustainable beauty.
                  Start your journey with a custom bouquet or explore our collection.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button size="lg" variant="secondary" asChild className="w-full sm:w-auto">
                    <a href="/custom-order">Design Custom Bouquet</a>
                  </Button>
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 w-full sm:w-auto" asChild>
                    <a href="/shop">Browse Collection</a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}