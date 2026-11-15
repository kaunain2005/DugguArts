"use client";

import React, { useState, useEffect } from "react";
import { Mail, MapPin, Phone, MessageSquare, Clock, Send, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatPrice } from "@/lib/utils";

const CONTACT_REASONS = [
  { value: "", label: "Select a topic" },
  { value: "general", label: "General Inquiry" },
  { value: "order", label: "Order Related" },
  { value: "custom", label: "Custom Bouquet" },
  { value: "wholesale", label: "Wholesale/Bulk Orders" },
  { value: "feedback", label: "Feedback/Complaint" },
  { value: "press", label: "Press/Media" },
  { value: "other", label: "Other" },
];

const FAQ = [
  {
    question: "How long do the flowers last?",
    answer: "Our pipe cleaner flowers last indefinitely! They don't wilt, fade, or require water. With proper care (keeping them away from direct sunlight and moisture), they'll maintain their beauty for years.",
  },
  {
    question: "Can I customize my bouquet?",
    answer: "Absolutely! We offer a full custom bouquet service where you can choose flower types, colours, size, wrapping, and add personal messages. Visit our Custom Bouquet page to design yours.",
  },
  {
    question: "What is your delivery time?",
    answer: "Standard delivery takes 5-7 business days within India. Custom bouquets may take 7-10 business days as they're made to order. Express delivery options are available for select locations.",
  },
  {
    question: "Do you offer gift wrapping?",
    answer: "Yes! We offer multiple gift wrapping options including eco-friendly kraft paper, clear cellophane, premium fabric wraps, and gift boxes. You can select your preferred option at checkout.",
  },
  {
    question: "What's your return policy?",
    answer: "We offer a 7-day return policy for unused items in original condition. Custom/personalized items are non-returnable unless there's a quality issue. Contact us within 7 days of delivery to initiate a return.",
  },
  {
    question: "How do I care for my pipe cleaner flowers?",
    answer: "Simply dust them gently with a soft brush or cloth. Avoid direct sunlight, water, and humidity. They don't need any special maintenance - just enjoy their eternal beauty!",
  },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    reason: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case "name":
        if (!value.trim()) return "Name is required";
        if (value.trim().length < 2) return "Name must be at least 2 characters";
        break;
      case "email":
        if (!value.trim()) return "Email is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Invalid email address";
        break;
      case "phone":
        if (!value.trim()) return "Phone number is required";
        if (!/^[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[(]?[0-9]{1,3}[)]?[-\s\.]?[0-9]{4,6}$/.test(value)) return "Invalid phone number";
        break;
      case "reason":
        if (!value) return "Please select a reason";
        break;
      case "subject":
        if (!value.trim()) return "Subject is required";
        if (value.trim().length < 5) return "Subject must be at least 5 characters";
        break;
      case "message":
        if (!value.trim()) return "Message is required";
        if (value.trim().length < 20) return "Message must be at least 20 characters";
        break;
    }
    return undefined;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error on change
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    if (error) {
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    (Object.keys(formData) as Array<keyof typeof formData>).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setTouched(
      Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {}) as Record<string, boolean>
    );
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      // In production, this would call your backend API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate API call - replace with actual endpoint
      // const response = await fetch('/api/contact', { ... });
      
      setSubmitStatus("success");
      setFormData({ name: "", email: "", phone: "", reason: "", subject: "", message: "" });
      setTouched({});
    } catch (error) {
      setSubmitStatus("error");
      console.error("Contact form error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleFaq = (question: string) => {
    setOpenFaq(prev => prev === question ? null : question);
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" aria-hidden="true" />
        <div className="container relative z-10 py-20 visible-by-default">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
              Get in Touch
            </span>
            <h1 className="font-heading font-bold text-5xl md:text-6xl text-text mb-6">
              We'd Love to{" "}
              <span className="text-primary">Hear From You</span>
            </h1>
            <p className="text-lg md:text-xl text-text-muted mb-10 max-w-2xl mx-auto">
              Have questions about our flowers, need help with an order, or want to collaborate?
              Our team is here to help.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info & Form */}
      <section className="section" aria-labelledby="contact-heading">
        <div className="container">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="lg:col-span-1 space-y-8">
              <div className="sticky top-24">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="w-5 h-5 text-primary" aria-hidden="true" />
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Mail className="w-5 h-5 text-primary" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text">Email Us</p>
                        <p className="text-text-muted">hello@dugguarts.com</p>
                        <p className="text-xs text-text-muted mt-1">We respond within 24 hours</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Phone className="w-5 h-5 text-primary" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text">Call / WhatsApp</p>
                        <p className="text-text-muted">+91 XXXXX XXXXX</p>
                        <p className="text-xs text-text-muted mt-1">Mon-Sat, 10 AM - 6 PM IST</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5 text-primary" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text">Visit Us</p>
                        <p className="text-text-muted">123 Flower Street, Garden City, GC 560001</p>
                        <p className="text-xs text-text-muted mt-1">By appointment only</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Clock className="w-5 h-5 text-primary" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text">Business Hours</p>
                        <p className="text-text-muted">Monday - Saturday: 10:00 AM - 6:00 PM</p>
                        <p className="text-text-muted">Sunday: Closed</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Links */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-primary" aria-hidden="true" />
                      Quick Links
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="ghost" className="w-full justify-start" asChild>
                      <a href="/custom-order">Custom Bouquet Inquiry</a>
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" asChild>
                      <a href="/policies#shipping">Shipping Information</a>
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" asChild>
                      <a href="/policies#returns">Returns & Refunds</a>
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" asChild>
                      <a href="https://wa.me/91XXXXXXXXXX" target="_blank" rel="noopener noreferrer">
                        WhatsApp Us Directly
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Send Us a Message</CardTitle>
                  <p className="text-text-muted mt-1">Fill out the form and we'll get back to you as soon as possible.</p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} noValidate className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-6">
                      <Input
                        name="name"
                        label="Full Name *"
                        placeholder="Your name"
                        value={formData.name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.name ? errors.name : undefined}
                        required
                        autoComplete="name"
                      />

                      <Input
                        name="email"
                        label="Email Address *"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.email ? errors.email : undefined}
                        required
                        type="email"
                        autoComplete="email"
                      />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-6">
                      <Input
                        name="phone"
                        label="Phone Number *"
                        placeholder="+91 XXXXX XXXXX"
                        value={formData.phone}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.phone ? errors.phone : undefined}
                        required
                        type="tel"
                        autoComplete="tel"
                      />

                      <Select
                        name="reason"
                        label="Reason for Contact *"
                        value={formData.reason}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.reason ? errors.reason : undefined}
                        options={CONTACT_REASONS}
                        required
                      />
                    </div>

                    <Input
                      name="subject"
                      label="Subject *"
                      placeholder="Brief summary of your inquiry"
                      value={formData.subject}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.subject ? errors.subject : undefined}
                      required
                    />

                    <Textarea
                      name="message"
                      label="Message *"
                      placeholder="Tell us how we can help you..."
                      value={formData.message}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.message ? errors.message : undefined}
                      rows={6}
                      required
                      minLength={20}
                    />

                    <div className="flex items-center gap-3">
                      <Button
                        type="submit"
                        size="lg"
                        loading={isSubmitting}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5" aria-hidden="true" />
                            Send Message
                          </>
                        )}
                      </Button>

                      {submitStatus === "success" && (
                        <div className="flex items-center gap-2 text-success text-sm">
                          <CheckCircle className="w-5 h-5" aria-hidden="true" />
                          Message sent successfully! We'll reply within 24 hours.
                        </div>
                      )}

                      {submitStatus === "error" && (
                        <div className="flex items-center gap-2 text-error text-sm">
                          <AlertCircle className="w-5 h-5" aria-hidden="true" />
                          Failed to send. Please try again or contact us directly.
                        </div>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section bg-surface/50" aria-labelledby="faq-heading">
        <div className="container">
          <div className="text-center mb-12">
            <h2 id="faq-heading" className="font-heading text-3xl md:text-4xl font-bold text-text mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-text-muted max-w-2xl mx-auto">
              Quick answers to common questions. Can't find what you're looking for?
              <Button variant="ghost" className="ml-2" asChild>
                <a href="#contact-form">Contact Us</a>
              </Button>
            </p>
          </div>
          <div className="max-w-3xl mx-auto">
            <div className="space-y-4">
              {FAQ.map((item, index) => (
                <Card key={index} className="overflow-hidden" variant="outlined">
                  <button
                    type="button"
                    onClick={() => toggleFaq(item.question)}
                    className="w-full p-6 text-left flex items-center justify-between gap-4 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2"
                    aria-expanded={openFaq === item.question}
                    aria-controls={`faq-${index}`}
                  >
                    <h3 className="font-heading text-lg font-semibold text-text flex-1">
                      {item.question}
                    </h3>
                    <MessageSquare 
                      className={`w-5 h-5 text-text-muted flex-shrink-0 transition-transform ${openFaq === item.question ? 'rotate-180' : ''}`}
                      aria-hidden="true"
                    />
                  </button>
                  <div
                    id={`faq-${index}`}
                    role="region"
                    aria-labelledby={`faq-${index}`}
                    className="overflow-hidden transition-all duration-300"
                    style={{
                      maxHeight: openFaq === item.question ? '200px' : '0',
                      opacity: openFaq === item.question ? 1 : 0,
                      paddingTop: openFaq === item.question ? '0' : '0',
                      paddingBottom: openFaq === item.question ? '24px' : '0',
                    }}
                  >
                    <div className="px-6 pb-6 border-t border-border">
                      <p className="text-text-muted leading-relaxed">{item.answer}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section" aria-labelledby="contact-cta-heading">
        <div className="container">
          <Card className="bg-primary text-white border-0">
            <CardContent className="p-8 md:p-12 text-center">
              <h2 id="contact-cta-heading" className="font-heading text-3xl md:text-4xl font-bold mb-4">
                Still Have Questions?
              </h2>
              <p className="text-primary/90 text-lg mb-8 max-w-2xl mx-auto">
                Our team is ready to help you find the perfect flowers for any occasion.
                Reach out via WhatsApp for the fastest response.
              </p>
              <Button size="lg" variant="secondary" asChild className="w-full sm:w-auto">
                <a href="https://wa.me/91XXXXXXXXXX" target="_blank" rel="noopener noreferrer">
                  <MessageSquare className="w-5 h-5 mr-2" aria-hidden="true" />
                  Chat on WhatsApp
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}