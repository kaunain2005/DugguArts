"use client";

import React, { useState, useEffect } from "react";
import { 
  User, 
  CheckCircle, 
  Loader2, 
  AlertCircle, 
  Check, 
  Sparkles, 
  Heart, 
  Gift, 
  Palette, 
  Calendar, 
  Flower2, 
  Plus, 
  Minus, 
  X, 
  Calendar as CalendarIcon 
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { BOUQUET_SIZES, WRAPPING_OPTIONS, MESSAGE_CARD_OPTIONS, COLOUR_PALETTE } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";

const FLOWER_TYPES = [
  { id: "roses", name: "Roses", icon: "🌹", description: "Classic elegance" },
  { id: "tulips", name: "Tulips", icon: "🌷", description: "Graceful blooms" },
  { id: "daisies", name: "Daisies", icon: "🌼", description: "Cheerful simplicity" },
  { id: "sunflowers", name: "Sunflowers", icon: "🌻", description: "Bright & bold" },
  { id: "lavender", name: "Lavender", icon: "🪻", description: "Fragrant & calming" },
  { id: "lilies", name: "Lilies", icon: "💮", description: "Elegant & pure" },
];

interface CustomOrderFormData {
  customerName: string;
  phone: string;
  email: string;
  flowers: string[];
  quantities: number[];
  colours: string[];
  bouquetSize: string;
  wrapping: string;
  budgetMin: number;
  budgetMax: number;
  messageCard: string;
  requiredDate: string;
  notes: string;
}

export default function CustomOrderPage() {
  const [formData, setFormData] = useState<CustomOrderFormData>({
    customerName: "",
    phone: "",
    email: "",
    flowers: [],
    quantities: [],
    colours: [],
    bouquetSize: "medium",
    wrapping: "paper",
    budgetMin: 500,
    budgetMax: 2000,
    messageCard: "standard",
    requiredDate: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CustomOrderFormData, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof CustomOrderFormData, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [reference, setReference] = useState("");

  const validateField = (name: keyof CustomOrderFormData, value: unknown): string | undefined => {
    switch (name) {
      case "customerName":
        if (!value || (value as string).length < 2) return "Name must be at least 2 characters";
        break;
      case "phone":
        if (!value || !(value as string).match(/^[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[(]?[0-9]{1,3}[)]?[-\s\.]?[0-9]{4,6}$/)) {
          return "Invalid phone number";
        }
        break;
      case "email":
        if (value && !(value as string).match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
          return "Invalid email address";
        }
        break;
      case "flowers":
        if (!(value as string[]).length) return "Select at least one flower type";
        break;
      case "quantities":
        if (!(value as number[]).length) return "Add quantities for each flower";
        break;
      case "colours":
        if (!(value as string[]).length) return "Select at least one colour";
        break;
      case "budgetMin":
        if ((value as number) < 0) return "Minimum budget must be positive";
        break;
      case "budgetMax":
        if ((value as number) < (formData.budgetMin || 0)) return "Maximum budget must be >= minimum budget";
        break;
      case "requiredDate":
        if (!value) return "Delivery date is required";
        break;
    }
    return undefined;
  };

  const handleChange = (name: keyof CustomOrderFormData, value: unknown) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleBlur = (name: keyof CustomOrderFormData, value: unknown) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    if (error) {
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CustomOrderFormData, string>> = {};
    let isValid = true;

    (Object.keys(formData) as Array<keyof CustomOrderFormData>).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setTouched(
      Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {}) as Partial<Record<keyof CustomOrderFormData, boolean>>
    );
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitError("");

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const ref = `CREQ${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      setReference(ref);
      setSubmitted(true);
    } catch (error) {
      setSubmitError("Failed to submit request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const addFlower = () => {
    if (formData.flowers.length >= 5) return;
    handleChange("flowers", [...formData.flowers, ""]);
    handleChange("quantities", [...formData.quantities, 1]);
  };

  const removeFlower = (index: number) => {
    const newFlowers = formData.flowers.filter((_, i) => i !== index);
    const newQuantities = formData.quantities.filter((_, i) => i !== index);
    handleChange("flowers", newFlowers);
    handleChange("quantities", newQuantities);
  };

  // Set default required date to tomorrow
  useEffect(() => {
    if (!formData.requiredDate) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setFormData(prev => ({ ...prev, requiredDate: tomorrow.toISOString().split('T')[0] }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (submitted) {
    return (
      <div className="container py-16 lg:py-24">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-green-500/10 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-500" aria-hidden="true" />
          </div>
          <h1 className="font-heading text-3xl font-bold text-text mb-4">Custom Bouquet Request Submitted!</h1>
          <p className="text-text-muted mb-4">
            Thank you for your custom bouquet request. Our team will review your requirements and contact you within 24 hours to discuss and provide a quote.
          </p>
          <div className="bg-surface border border-border rounded-xl p-6 mb-8 text-left">
            <p className="font-medium text-text mb-2">Reference Number:</p>
            <p className="font-heading text-2xl font-bold text-primary font-mono">{reference}</p>
            <p className="text-sm text-text-muted mt-4">
              Save this reference for future communication. We'll reach out via WhatsApp or email to confirm details.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <a href="/">Back to Home</a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="/shop">Browse Ready-Made Bouquets</a>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 lg:py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-text">Design Your Custom Bouquet</h1>
        <p className="text-text-muted mt-2">
          Tell us your vision and we'll create a one-of-a-kind bouquet just for you.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8" noValidate>
        {/* Contact Information */}
        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" aria-hidden="true" />
              </div>
              <h2 className="font-heading text-xl font-semibold text-text">Contact Information</h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                name="customerName"
                label="Full Name *"
                placeholder="Enter your full name"
                value={formData.customerName}
                onChange={(e) => handleChange("customerName", e.target.value)}
                onBlur={(e) => handleBlur("customerName", e.target.value)}
                error={touched.customerName ? (errors.customerName as string | undefined) : undefined}
                required
                autoComplete="name"
              />

              <Input
                name="phone"
                label="WhatsApp Number *"
                placeholder="+91 XXXXX XXXXX"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                onBlur={(e) => handleBlur("phone", e.target.value)}
                error={touched.phone ? (errors.phone as string | undefined) : undefined}
                required
                type="tel"
                autoComplete="tel"
              />
            </div>

            <Input
              name="email"
              label="Email (Optional)"
              placeholder="your@email.com"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              onBlur={(e) => handleBlur("email", e.target.value)}
              error={touched.email ? (errors.email as string | undefined) : undefined}
              type="email"
              autoComplete="email"
            />
          </CardContent>
        </Card>

        {/* Flower Selection */}
        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Flower2 className="w-5 h-5 text-primary" aria-hidden="true" />
              </div>
              <div>
                <h2 className="font-heading text-xl font-semibold text-text">Choose Your Flowers</h2>
                <p className="text-sm text-text-muted">Select up to 5 flower types and their quantities</p>
              </div>
            </div>

            {formData.flowers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-text-muted mb-4">Add at least one flower type to start designing</p>
                <Button variant="outline" type="button" onClick={addFlower}>
                  <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
                  Add Flower Type
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {formData.flowers.map((flower, index) => (
                    <div key={index} className="flex flex-col sm:flex-row gap-4 p-4 bg-surface rounded-lg border border-border">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-text mb-2">Flower Type {index + 1}</label>
                        <Select
                          name={`flowers[${index}]`}
                          value={flower}
                          onChange={(e) => {
                            const newFlowers = [...formData.flowers];
                            newFlowers[index] = e.target.value;
                            handleChange("flowers", newFlowers);
                          }}
                          options={FLOWER_TYPES.map(f => ({ value: f.id, label: `${f.icon} ${f.name} - ${f.description}` }))}
                          placeholder="Select flower type"
                          error={touched.flowers ? (errors.flowers as string | undefined) : undefined}
                        />
                      </div>
                      <div className="w-32">
                        <label className="block text-sm font-medium text-text mb-2">Quantity</label>
                        <div className="flex items-center border border-border rounded-lg overflow-hidden">
                          <button
                            type="button"
                            onClick={() => {
                              const newQuantities = [...formData.quantities];
                              newQuantities[index] = Math.max(1, newQuantities[index] - 1);
                              handleChange("quantities", newQuantities);
                            }}
                            className="px-3 py-2 text-text-muted hover:text-text hover:bg-surface transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-4 h-4" aria-hidden="true" />
                          </button>
                          <input
                            type="number"
                            value={formData.quantities[index] || 1}
                            onChange={(e) => {
                              const newQuantities = [...formData.quantities];
                              newQuantities[index] = Math.max(1, parseInt(e.target.value) || 1);
                              handleChange("quantities", newQuantities);
                            }}
                            className="w-full text-center text-base font-medium text-text border-x border-border focus:outline-none"
                            min="1"
                            max="50"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newQuantities = [...formData.quantities];
                              newQuantities[index] = Math.min(50, newQuantities[index] + 1);
                              handleChange("quantities", newQuantities);
                            }}
                            className="px-3 py-2 text-text-muted hover:text-text hover:bg-surface transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-4 h-4" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFlower(index)}
                        className="flex-shrink-0 p-2 text-text-muted hover:text-error hover:bg-error/10 rounded-lg transition-colors self-end"
                        aria-label={`Remove flower ${index + 1}`}
                      >
                        <X className="w-5 h-5" aria-hidden="true" />
                      </button>
                    </div>
                  ))}
                </div>

                {formData.flowers.length < 5 && (
                  <Button variant="outline" type="button" onClick={addFlower} className="w-full sm:w-auto">
                    <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
                    Add Another Flower Type
                  </Button>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Colour Preferences */}
        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Palette className="w-5 h-5 text-primary" aria-hidden="true" />
              </div>
              <div>
                <h2 className="font-heading text-xl font-semibold text-text">Colour Preferences</h2>
                <p className="text-sm text-text-muted">Select one or more colours for your bouquet</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {COLOUR_PALETTE.map((colour) => (
                <button
                  key={colour.name}
                  type="button"
                  onClick={() => {
                    const newColours = formData.colours.includes(colour.name)
                      ? formData.colours.filter(c => c !== colour.name)
                      : [...formData.colours, colour.name];
                    handleChange("colours", newColours);
                  }}
                  className={cn(
                    "relative flex flex-col items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all",
                    formData.colours.includes(colour.name)
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                  aria-pressed={formData.colours.includes(colour.name)}
                >
                  <span
                    className="w-10 h-10 rounded-full border border-border flex-shrink-0"
                    style={{ backgroundColor: colour.hex }}
                  />
                  <span className="text-sm font-medium text-text">{colour.name}</span>
                  {formData.colours.includes(colour.name) && (
                    <span className="absolute top-1 right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" aria-hidden="true" />
                    </span>
                  )}
                </button>
              ))}
            </div>

            {formData.colours.length === 0 && touched.colours && errors.colours && (
              <p className="text-sm text-error" role="alert">{errors.colours}</p>
            )}
          </CardContent>
        </Card>

        {/* Bouquet Size & Budget */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Gift className="w-5 h-5 text-primary" aria-hidden="true" />
                </div>
                <h2 className="font-heading text-xl font-semibold text-text">Bouquet Size</h2>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {BOUQUET_SIZES.map((size) => (
                  <button
                    key={size.id}
                    type="button"
                    onClick={() => handleChange("bouquetSize", size.id)}
                    className={cn(
                      "p-4 rounded-lg border-2 text-left transition-all",
                      formData.bouquetSize === size.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                    aria-pressed={formData.bouquetSize === size.id}
                  >
                    <div className="font-medium text-text">{size.name}</div>
                    <div className="text-sm text-text-muted mt-1">
                      {size.basePrice > 0 ? `+₹${size.basePrice}` : "Base price"}
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items_center justify-center">
                  <Sparkles className="w-5 h-5 text-primary" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="font-heading text-xl font-semibold text-text">Budget Range</h2>
                  <p className="text-sm text-text-muted">Helps us suggest the best options</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  name="budgetMin"
                  label="Minimum Budget (₹) *"
                  placeholder="500"
                  type="number"
                  value={formData.budgetMin}
                  onChange={(e) => handleChange("budgetMin", parseInt(e.target.value) || 0)}
                  onBlur={(e) => handleBlur("budgetMin", parseInt(e.target.value) || 0)}
                  error={touched.budgetMin ? (errors.budgetMin as string | undefined) : undefined}
                  min="0"
                  required
                />
                <Input
                  name="budgetMax"
                  label="Maximum Budget (₹) *"
                  placeholder="2000"
                  type="number"
                  value={formData.budgetMax}
                  onChange={(e) => handleChange("budgetMax", parseInt(e.target.value) || 0)}
                  onBlur={(e) => handleBlur("budgetMax", parseInt(e.target.value) || 0)}
                  error={touched.budgetMax ? (errors.budgetMax as string | undefined) : undefined}
                  min="0"
                  required
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Wrapping & Message Card */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items_center justify-center">
                  <Gift className="w-5 h-5 text-primary" aria-hidden="true" />
                </div>
                <h2 className="font-heading text-xl font-semibold text-text">Gift Wrapping</h2>
              </div>

              <div className="space-y-3">
                {WRAPPING_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleChange("wrapping", option.id)}
                    className={cn(
                      "w-full p-4 rounded-lg border-2 text-left transition-all",
                      formData.wrapping === option.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                    aria-pressed={formData.wrapping === option.id}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-text">{option.name}</div>
                        <div className="text-sm text-text-muted">
                          {option.id === "none" ? "Flowers shipped in protective packaging" :
                           option.id === "paper" ? "Eco-friendly brown kraft paper with twine" :
                           option.id === "cellophane" ? "Transparent cellophane with decorative bow" :
                           option.id === "fabric" ? "Premium fabric wrap in coordinating colour" :
                           "Rigid gift box with tissue paper"}
                        </div>
                      </div>
                      {option.price > 0 && (
                        <span className="text-sm font-semibold text-primary">+₹{option.price}</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items_center justify-center">
                  <Heart className="w-5 h-5 text-primary" aria-hidden="true" />
                </div>
                <h2 className="font-heading text-xl font-semibold text-text">Message Card</h2>
              </div>

              <div className="space-y-3">
                {MESSAGE_CARD_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleChange("messageCard", option.id)}
                    className={cn(
                      "w-full p-4 rounded-lg border-2 text-left transition-all",
                      formData.messageCard === option.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                    aria-pressed={formData.messageCard === option.id}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-text">{option.name}</div>
                        <div className="text-sm text-text-muted">
                          {option.id === "none" ? "No message card included" :
                           option.id === "standard" ? "Simple folded card with your message" :
                           "Thick cardstock with matching envelope"}
                        </div>
                      </div>
                      {option.price > 0 && (
                        <span className="text-sm font-semibold text-primary">+₹{option.price}</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {(formData.messageCard === "standard" || formData.messageCard === "premium") && (
                <Textarea
                  name="notes"
                  label="Your Message"
                  placeholder="Enter your personal message for the recipient..."
                  value={formData.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  rows={4}
                  maxLength={200}
                  helperText={`${formData.notes.length}/200 characters`}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Required Date & Notes */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items_center justify-center">
                  <CalendarIcon className="w-5 h-5 text-primary" aria-hidden="true" />
                </div>
                <h2 className="font-heading text-xl font-semibold text-text">Required Delivery Date</h2>
              </div>

              <Input
                name="requiredDate"
                label="Delivery Date *"
                type="date"
                value={formData.requiredDate}
                onChange={(e) => handleChange("requiredDate", e.target.value)}
                onBlur={(e) => handleBlur("requiredDate", e.target.value)}
                error={touched.requiredDate ? (errors.requiredDate as string | undefined) : undefined}
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items_center justify-center">
                  <Sparkles className="w-5 h-5 text-primary" aria-hidden="true" />
                </div>
                <h2 className="font-heading text-xl font-semibold text-text">Additional Notes</h2>
              </div>

              <Textarea
                name="notes"
                label="Special Instructions (Optional)"
                placeholder="Any special delivery instructions, preferred time, allergies, etc."
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                rows={4}
                maxLength={500}
              />
            </CardContent>
          </Card>
        </div>

        {/* Submit Button */}
        <div className="space-y-4">
          <Button
            type="submit"
            size="lg"
            className="w-full"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                Submitting...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" aria-hidden="true" />
                Submit Custom Bouquet Request
              </>
            )}
          </Button>

          {submitError && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm" role="alert">
              <AlertCircle className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
              {submitError}
            </div>
          )}

          <p className="text-xs text-text-muted text-center">
            This creates an enquiry. Our team will contact you via WhatsApp within 24 hours to confirm details, final price, and delivery.
            <br />
            No payment required at this stage.
          </p>
        </div>
      </form>
    </div>
  );
}