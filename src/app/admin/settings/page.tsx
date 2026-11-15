"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatPrice } from "@/lib/utils";
import { Save, Loader2, CheckCircle, AlertCircle } from "lucide-react";

interface Settings {
  businessName: string;
  whatsappNumber: string;
  instagramUrl: string;
  contactEmail: string;
  announcementText: string;
  packagingCharge: number;
  deliveryCharge: number;
  freeDeliveryThreshold: number;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    businessName: "",
    whatsappNumber: "",
    instagramUrl: "",
    contactEmail: "",
    announcementText: "",
    packagingCharge: 50,
    deliveryCharge: 100,
    freeDeliveryThreshold: 999,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/admin/settings", {
        credentials: "include",
      });
      const result = await response.json();
      if (result.success) {
        setSettings(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) || 0 : value,
    }));
    setSaveStatus("idle");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveStatus("idle");

    try {
      const response = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
        credentials: "include",
      });
      const result = await response.json();
      if (result.success) {
        setSaveStatus("success");
      } else {
        setSaveStatus("error");
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
      setSaveStatus("error");
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    fetchSettings();
    setSaveStatus("idle");
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-heading text-2xl lg:text-3xl font-bold text-text">Settings</h1>
            <p className="text-text-muted mt-1">Manage store settings and configuration</p>
          </div>
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="animate-pulse">
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-10 bg-border rounded" />
              <div className="h-10 bg-border rounded" />
              <div className="h-10 bg-border rounded" />
              <div className="h-10 bg-border rounded" />
            </CardContent>
          </Card>
          <Card className="animate-pulse">
            <CardHeader>
              <CardTitle>Pricing & Delivery</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-10 bg-border rounded" />
              <div className="h-10 bg-border rounded" />
              <div className="h-10 bg-border rounded" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-2xl lg:text-3xl font-bold text-text">Settings</h1>
          <p className="text-text-muted mt-1">Manage store settings and configuration</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={resetForm} disabled={isSaving}>
            Reset
          </Button>
          <Button onClick={handleSubmit} loading={isSaving} disabled={isLoading}>
            <Save className="w-4 h-4" aria-hidden="true" />
            {isSaving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>

      {saveStatus === "success" && (
        <div className="mb-6 flex items-center gap-2 p-3 bg-success/10 border border-success/30 rounded-lg text-success text-sm" role="alert">
          <CheckCircle className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
          Settings saved successfully!
        </div>
      )}

      {saveStatus === "error" && (
        <div className="mb-6 flex items-center gap-2 p-3 bg-error/10 border border-error/30 rounded-lg text-error text-sm" role="alert">
          <AlertCircle className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
          Failed to save settings. Please try again.
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-text">Business Name *</label>
              <Input
                name="businessName"
                placeholder="Duggu Arts"
                value={settings.businessName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-text">WhatsApp Business Number *</label>
              <Input
                name="whatsappNumber"
                placeholder="+91 XXXXX XXXXX"
                value={settings.whatsappNumber}
                onChange={handleChange}
                type="tel"
                required
                helperText="Format: +91 XXXXX XXXXX (used for WhatsApp checkout)"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-text">Instagram URL</label>
              <Input
                name="instagramUrl"
                placeholder="https://instagram.com/dugguarts"
                value={settings.instagramUrl}
                onChange={handleChange}
                type="url"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-text">Contact Email</label>
              <Input
                name="contactEmail"
                placeholder="hello@dugguarts.com"
                value={settings.contactEmail}
                onChange={handleChange}
                type="email"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-text">Announcement Bar Text</label>
              <Textarea
                name="announcementText"
                placeholder="Free delivery on orders above ₹999!"
                value={settings.announcementText}
                onChange={handleChange}
                rows={2}
                helperText="Shown in the announcement bar at the top of the site"
              />
            </div>
          </CardContent>
        </Card>

        {/* Pricing & Delivery */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing & Delivery</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid sm:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-text">Packaging Charge (₹)</label>
                <Input
                  name="packagingCharge"
                  type="number"
                  placeholder="50"
                  value={settings.packagingCharge}
                  onChange={handleChange}
                  min="0"
                  step="1"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-text">Delivery Charge (₹)</label>
                <Input
                  name="deliveryCharge"
                  type="number"
                  placeholder="100"
                  value={settings.deliveryCharge}
                  onChange={handleChange}
                  min="0"
                  step="1"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-text">Free Delivery Threshold (₹)</label>
                <Input
                  name="freeDeliveryThreshold"
                  type="number"
                  placeholder="999"
                  value={settings.freeDeliveryThreshold}
                  onChange={handleChange}
                  min="0"
                  step="1"
                  required
                />
              </div>
            </div>

            <div className="bg-surface/50 border border-border rounded-lg p-4">
              <h4 className="font-medium text-text mb-3">Pricing Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-muted">Packaging Charge</span>
                  <span className="text-text font-medium">{formatPrice(settings.packagingCharge)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Delivery Charge (orders under threshold)</span>
                  <span className="text-text font-medium">{formatPrice(settings.deliveryCharge)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Free Delivery Threshold</span>
                  <span className="text-text font-medium">{formatPrice(settings.freeDeliveryThreshold)}</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between font-medium">
                  <span className="text-text">Total Additional Charges (below threshold)</span>
                  <span className="text-text">{formatPrice(settings.packagingCharge + settings.deliveryCharge)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}