"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Heart, ShoppingBag, Tag, Star, Truck, RotateCcw, Shield, X, Minus, Plus } from "lucide-react";
import { ProductCard } from "@/components/products/ProductCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Separator } from "@/components/ui/Separator";
import { cn, formatPrice } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import type { Product } from "@/types/product";

// Mock product data - in production this would come from API
const mockProducts: Record<string, Product> = {
  "classic-red-rose": {
    id: "1",
    productId: "PROD_1",
    name: "Classic Red Rose",
    slug: "classic-red-rose",
    categoryId: "roses",
    categoryName: "Roses",
    description: "A timeless symbol of love and passion, handcrafted with premium pipe cleaners. Each rose is meticulously shaped petal by petal to create a lifelike bloom that captures the elegance of a real rose without ever wilting. Perfect for anniversaries, Valentine's Day, or simply to brighten someone's day.",
    price: 299,
    imageUrl: "/images/products/red-rose.svg",
    galleryUrls: [
      "/images/products/red-rose.svg",
      "/images/products/red-rose-2.svg",
      "/images/products/red-rose-3.svg",
    ],
    colours: ["Red", "Deep Red", "Burgundy", "Pink", "White"],
    stockStatus: "in_stock",
    featured: true,
    active: true,
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
  "pink-tulip-bunch": {
    id: "2",
    productId: "PROD_2",
    name: "Pink Tulip Bunch",
    slug: "pink-tulip-bunch",
    categoryId: "tulips",
    categoryName: "Tulips",
    description: "Elegant pink tulips that bring spring to your home all year round. This bunch features 5 handcrafted tulips in varying shades of pink, arranged with natural-looking green stems and leaves. The graceful cup-shaped blooms capture the delicate beauty of real tulips.",
    price: 399,
    imageUrl: "/images/products/pink-tulips.svg",
    galleryUrls: [
      "/images/products/pink-tulips.svg",
      "/images/products/pink-tulips-2.svg",
    ],
    colours: ["Pink", "Light Pink", "White", "Yellow"],
    stockStatus: "in_stock",
    featured: false,
    active: true,
    createdAt: "2024-01-20T10:00:00Z",
    updatedAt: "2024-01-20T10:00:00Z",
  },
  "sunshine-daisy": {
    id: "3",
    productId: "PROD_3",
    name: "Sunshine Daisy",
    slug: "sunshine-daisy",
    categoryId: "daisies",
    categoryName: "Daisies",
    description: "Bright and cheerful daisies to brighten any room. Each daisy features a sunny yellow center surrounded by pristine white petals, handcrafted with attention to detail. Sold as a bunch of 7 stems with natural green foliage.",
    price: 199,
    imageUrl: "/images/products/yellow-daisy.svg",
    galleryUrls: ["/images/products/yellow-daisy.svg"],
    colours: ["Yellow", "White", "Orange", "Pink"],
    stockStatus: "in_stock",
    featured: false,
    active: true,
    createdAt: "2024-02-01T10:00:00Z",
    updatedAt: "2024-02-01T10:00:00Z",
  },
  "romantic-mixed-bouquet": {
    id: "4",
    productId: "PROD_4",
    name: "Romantic Mixed Bouquet",
    slug: "romantic-mixed-bouquet",
    categoryId: "bouquets",
    categoryName: "Bouquets",
    description: "A stunning arrangement of roses, tulips, and daisies in harmonious colours. This hand-tied bouquet features 12 stems carefully arranged and wrapped in premium kraft paper with a satin ribbon. Perfect for anniversaries, birthdays, or romantic gestures.",
    price: 1299,
    imageUrl: "/images/products/romantic-bouquet.svg",
    galleryUrls: [
      "/images/products/romantic-bouquet.svg",
      "/images/products/romantic-bouquet-2.svg",
      "/images/products/romantic-bouquet-3.svg",
    ],
    colours: ["Mixed"],
    stockStatus: "in_stock",
    featured: true,
    active: true,
    createdAt: "2024-02-10T10:00:00Z",
    updatedAt: "2024-02-10T10:00:00Z",
  },
};

const relatedProductsData: Product[] = [
  {
    id: "5",
    productId: "PROD_5",
    name: "White Rose Bouquet",
    slug: "white-rose-bouquet",
    categoryId: "bouquets",
    categoryName: "Bouquets",
    description: "Pure elegance in a hand-tied bouquet.",
    price: 899,
    imageUrl: "/images/products/white-rose-bouquet.svg",
    galleryUrls: ["/images/products/white-rose-bouquet.svg"],
    colours: ["White", "Cream"],
    stockStatus: "in_stock",
    featured: true,
    active: true,
    createdAt: "2024-02-15T10:00:00Z",
    updatedAt: "2024-02-15T10:00:00Z",
  },
  {
    id: "6",
    productId: "PROD_6",
    name: "Purple Tulip Trio",
    slug: "purple-tulip-trio",
    categoryId: "tulips",
    categoryName: "Tulips",
    description: "Regal purple tulips for a touch of luxury.",
    price: 449,
    imageUrl: "/images/products/purple-tulips.svg",
    galleryUrls: ["/images/products/purple-tulips.svg"],
    colours: ["Purple", "Lavender", "White"],
    stockStatus: "low_stock",
    featured: false,
    active: true,
    createdAt: "2024-03-01T10:00:00Z",
    updatedAt: "2024-03-01T10:00:00Z",
  },
  {
    id: "7",
    productId: "PROD_7",
    name: "Orange Daisy Delight",
    slug: "orange-daisy-delight",
    categoryId: "daisies",
    categoryName: "Daisies",
    description: "Vibrant orange daisies to energize your space.",
    price: 249,
    imageUrl: "/images/products/orange-daisy.svg",
    galleryUrls: ["/images/products/orange-daisy.svg"],
    colours: ["Orange", "Yellow", "Red"],
    stockStatus: "in_stock",
    featured: false,
    active: true,
    createdAt: "2024-03-05T10:00:00Z",
    updatedAt: "2024-03-05T10:00:00Z",
  },
  {
    id: "8",
    productId: "PROD_8",
    name: "Blue Rose (Made to Order)",
    slug: "blue-rose-custom",
    categoryId: "roses",
    categoryName: "Roses",
    description: "Rare blue roses crafted on special request.",
    price: 599,
    imageUrl: "/images/products/blue-rose.svg",
    galleryUrls: ["/images/products/blue-rose.svg"],
    colours: ["Blue"],
    stockStatus: "made_to_order",
    featured: false,
    active: true,
    createdAt: "2024-03-10T10:00:00Z",
    updatedAt: "2024-03-10T10:00:00Z",
  },
];

const WRAPPING_OPTIONS = [
  { id: "none", name: "No Wrapping", price: 0, description: "Flowers shipped in protective packaging" },
  { id: "paper", name: "Kraft Paper", price: 50, description: "Eco-friendly brown kraft paper with twine" },
  { id: "cellophane", name: "Clear Cellophane", price: 40, description: "Transparent cellophane with decorative bow" },
  { id: "fabric", name: "Fabric Wrap", price: 120, description: "Premium fabric wrap in coordinating colour" },
  { id: "box", name: "Gift Box", price: 200, description: "Rigid gift box with tissue paper" },
];

const MESSAGE_CARD_OPTIONS = [
  { id: "none", name: "No Card", price: 0, description: "" },
  { id: "standard", name: "Standard Card", price: 20, description: "Simple folded card with your message" },
  { id: "premium", name: "Premium Card with Envelope", price: 50, description: "Thick cardstock with matching envelope" },
];

const STOCK_STATUS_LABELS = {
  in_stock: "In Stock",
  low_stock: "Low Stock",
  out_of_stock: "Out of Stock",
  made_to_order: "Made to Order",
};

const STOCK_STATUS_VARIANTS = {
  in_stock: "success",
  low_stock: "warning",
  out_of_stock: "error",
  made_to_order: "outline",
};

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColour, setSelectedColour] = useState("");
  const [selectedWrapping, setSelectedWrapping] = useState("none");
  const [selectedMessageCard, setSelectedMessageCard] = useState("none");
  const [personalisation, setPersonalisation] = useState("");
  const [messageText, setMessageText] = useState("");
  const [showPersonalisationError, setShowPersonalisationError] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      const foundProduct = mockProducts[slug];
      if (foundProduct) {
        setProduct(foundProduct);
        // Set default colour
        if (foundProduct.colours.length > 0) {
          setSelectedColour(foundProduct.colours[0]);
        }
      } else {
        setNotFound(true);
      }
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [slug]);

  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  if (notFound || !product) {
    return (
      <div className="container py-16 text-center">
        <div className="w-24 h-24 mx-auto mb-6 bg-surface border border-border rounded-2xl flex items-center justify-center">
          <Tag className="w-10 h-10 text-text-muted" aria-hidden="true" />
        </div>
        <h1 className="font-heading text-3xl font-bold text-text mb-4">Product Not Found</h1>
        <p className="text-text-muted mb-8">Sorry, we couldn't find the product you're looking for.</p>
        <Button asChild>
          <Link href="/shop">Browse All Products</Link>
        </Button>
      </div>
    );
  }

  const allImages = [product.imageUrl, ...product.galleryUrls].filter(Boolean);
  const wrappingOption = WRAPPING_OPTIONS.find(w => w.id === selectedWrapping);
  const messageCardOption = MESSAGE_CARD_OPTIONS.find(m => m.id === selectedMessageCard);
  const basePrice = product.price;
  const wrappingPrice = wrappingOption?.price || 0;
  const messageCardPrice = messageCardOption?.price || 0;
  const totalPrice = basePrice + wrappingPrice + messageCardPrice;

  const handleAddToCart = () => {
    // Validate personalisation if needed
    if (selectedMessageCard !== "none" && !messageText.trim()) {
      setShowPersonalisationError(true);
      return;
    }
    if (personalisation && personalisation.length > 100) {
      setShowPersonalisationError(true);
      return;
    }

    addItem(product, {
      quantity,
      selectedColour,
      personalisation: personalisation || undefined,
      wrapping: selectedWrapping !== "none",
      messageCard: selectedMessageCard !== "none" ? messageText : undefined,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 3000);
  };

  const isOutOfStock = product.stockStatus === "out_of_stock";

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <nav className="bg-surface/50 border-b border-border" aria-label="Breadcrumb">
        <div className="container py-4">
          <ol className="flex items-center gap-2 text-sm">
            <li>
              <Link href="/" className="text-text-muted hover:text-primary transition-colors">Home</Link>
            </li>
            <li className="text-text-muted">/</li>
            <li>
              <Link href="/shop" className="text-text-muted hover:text-primary transition-colors">Shop</Link>
            </li>
            <li className="text-text-muted">/</li>
            <li>
              <Link href={`/shop?category=${product.categoryId}`} className="text-text-muted hover:text-primary transition-colors">
                {product.categoryName}
              </Link>
            </li>
            <li className="text-text-muted">/</li>
            <li className="text-text font-medium truncate max-w-[200px]" aria-current="page">{product.name}</li>
          </ol>
        </div>
      </nav>

      {/* Product Content */}
      <div className="container py-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-surface">
              {allImages[selectedImageIndex] ? (
                <img
                  src={allImages[selectedImageIndex]}
                  alt={`${product.name} - view ${selectedImageIndex + 1}`}
                  className="w-full h-full object-cover transition-opacity duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-24 h-24 text-border" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                </div>
              )}

              {/* Stock Badge */}
              <div className="absolute top-4 left-4">
                <Badge variant={STOCK_STATUS_VARIANTS[product.stockStatus] as any}>
                  {STOCK_STATUS_LABELS[product.stockStatus]}
                </Badge>
              </div>

              {/* Featured Badge */}
              {product.featured && (
                <div className="absolute top-4 right-4">
                  <Badge variant="primary">Featured</Badge>
                </div>
              )}

              {/* Wishlist */}
              <button
                type="button"
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center text-text-muted hover:text-error hover:border-error transition-colors"
                aria-label="Add to wishlist"
              >
                <Heart className="w-5 h-5" aria-hidden="true" />
              </button>

              {/* Navigation Arrows */}
              {allImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setSelectedImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center text-text hover:bg-background transition-colors"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-5 h-5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center text-text hover:bg-background transition-colors"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-5 h-5" aria-hidden="true" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {allImages.map((image, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setSelectedImageIndex(index)}
                    className={cn(
                      "relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all",
                      index === selectedImageIndex
                        ? "border-primary"
                        : "border-transparent hover:border-primary/50"
                    )}
                    aria-label={`View image ${index + 1}`}
                    aria-current={index === selectedImageIndex ? "true" : "false"}
                  >
                    <img
                      src={image}
                      alt={`${product.name} - thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Category & Name */}
            <div>
              <Link
                href={`/shop?category=${product.categoryId}`}
                className="text-sm text-primary font-medium hover:underline"
              >
                {product.categoryName}
              </Link>
              <h1 className="font-heading text-3xl md:text-4xl font-bold text-text mt-2">{product.name}</h1>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-4">
              <span className="font-heading text-3xl font-bold text-text">
                {totalPrice > basePrice ? (
                  <>
                    <span className="text-text-muted line-through text-xl mr-2">{formatPrice(basePrice)}</span>
                    {formatPrice(totalPrice)}
                  </>
                ) : (
                  formatPrice(basePrice)
                )}
              </span>
              {product.stockStatus === "made_to_order" && (
                <Badge variant="outline">Made to Order</Badge>
              )}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1" aria-label="5 out of 5 stars">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-warning fill-current" aria-hidden="true" />
                ))}
              </div>
              <span className="text-sm text-text-muted">Based on 24 reviews</span>
            </div>

            {/* Description */}
            <p className="text-text leading-relaxed">{product.description}</p>

            <Separator />

            {/* Colour Selection */}
            <div>
              <label className="block text-sm font-medium text-text mb-3">Select Colour</label>
              <div className="flex flex-wrap gap-3">
                {product.colours.map((colour) => (
                  <button
                    key={colour}
                    type="button"
                    onClick={() => setSelectedColour(colour)}
                    className={cn(
                      "relative flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all",
                      selectedColour === colour
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border hover:border-primary/50"
                    )}
                    aria-pressed={selectedColour === colour}
                  >
                    <span
                      className="w-6 h-6 rounded-full border border-border flex-shrink-0"
                      style={{ backgroundColor: colour.toLowerCase() }}
                    />
                    <span className="font-medium">{colour}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selector */}
            <div>
              <label className="block text-sm font-medium text-text mb-3">Quantity</label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-border rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="w-12 h-12 flex items-center justify-center text-text-muted hover:text-text hover:bg-surface transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-5 h-5" aria-hidden="true" />
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 h-12 text-center text-lg font-medium text-text border-x border-border focus:outline-none"
                    aria-label="Quantity"
                    min="1"
                    max="50"
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(50, quantity + 1))}
                    disabled={quantity >= 50}
                    className="w-12 h-12 flex items-center justify-center text-text-muted hover:text-text hover:bg-surface transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-5 h-5" aria-hidden="true" />
                  </button>
                </div>
                <span className="text-sm text-text-muted">Max 50 per order</span>
              </div>
            </div>

            {/* Customisation Options */}
            <div className="space-y-6 pt-6 border-t border-border">
              <h3 className="font-heading text-lg font-semibold text-text">Customise Your Order</h3>

              {/* Wrapping */}
              <div>
                <label className="block text-sm font-medium text-text mb-3">Gift Wrapping</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {WRAPPING_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setSelectedWrapping(option.id)}
                      className={cn(
                        "relative p-4 rounded-lg border-2 text-left transition-all",
                        selectedWrapping === option.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                      aria-pressed={selectedWrapping === option.id}
                    >
                      <div className="font-medium text-text">{option.name}</div>
                      <div className="text-sm text-text-muted mt-1">{option.description}</div>
                      {option.price > 0 && (
                        <div className="text-sm font-semibold text-primary mt-1">+{formatPrice(option.price)}</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message Card */}
              <div>
                <label className="block text-sm font-medium text-text mb-3">Message Card</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {MESSAGE_CARD_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setSelectedMessageCard(option.id)}
                      className={cn(
                        "relative p-4 rounded-lg border-2 text-left transition-all",
                        selectedMessageCard === option.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                      aria-pressed={selectedMessageCard === option.id}
                    >
                      <div className="font-medium text-text">{option.name}</div>
                      {option.description && (
                        <div className="text-sm text-text-muted mt-1">{option.description}</div>
                      )}
                      {option.price > 0 && (
                        <div className="text-sm font-semibold text-primary mt-1">+{formatPrice(option.price)}</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message Text Input */}
              {selectedMessageCard !== "none" && (
                <div>
                  <label htmlFor="message-text" className="block text-sm font-medium text-text mb-2">
                    Your Message <span className="text-error" aria-hidden="true">*</span>
                  </label>
                  <textarea
                    id="message-text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    rows={4}
                    className={cn(
                      "w-full px-4 py-3 bg-surface border rounded-lg text-text placeholder-text-muted resize-y",
                      showPersonalisationError && "border-error"
                    )}
                    placeholder="Enter your personal message (max 200 characters)"
                    maxLength={200}
                    aria-describedby={showPersonalisationError ? "message-error" : undefined}
                  />
                  {showPersonalisationError && (
                    <p id="message-error" className="mt-1 text-sm text-error" role="alert">
                      Please enter a message for the card
                    </p>
                  )}
                  <p className="mt-1 text-sm text-text-muted">{messageText.length}/200 characters</p>
                </div>
              )}

              {/* Personalisation */}
              <div>
                <label htmlFor="personalisation" className="block text-sm font-medium text-text mb-2">
                  Personalisation (Optional)
                </label>
                <Input
                  id="personalisation"
                  value={personalisation}
                  onChange={(e) => setPersonalisation(e.target.value)}
                  placeholder="e.g., Name, date, or special text to include on the flowers"
                  maxLength={100}
                  helperText="Max 100 characters. Additional charges may apply."
                />
              </div>
            </div>

            {/* Add to Cart */}
            <div className="pt-4 border-t border-border space-y-4">
              <Button
                size="lg"
                className="w-full"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                loading={addedToCart}
              >
                {addedToCart ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                    Added to Cart!
                  </>
                ) : isOutOfStock ? (
                  "Out of Stock"
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" aria-hidden="true" />
                    Add to Cart - {formatPrice(totalPrice)}
                  </>
                )}
              </Button>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-text-muted">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-primary" aria-hidden="true" />
                  <span>Free Delivery ₹999+</span>
                </div>
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-primary" aria-hidden="true" />
                  <span>7-Day Returns</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" aria-hidden="true" />
                  <span>Quality Guaranteed</span>
                </div>
              </div>
            </div>

            {/* Handmade Note */}
            <div className="bg-surface/50 border border-border rounded-lg p-4">
              <p className="text-sm text-text-muted flex items-center gap-2">
                <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                <span>Each flower is handmade with care. Slight variations in colour and shape are natural and make each piece unique.</span>
              </p>
            </div>
          </div>
        </div>

        {/* Related Products */}
        <section className="mt-16" aria-labelledby="related-heading">
          <div className="flex items-center justify-between mb-6">
            <h2 id="related-heading" className="font-heading text-2xl font-bold text-text">You May Also Like</h2>
            <Button variant="ghost" asChild>
              <Link href={`/shop?category=${product.categoryId}`}>View All {product.categoryName}</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProductsData.map((relatedProduct) => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </section>

        {/* Product Reviews Section */}
        <section className="mt-16" aria-labelledby="reviews-heading">
          <div className="flex items-center justify-between mb-6">
            <h2 id="reviews-heading" className="font-heading text-2xl font-bold text-text">Customer Reviews</h2>
            <Button variant="ghost" asChild>
              <Link href="/reviews">Read All Reviews</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Mock reviews for this product */}
            {[
              {
                name: "Priya S.",
                location: "Mumbai",
                rating: 5,
                text: "Absolutely beautiful! The red rose looks so realistic and the colour is exactly as shown. My husband loved it for our anniversary.",
                date: "2024-01-20",
                verified: true,
              },
              {
                name: "Arjun K.",
                location: "Delhi",
                rating: 5,
                text: "Great quality and fast delivery. The rose has been on my desk for 3 months and still looks fresh. Highly recommend!",
                date: "2024-02-15",
                verified: true,
              },
            ].map((review, index) => (
              <Card key={index} className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1" aria-label={`${review.rating} out of 5 stars`}>
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-warning fill-current" aria-hidden="true" />
                      ))}
                    </div>
                    {review.verified && (
                      <span className="text-xs text-success flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  <p className="text-text mb-3">"{review.text}"</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-text">{review.name}</p>
                      <p className="text-sm text-text-muted">{review.location}</p>
                    </div>
                    <p className="text-xs text-text-muted">{new Date(review.date).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

// Skeleton for loading state
function ProductDetailSkeleton() {
  return (
    <div className="container py-8 animate-pulse">
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
        <div className="space-y-4">
          <Skeleton variant="rectangular" className="aspect-square rounded-2xl" />
          <div className="flex gap-3">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} variant="rectangular" className="w-20 h-20 rounded-lg" />)}
          </div>
        </div>
        <div className="space-y-6">
          <Skeleton variant="text" className="w-1/4 h-4" />
          <Skeleton variant="text" className="w-3/4 h-8" />
          <Skeleton variant="text" className="w-1/2 h-10" />
          <Skeleton variant="text" className="w-1/3 h-6" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} variant="rectangular" className="h-10 rounded-lg" />)}
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} variant="rectangular" className="h-20 rounded-lg" />)}
          </div>
          <Skeleton variant="rectangular" className="h-14 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}