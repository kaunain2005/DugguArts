"use client";

import React from "react";
import { Instagram, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface InstagramPost {
  id: string;
  imageUrl: string;
  alt: string;
  link: string;
  likes?: number;
  comments?: number;
}

interface InstagramGalleryProps {
  posts?: InstagramPost[];
  title?: string;
  description?: string;
  instagramHandle?: string;
  instagramUrl?: string;
  showFollowButton?: boolean;
  className?: string;
}

const defaultPosts: InstagramPost[] = [
  { id: "1", imageUrl: "/images/instagram/post-1.svg", alt: "Red rose bouquet", link: "https://instagram.com/p/1" },
  { id: "2", imageUrl: "/images/instagram/post-2.svg", alt: "Pink tulips arrangement", link: "https://instagram.com/p/2" },
  { id: "3", imageUrl: "/images/instagram/post-3.svg", alt: "Yellow daisies", link: "https://instagram.com/p/3" },
  { id: "4", imageUrl: "/images/instagram/post-4.svg", alt: "Mixed bouquet", link: "https://instagram.com/p/4" },
  { id: "5", imageUrl: "/images/instagram/post-5.svg", alt: "White roses", link: "https://instagram.com/p/5" },
  { id: "6", imageUrl: "/images/instagram/post-6.svg", alt: "Custom bouquet", link: "https://instagram.com/p/6" },
  { id: "7", imageUrl: "/images/instagram/post-7.svg", alt: "Behind the scenes", link: "https://instagram.com/p/7" },
  { id: "8", imageUrl: "/images/instagram/post-8.svg", alt: "Workshop view", link: "https://instagram.com/p/8" },
];

export function InstagramGallery({
  posts = [],
  title = "Follow Us on Instagram",
  description = "See our latest creations and behind-the-scenes moments",
  instagramHandle = "@dugguarts",
  instagramUrl = "https://instagram.com/dugguarts",
  showFollowButton = true,
  className,
}: InstagramGalleryProps) {
  const displayPosts = posts.length > 0 ? posts : defaultPosts;

  return (
    <section className={cn("section", className)} aria-labelledby="instagram-heading">
      <div className="container">
        <header className="section-heading">
          <h2 id="instagram-heading" className="animate-slide-up">
            {title}
          </h2>
          <p className="animate-slide-up" style={{ animationDelay: "100ms" }}>
            {description}
          </p>
        </header>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {displayPosts.map((post, index) => (
            <a
              key={post.id}
              href={post.link}
              target="_blank"
              rel="noopener noreferrer"
              className="relative aspect-square overflow-hidden rounded-lg bg-surface group animate-slide-up"
              style={{ animationDelay: `${index * 50 + 100}ms`, gridColumn: index < 4 ? "span 2" : "span 1" }}
              aria-label={`View ${post.alt} on Instagram`}
            >
              {post.imageUrl && post.imageUrl !== "/images/instagram/placeholder.jpg" ? (
                <img
                  src={post.imageUrl}
                  alt={post.alt}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-surface">
                  <Instagram className="w-12 h-12 text-border group-hover:text-primary/50 transition-colors duration-300" aria-hidden="true" />
                </div>
              )}

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                <ExternalLink className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden="true" />
              </div>
            </a>
          ))}
        </div>

        {showFollowButton && (
          <div className="mt-8 text-center animate-fade-in">
            <Button variant="outline" size="lg" asChild>
              <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                <Instagram className="w-5 h-5" aria-hidden="true" />
                Follow {instagramHandle}
              </a>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}