"use client";

import React, { useEffect, useState } from "react";
import { Star, MessageSquare, ExternalLink, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { Select } from "@/components/ui/Select";
import { cn, formatPrice } from "@/lib/utils";
import { appsScriptClient } from "@/services/apps-script.client";
import type { Review } from "@/types";

interface RatingDistributionProps {
  distribution: Record<number, number>;
  totalReviews: number;
}

function RatingDistribution({ distribution, totalReviews }: RatingDistributionProps) {
  const maxCount = Math.max(...Object.values(distribution));

  return (
    <div className="space-y-2">
      {[5, 4, 3, 2, 1].map((rating) => {
        const count = distribution[rating] || 0;
        const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
        return (
          <div key={rating} className="flex items-center gap-3">
            <div className="w-12 text-right text-sm font-medium text-text-muted">
              {rating} <Star className="w-4 h-4 inline text-warning fill-current" aria-hidden="true" />
            </div>
            <div className="flex-1 h-3 bg-border rounded-full overflow-hidden">
              <div
                className="h-full bg-warning rounded-full transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="w-16 text-sm text-text-muted text-right">{count}</span>
          </div>
        );
      })}
    </div>
  );
}

interface ReviewCardProps {
  review: Review;
}

function ReviewCard({ review }: ReviewCardProps) {
  return (
    <Card className="animate-slide-up">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1" aria-label={`${review.rating} out of 5 stars`}>
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-5 h-5 ${i < review.rating ? "text-warning fill-current" : "text-border"}`}
                fill="currentColor"
                aria-hidden="true"
              />
            ))}
          </div>
          {review.featured && (
            <Badge variant="primary" className="text-xs">Featured</Badge>
          )}
        </div>
        <Quote className="w-8 h-8 text-primary/30 mb-2" aria-hidden="true" />
        <p className="text-text mb-4 leading-relaxed">"{review.reviewText}"</p>
        <p className="font-medium text-text mb-1">{review.title}</p>
        <div className="flex items-center gap-3 text-sm text-text-muted">
          <span>{review.customerName}</span>
          {review.productName && <span>· {review.productName}</span>}
          <span>· {new Date(review.reviewDate).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}</span>
        </div>
        {review.photoUrl && (
          <div className="mt-4">
            <img
              src={review.photoUrl}
              alt={`Photo from ${review.customerName}`}
              className="max-w-xs rounded-lg border border-border"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [productFilter, setProductFilter] = useState("");
  const products = [
    { id: "classic-red-rose", name: "Classic Red Rose" },
    { id: "pink-tulip-bunch", name: "Pink Tulip Bunch" },
    { id: "sunshine-daisy", name: "Sunshine Daisy" },
    { id: "romantic-mixed-bouquet", name: "Romantic Mixed Bouquet" },
  ];

  const fetchReviews = async (page = 1, productId?: string) => {
    try {
      setIsLoading(true);
      const result = await appsScriptClient.listReviews({
        productId,
        page,
        pageSize: 10,
        approvedOnly: true,
      });
      setReviews(result.items);
      setTotalPages(result.totalPages);
      setCurrentPage(page);
    } catch (err) {
      setError("Failed to load reviews. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async (productId?: string) => {
    try {
      const result = await appsScriptClient.getReviewStats(productId);
      // Convert Record<number, number> to expected format with keys 1-5
      const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      Object.entries(result.ratingDistribution).forEach(([key, value]) => {
        const numKey = Number(key);
        if (numKey >= 1 && numKey <= 5) {
          distribution[numKey] = value;
        }
      });
      setStats({
        averageRating: result.averageRating,
        totalReviews: result.totalReviews,
        ratingDistribution: distribution as { 1: number; 2: number; 3: number; 4: number; 5: number },
      });
    } catch (err) {
      console.error("Failed to fetch review stats:", err);
    }
  };

  useEffect(() => {
    fetchReviews(1, productFilter);
    fetchStats(productFilter);
  }, [productFilter]);

  useEffect(() => {
    fetchReviews(currentPage, productFilter);
  }, [currentPage, productFilter]);

  if (isLoading && reviews.length === 0) {
    return (
      <div className="container py-16">
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold text-text">Customer Reviews</h1>
          <p className="text-text-muted mt-1">See what our customers have to say</p>
        </div>
        <div className="space-y-6 max-w-3xl">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-5 h-5 text-border" aria-hidden="true" />
                  ))}
                </div>
                <Skeleton variant="text" className="w-1/2 h-6 mb-2" />
                <Skeleton variant="text" className="w-3/4 h-4 mb-2" />
                <Skeleton variant="text" className="w-1/4 h-4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 lg:py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-text">Customer Reviews</h1>
        <p className="text-text-muted mt-1">Real stories from happy customers who chose Duggu Arts</p>
      </div>

      {/* Rating Summary */}
      <Card className="mb-8">
        <CardContent className="p-6 lg:p-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Average Rating */}
            <div className="text-center lg:text-left">
              <div className="text-6xl lg:text-7xl font-heading font-bold text-text">
                {stats.averageRating.toFixed(1)}
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-1 mt-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-7 h-7 ${i < Math.round(stats.averageRating) ? "text-warning fill-current" : "text-border"}`}
                    fill="currentColor"
                    aria-hidden="true"
                  />
                ))}
              </div>
              <p className="mt-2 text-text-muted">
                Based on {stats.totalReviews} {stats.totalReviews === 1 ? "review" : "reviews"}
              </p>
            </div>

            {/* Rating Distribution */}
            <div className="lg:col-span-2">
              <h3 className="font-heading text-lg font-semibold text-text mb-4">Rating Breakdown</h3>
              <RatingDistribution
                distribution={stats.ratingDistribution}
                totalReviews={stats.totalReviews}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Product Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <Select
          value={productFilter}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
            setProductFilter(e.target.value);
            setCurrentPage(1);
          }}
          options={[
            { value: "", label: "All Products" },
            ...products.map(p => ({ value: p.id, label: p.name })),
          ]}
          placeholder="Filter by product"
          className="w-full sm:w-64"
        />
        <Button variant="outline" asChild>
          <a href="https://forms.gle/your-google-form-link" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" aria-hidden="true" />
            Write a Review
          </a>
        </Button>
      </div>

      {/* Reviews List */}
      {error ? (
        <div className="text-center py-12">
          <p className="text-error mb-4">{error}</p>
          <Button variant="outline" onClick={() => fetchReviews(currentPage, productFilter)}>
            Try Again
          </Button>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-6 bg-surface border border-border rounded-2xl flex items-center justify-center">
            <Star className="w-10 h-10 text-border" aria-hidden="true" />
          </div>
          <h2 className="font-heading text-xl font-semibold text-text mb-2">No Reviews Yet</h2>
          <p className="text-text-muted mb-6">
            {productFilter ? "No reviews for this product yet." : "Be the first to share your experience!"}
          </p>
          <Button variant="outline" asChild>
            <a href="https://forms.gle/your-google-form-link" target="_blank" rel="noopener noreferrer">
              Write the First Review
            </a>
          </Button>
        </div>
      ) : (
        <>
          <div className="grid gap-6 mb-8">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                Previous
              </Button>
              <span className="px-4 text-text">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}