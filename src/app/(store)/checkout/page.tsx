"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Truck, RotateCcw, Shield, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useCart } from "@/context/CartContext";
import { cn, formatPrice } from "@/lib/utils";
import { generateOrderReference } from "@/lib/whatsapp";
import type { CartItem } from "@/context/CartContext";
import { checkoutSchema, type CheckoutFormData, type CheckoutFormFields } from "@/lib/validations";
import { generateWhatsAppMessage, generateWhatsAppUrl, openWhatsAppCheckout } from "@/lib/whatsapp";

const STATES = [
  { value: "", label: "Select State" },
  { value: "Andhra Pradesh", label: "Andhra Pradesh" },
  { value: "Arunachal Pradesh", label: "Arunachal Pradesh" },
  { value: "Assam", label: "Assam" },
  { value: "Bihar", label: "Bihar" },
  { value: "Chhattisgarh", label: "Chhattisgarh" },
  { value: "Goa", label: "Goa" },
  { value: "Gujarat", label: "Gujarat" },
  { value: "Haryana", label: "Haryana" },
  { value: "Himachal Pradesh", label: "Himachal Pradesh" },
  { value: "Jharkhand", label: "Jharkhand" },
  { value: "Karnataka", label: "Karnataka" },
  { value: "Kerala", label: "Kerala" },
  { value: "Madhya Pradesh", label: "Madhya Pradesh" },
  { value: "Maharashtra", label: "Maharashtra" },
  { value: "Manipur", label: "Manipur" },
  { value: "Meghalaya", label: "Meghalaya" },
  { value: "Mizoram", label: "Mizoram" },
  { value: "Nagaland", label: "Nagaland" },
  { value: "Odisha", label: "Odisha" },
  { value: "Punjab", label: "Punjab" },
  { value: "Rajasthan", label: "Rajasthan" },
  { value: "Sikkim", label: "Sikkim" },
  { value: "Tamil Nadu", label: "Tamil Nadu" },
  { value: "Telangana", label: "Telangana" },
  { value: "Tripura", label: "Tripura" },
  { value: "Uttar Pradesh", label: "Uttar Pradesh" },
  { value: "Uttarakhand", label: "Uttarakhand" },
  { value: "West Bengal", label: "West Bengal" },
  { value: "Delhi", label: "Delhi" },
  { value: "Jammu and Kashmir", label: "Jammu and Kashmir" },
  { value: "Ladakh", label: "Ladakh" },
  { value: "Chandigarh", label: "Chandigarh" },
  { value: "Dadra and Nagar Haveli", label: "Dadra and Nagar Haveli" },
  { value: "Daman and Diu", label: "Daman and Diu" },
  { value: "Lakshadweep", label: "Lakshadweep" },
  { value: "Puducherry", label: "Puducherry" },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const [formData, setFormData] = useState<CheckoutFormFields>({
    customerName: "",
    phone: "",
    email: "",
    deliveryAddress: "",
    pincode: "",
    city: "",
    state: "",
    customerNotes: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutFormFields, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof CheckoutFormData, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [orderCreated, setOrderCreated] = useState(false);
  const [orderReference, setOrderReference] = useState("");

  useEffect(() => {
    if (items.length === 0 && !orderCreated) {
      router.push("/cart");
    }
  }, [items.length, router, orderCreated]);

  const itemTotal = (item: CartItem) => item.price * item.quantity;
  const packagingCharge = items.length > 0 ? 50 : 0;
  const deliveryCharge = items.length > 0 && subtotal < 999 ? 100 : 0;
  const total = subtotal + packagingCharge + deliveryCharge;

  const validateField = (name: keyof CheckoutFormData, value: string | string[] | object | undefined): string | undefined => {
    if (name === "items") {
      const itemsArray = value as Array<{ productId: string; quantity: number }>;
      if (!itemsArray || itemsArray.length === 0) {
        return "At least one item is required";
      }
      return undefined;
    }
    
    const val = value ?? "";
    try {
      checkoutSchema.shape[name as keyof typeof checkoutSchema.shape].parse(val);
      return undefined;
    } catch (error) {
      if (error instanceof Error) return error.message;
      return "Invalid value";
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    if (errors[name as keyof CheckoutFormFields]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name as keyof CheckoutFormData, value);
    if (error) {
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CheckoutFormFields, string>> = {};
    let isValid = true;

    (Object.keys(formData) as Array<keyof CheckoutFormFields>).forEach((key) => {
      const error = validateField(key as keyof CheckoutFormData, formData[key]);
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setTouched(
      Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {}) as Partial<Record<keyof CheckoutFormFields, boolean>>
    );
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitError("");

    try {
      // Prepare order data for API
      const orderData: Record<string, unknown> = {
        customerName: formData.customerName,
        phone: formData.phone,
        email: formData.email,
        deliveryAddress: formData.deliveryAddress,
        pincode: formData.pincode,
        city: formData.city,
        state: formData.state,
        customerNotes: formData.customerNotes,
        items: items.map((item: CartItem) => ({
          productId: item.productId,
          quantity: item.quantity,
          selectedColour: item.selectedColour,
          personalisation: item.personalisation,
          wrapping: item.wrapping,
          messageCard: item.messageCard,
        })),
      };

      // Create order via API
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || "Failed to create order");
      }

      // Generate order reference (matching backend)
      const reference = generateOrderReference();
      setOrderReference(reference);

      // Prepare WhatsApp data with the order reference
      const whatsappData = {
        orderId: reference,
        items: items.map(item => ({
          ...item,
          name: item.name,
          price: item.price,
        })),
        subtotal,
        packagingCharge,
        deliveryCharge,
        totalAmount: total,
        customerName: formData.customerName,
        phone: formData.phone,
        email: formData.email,
        deliveryAddress: formData.deliveryAddress,
        pincode: formData.pincode,
        city: formData.city,
        state: formData.state,
        customerNotes: formData.customerNotes,
      };

      // Open WhatsApp
      openWhatsAppCheckout(whatsappData);

      // Clear cart and show success
      clearCart();
      setOrderCreated(true);

    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Failed to create order. Please try again.");
      console.error("Checkout error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0 && !orderCreated) {
    return null;
  }

  if (orderCreated) {
    return (
      <div className="container py-16 lg:py-24">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-success/10 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-success" aria-hidden="true" />
          </div>
          <h1 className="font-heading text-3xl font-bold text-text mb-4">Order Enquiry Created!</h1>
          <p className="text-text-muted mb-4">
            Your order enquiry has been submitted. We've opened WhatsApp with your order details.
          </p>
          <div className="bg-surface border border-border rounded-xl p-6 mb-8 text-left">
            <p className="font-medium text-text mb-2">Order Reference:</p>
            <p className="font-heading text-2xl font-bold text-primary font-mono">{orderReference}</p>
            <p className="text-sm text-text-muted mt-4">
              Please complete the conversation on WhatsApp to confirm your order. Our team will contact you shortly to confirm availability, delivery charges, and payment details.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/">Continue Shopping</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/shop">Browse More Products</Link>
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
        <Link
          href="/cart"
          className="inline-flex items-center gap-2 text-text-muted hover:text-text transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" aria-hidden="true" />
          Back to Cart
        </Link>
        <h1 className="font-heading text-3xl font-bold text-text">Checkout</h1>
        <p className="text-text-muted mt-1">Enter your details to place an order enquiry via WhatsApp</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} noValidate>
            {/* Contact Information */}
            <Card>
              <CardContent className="p-6 space-y-6">
                <h2 className="font-heading text-lg font-semibold text-text">Contact Information</h2>

                <div className="grid sm:grid-cols-2 gap-4">
                  <Input
                    name="customerName"
                    label="Full Name *"
                    placeholder="Enter your full name"
                    value={formData.customerName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.customerName ? errors.customerName : undefined}
                    required
                    autoComplete="name"
                  />

                  <Input
                    name="phone"
                    label="WhatsApp Number *"
                    placeholder="+91 XXXXX XXXXX"
                    value={formData.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.phone ? errors.phone : undefined}
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
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.email ? errors.email : undefined}
                  type="email"
                  autoComplete="email"
                />
              </CardContent>
            </Card>

            {/* Delivery Address */}
            <Card>
              <CardContent className="p-6 space-y-6">
                <h2 className="font-heading text-lg font-semibold text-text">Delivery Address</h2>

                <Textarea
                  name="deliveryAddress"
                  label="Full Address *"
                  placeholder="House/Flat No., Building, Street, Area/Locality"
                  value={formData.deliveryAddress}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.deliveryAddress ? errors.deliveryAddress : undefined}
                  rows={3}
                  required
                  autoComplete="street-address"
                />

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Input
                    name="pincode"
                    label="Pincode *"
                    placeholder="123456"
                    value={formData.pincode}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.pincode ? errors.pincode : undefined}
                    required
                    maxLength={6}
                    autoComplete="postal-code"
                  />

                  <Input
                    name="city"
                    label="City *"
                    placeholder="Mumbai"
                    value={formData.city}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.city ? errors.city : undefined}
                    required
                    autoComplete="address-level2"
                  />

                  <Select
                    name="state"
                    label="State *"
                    value={formData.state}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.state ? errors.state : undefined}
                    options={STATES}
                    placeholder="Select State"
                    required
                    autoComplete="address-level1"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Order Notes */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h2 className="font-heading text-lg font-semibold text-text">Order Notes (Optional)</h2>
                <Textarea
                  name="customerNotes"
                  label="Special Instructions"
                  placeholder="Any special delivery instructions, preferred delivery time, etc."
                  value={formData.customerNotes}
                  onChange={handleChange}
                  rows={3}
                  maxLength={500}
                />
              </CardContent>
            </Card>

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
                    Creating Order...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.472-.324-.273-.512.2-.19.648-.149.828.149.28.297 1.28.867 2.03.967.372.05.5.365.412.514-.082.149-1.078.447-2.008.194-.53-.148-.947-.447-.997-.596-.05-.148.195-.298.413-.248.196.05.447-.099.512-.382.02-.1.03-.199.01-.297.01-.098.249-.396.634-.496.2-.049.453-.05.695.099.248.148.648.496.873.995.198.447.298.919.2.1-.098.05-.198.05-.348 0 .149-.247.198-.463.298-.324.148-.973 0-1.172-.447-.2-.397-.2-.647-.01-.897.373-.496 1.35-.79 1.748-.995.297-.148.5-.198.698-.099.197.099.397.497.397.746 0 .148-.347.198-.448.248.249-.098.497.099.678.348zM5.922 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.472-.324.273-.512-.2-.19-.648-.149.828-.149-.28.297-1.28.867-2.03.967-.372.05-.5.365-.412.514.082.149 1.078.447 2.008.194.53-.148.947-.447.997-.596.05-.148-.195-.298-.413-.248-.196.05-.447-.099.512-.382-.02-.1-.03-.199-.01-.297.01-.098.249-.396.634-.496.2-.049.453-.05.695.099.248.148.648.496.873.995.198.447.298.919.2.1-.098.05-.198.05-.348 0 .149-.247.198-.463.298-.324.148-.973 0-1.172-.447-.2-.397-.2-.647-.01-.897.373-.496 1.35-.79 1.748-.995.297-.148.5-.198.698-.099.197.099.397.497.397.746 0 .148-.347.198-.448.248.249-.098.497.099.678.348zM5.922 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.472-.324.273-.512-.2-.19-.648-.149.828-.149-.28.297-1.28.867-2.03.967-.372.05-.5.365-.412.514.082.149 1.078.447 2.008.194.53-.148.947-.447.997-.596.05-.148-.195-.298-.413-.248-.196.05-.447-.099.512-.382-.02-.1-.03-.199-.01-.297.01-.098.249-.396.634-.496.2-.049.453-.05.695.099.248.148.648.496.873.995.198.447.298.919.2.1-.098.05-.198.05-.348 0 .149-.247.198-.463.298-.324.148-.973 0-1.172-.447-.2-.397-.2-.647-.01-.897.373-.496 1.35-.79 1.748-.995.297-.148.5-.198.698-.099.197.099.397.497.397.746 0 .148-.347.198-.448.248.249-.098.497.099.678.348zM5.922 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.472-.324.273-.512-.2-.19-.648-.149.828-.149-.28.297-1.28.867-2.03.967-.372.05-.5.365-.412.514.082.149 1.078.447 2.008.194.53-.148.947-.447.997-.596.05-.148-.195-.298-.413-.248-.196.05-.447-.099.512-.382-.02-.1-.03-.199-.01-.297.01-.098.249-.396.634-.496.2-.049.453-.05.695.099.248.148.648.496.873.995.198.447.298.919.2.1-.098.05-.198.05-.348 0 .149-.247.198-.463.298-.324.148-.973 0-1.172-.447-.2-.397-.2-.647-.01-.897.373-.496 1.35-.79 1.748-.995.297-.148.5-.198.698-.099.197.099.397.497.397.746 0 .148-.347.198-.448.248.249-.098.497.099.678.348zM5.922 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.472-.324.273-.512-.2-.19-.648-.149.828-.149-.28.297-1.28.867-2.03.967-.372.05-.5.365-.412.514.082.149 1.078.447 2.008.194.53-.148.947-.447.997-.596.05-.148-.195-.298-.413-.248-.196.05-.447-.099.512-.382-.02-.1-.03-.199-.01-.297.01-.098.249-.396.634-.496.2-.049.453-.05.695.099.248.148.648.496.873.995.198.447.298.919.2.1-.098.05-.198.05-.348 0 .149-.247.198-.463.298-.324.148-.973 0-1.172-.447-.2-.397-.2-.647-.01-.897-.373.496-1.35.79-1.748.995-.297.148-.5.198-.698.099-.197-.099-.397-.497-.397-.746 0-.148.347-.198.448-.248.249-.098.497.099.678.348zM5.922 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.472-.324.273-.512-.2-.19-.648-.149.828-.149-.28.297-1.28.867-2.03.967-.372.05-.5.365-.412.514.082.149 1.078.447 2.008.194.53-.148.947-.447.997-.596.05-.148-.195-.298-.413-.248-.196.05-.447-.099.512-.382-.02-.1-.03-.199-.01-.297.01-.098.249-.396.634-.496.2-.049.453-.05.695.099.248.148.648.496.873.995.198.447.298.919.2.1-.098.05-.198.05-.348 0-.149.247-.198.463.298-.324.148-.973 0-1.172-.447-.2-.397-.2-.647-.01-.897-.373.496-1.35.79-1.748.995-.297.148-.5.198-.698.099-.197-.099-.397-.497-.397-.746 0-.148.347-.198.448-.248.249-.098.497.099.678.348zM5.922 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.472-.324.273-.512-.2-.19-.648-.149.828-.149-.28.297-1.28.867-2.03.967-.372.05-.5.365-.412.514.082.149 1.078.447 2.008.194.53-.148.947-.447.997-.596.05-.148-.195-.298-.413-.248-.196.05-.447-.099.512-.382-.02-.1-.03-.199-.01-.297.01-.098.249-.396.634-.496.2-.049.453-.05.695.099.248.148.648.496.873.995.198.447.298.919.2.1-.098.05-.198.05-.348 0-.149.247-.198.463.298-.324.148-.973 0-1.172-.447-.2-.397-.2-.647-.01-.897-.373.496-1.35.79-1.748.995-.297.148-.5.198-.698.099-.197-.099-.397-.497-.397-.746 0-.148.347-.198.448-.248.249-.098.497.099.678.348zM5.922 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.472-.324.273-.512-.2-.19-.648-.149.828-.149-.28.297-1.28.867-2.03.967-.372.05-.5.365-.412.514.082.149 1.078.447 2.008.194.53-.148.947-.447.997-.596.05-.148-.195-.298-.413-.248-.196.05-.447-.099.512-.382-.02-.1-.03-.199-.01-.297.01-.098.249-.396.634-.496.2-.049.453-.05.695.099.248.148.648.496.873.995.198.447.298.919.2.1-.098.05-.198.05-.348 0-.149.247-.198.463.298-.324.148-.973 0-1.172-.447-.2-.397-.2-.647-.01-.897-.373.496-1.35.79-1.748.995-.297.148-.5.198-.698.099-.197-.099-.397-.497-.397-.746 0-.148.347-.198.448-.248.249-.098.497.099.678.348zM5.922 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.472-.324.273-.512-.2-.19-.648-.149.828-.149-.28.297-1.28.867-2.03.967-.372.05-.5.365-.412.514.082.149 1.078.447 2.008.194.53-.148.947-.447.997-.596.05-.148-.195-.298-.413-.248-.196.05-.447-.099.512-.382-.02-.1-.03-.199-.01-.297.01-.098.249-.396.634-.496.2-.049.453-.05.695.099.248.148.648.496.873.995.198.447.298.919.2.1-.098.05-.198.05-.348 0-.149.247-.198.463.298-.324.148-.973 0-1.172-.447-.2-.397-.2-.647-.01-.897-.373.496-1.35.79-1.748.995-.297.148-.5.198-.698.099-.197-.099-.397-.497-.397-.746 0-.148.347-.198.448-.248.249-.098.497.099.678.348zM5.922 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.472-.324.273-.512-.2-.19-.648-.149.828-.149-.28.297-1.28.867-2.03.967-.372.05-.5.365-.412.514.082.149 1.078.447 2.008.194.53-.148.947-.447.997-.596.05-.148-.195-.298-.413-.248-.196.05-.447-.099.512-.382-.02-.1-.03-.199-.01-.297.01-.098.249-.396.634-.496.2-.049.453-.05.695.099.248.148.648.496.873.995.198.447.298.919.2.1-.098.05-.198.05-.348 0-.149.247-.198.463.298-.324.148-.973 0-1.172-.447-.2-.397-.2-.647-.01-.897-.373.496-1.35.79-1.748.995-.297.148-.5.198-.698.099-.197-.099-.397-.497-.397-.746 0-.148.347-.198.448-.248.249-.098.497.099.678.348zM5.922 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.472-.324.273-.512-.2-.19-.648-.149.828-.149-.28.297-1.28.867-2.03.967-.372.05-.5.365-.412.514.082.149 1.078.447 2.008.194.53-.148.947-.447.997-.596.05-.148-.195-.298-.413-.248-.196.05-.447-.099.512-.382-.02-.1-.03-.199-.01-.297.01-.098.249-.396.634-.496.2-.049.453-.05.695.099.248.148.648.496.873.995.198.447.298.919.2.1-.098.05-.198.05-.348 0-.149.247-.198.463.298-.324.148-.973 0-1.172-.447-.2-.397-.2-.647-.01-.897-.373.496-1.35.79-1.748.995-.297.148-.5.198-.698.099-.197-.099-.397-.497-.397-.746 0-.148.347-.198.448-.248.249-.098.497.099.678.348zM5.922 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.472-.324.273-.512-.2-.19-.648-.149.828-.149-.28.297-1.28.867-2.03.967-.372.05-.5.365-.412.514.082.149 1.078.447 2.008.194.53-.148.947-.447.997-.596.05-.148-.195-.298-.413-.248-.196.05-.447-.099.512-.382-.02-.1-.03-.199-.01-.297.01-.098.249-.396.634-.496.2-.049.453-.05.695.099.248.148.648.496.873.995.198.447.298.919.2.1-.098.05-.198.05-.348 0-.149.247-.198.463.298-.324.148-.973 0-1.172-.447-.2-.397-.2-.647-.01-.897-.373.496-1.35.79-1.748.995-.297.148-.5.198-.698.099-.197-.099-.397-.497-.397-.746 0-.148.347-.198.448-.248.249-.098.497.099.678.348z"/></svg>
                    Proceed to WhatsApp
                  </>
                )}
              </Button>

              {submitError && (
                <div className="flex items-center gap-2 p-3 bg-error/10 border border-error/30 rounded-lg text-error text-sm" role="alert">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                  {submitError}
                </div>
              )}

              <p className="text-xs text-text-muted text-center">
                By proceeding, you'll be redirected to WhatsApp with your order details pre-filled.
                <br />
                This creates an enquiry - your order is confirmed only after our team contacts you.
              </p>
            </div>
          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardContent className="p-6 space-y-4">
              <h2 className="font-heading text-lg font-semibold text-text">Order Summary</h2>

              {/* Items List */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden bg-surface">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text truncate">{item.name}</p>
                      <p className="text-xs text-text-muted">Qty: {item.quantity}</p>
                      {item.selectedColour && <p className="text-xs text-text-muted">Colour: {item.selectedColour}</p>}
                      {item.wrapping && <p className="text-xs text-text-muted">Gift Wrapped</p>}
                      {item.messageCard && <p className="text-xs text-text-muted">Message Card</p>}
                    </div>
                    <span className="text-sm font-bold text-text">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Subtotal</span>
                  <span className="text-text font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Packaging</span>
                  <span className="text-text font-medium">{formatPrice(packagingCharge)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Delivery</span>
                  <span className="text-text font-medium">
                    {subtotal >= 999 ? (
                      <>
                        <span className="text-success">Free</span>
                        <Badge variant="outline" className="ml-2 text-xs">₹999+</Badge>
                      </>
                    ) : (
                      formatPrice(deliveryCharge)
                    )}
                  </span>
                </div>

                {subtotal < 999 && subtotal > 0 && (
                  <p className="text-xs text-primary bg-primary/10 px-3 py-2 rounded-lg text-center">
                    Add ₹{999 - subtotal} more for free delivery!
                  </p>
                )}

                <div className="border-t border-border pt-3 flex justify-between text-lg font-bold">
                  <span className="text-text">Total</span>
                  <span className="text-text">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="border-t border-border pt-4 space-y-3">
                <div className="flex items-center gap-3 text-sm text-text-muted">
                  <Truck className="w-5 h-5 text-primary flex-shrink-0" aria-hidden="true" />
                  <span>Free Delivery ₹999+</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-text-muted">
                  <RotateCcw className="w-5 h-5 text-primary flex-shrink-0" aria-hidden="true" />
                  <span>7-Day Returns</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-text-muted">
                  <Shield className="w-5 h-5 text-primary flex-shrink-0" aria-hidden="true" />
                  <span>Quality Guaranteed</span>
                </div>
              </div>

              <p className="text-xs text-text-muted text-center">
                No payment required now. Order confirmed via WhatsApp after team verification.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}