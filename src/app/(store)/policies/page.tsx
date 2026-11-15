"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, Shield, Truck, RotateCcw, Gift, Lock, FileText, Clock, Leaf } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const POLICIES = [
  {
    id: "shipping",
    icon: Truck,
    title: "Shipping Policy",
    shortDesc: "Delivery timelines, charges, and tracking information",
    sections: [
      {
        heading: "Delivery Areas",
        content: "We currently deliver across India. International shipping is not available at this time. We ship to all major cities and towns via our trusted logistics partners.",
      },
      {
        heading: "Delivery Timelines",
        content: "Standard delivery takes 5-7 business days from order confirmation. Custom/made-to-order bouquets require 7-10 business days for crafting before dispatch. Express delivery (2-3 business days) is available for select metropolitan areas at an additional charge.",
      },
      {
        heading: "Shipping Charges",
        content: "Free delivery on orders above ₹999. For orders below ₹999, a flat delivery charge of ₹100 applies. Express delivery charges vary by location and are shown at checkout.",
      },
      {
        heading: "Order Processing",
        content: "Orders are processed within 1-2 business days. You'll receive a WhatsApp notification when your order is confirmed and again when it's dispatched with tracking details.",
      },
      {
        heading: "Tracking",
        content: "Once dispatched, you'll receive a tracking link via WhatsApp and email. You can track your order in real-time through our logistics partner's website.",
      },
      {
        heading: "Delivery Issues",
        content: "If no one is available at the delivery address, our courier will attempt delivery twice more on consecutive days. After three failed attempts, the order will be returned to us and a refund (minus shipping charges) will be issued.",
      },
      {
        heading: "Damaged in Transit",
        content: "If your order arrives damaged, please contact us within 24 hours with photos of the damage and packaging. We'll arrange a replacement at no additional cost.",
      },
    ],
  },
  {
    id: "returns",
    icon: RotateCcw,
    title: "Returns & Refunds Policy",
    shortDesc: "7-day return policy, exchange process, and refund timelines",
    sections: [
      {
        heading: "Return Window",
        content: "We offer a 7-day return policy from the date of delivery. Items must be unused, in original condition, and in their original packaging to be eligible for return.",
      },
      {
        heading: "Eligible Items",
        content: "Standard ready-made products can be returned within 7 days. Custom/personalized bouquets, made-to-order items, and gift-wrapped products are non-returnable unless there's a manufacturing defect or damage.",
      },
      {
        heading: "Return Process",
        content: "To initiate a return, contact us via WhatsApp or email with your order number and reason. We'll provide a return authorization and pickup instructions. Return shipping is free for defective/damaged items; otherwise, a ₹100 return shipping fee applies.",
      },
      {
        heading: "Refund Timeline",
        content: "Refunds are processed within 5-7 business days after we receive and inspect the returned item. Refunds are issued to the original payment method. WhatsApp Pay/UPI refunds are instant; card/bank transfers take 3-5 business days to reflect.",
      },
      {
        heading: "Exchange Option",
        content: "We offer exchanges for size/colour variants of the same product (subject to availability). Contact us within 7 days to arrange an exchange. Exchange shipping is free both ways.",
      },
      {
        heading: "Quality Issues",
        content: "If you receive a defective or incorrect item, contact us within 24 hours with photos. We'll arrange a free replacement and cover all return shipping costs.",
      },
      {
        heading: "Non-Returnable Items",
        content: "Custom bouquets, personalized items, gift cards, sale/clearance items, and items damaged due to misuse cannot be returned unless defective.",
      },
    ],
  },
  {
    id: "custom",
    icon: Gift,
    title: "Custom Order Policy",
    shortDesc: "Custom bouquet design process, timelines, and terms",
    sections: [
      {
        heading: "Design Consultation",
        content: "Every custom order begins with a free design consultation via WhatsApp. Our florist will discuss your vision, occasion, budget, and preferences to create a design proposal.",
      },
      {
        heading: "Quotation & Approval",
        content: "After consultation, we'll provide a detailed quotation including flower selection, quantities, wrapping, and delivery charges. The order proceeds only after your written approval on the quote.",
      },
      {
        heading: "Production Timeline",
        content: "Custom bouquets take 7-10 business days to craft after quote approval and advance payment. Complex designs or peak seasons (Valentine's, Mother's Day) may require additional time.",
      },
      {
        heading: "Advance Payment",
        content: "A 50% advance payment is required to begin crafting your custom bouquet. The balance is due before dispatch. Payment can be made via UPI, bank transfer, or WhatsApp Pay.",
      },
      {
        heading: "Design Changes",
        content: "Minor adjustments (colour swaps, quantity changes) can be made within 48 hours of quote approval. Major design changes after production has started may incur additional charges.",
      },
      {
        heading: "Cancellation Policy",
        content: "Custom orders can be cancelled within 24 hours of quote approval for a full refund. After production begins, the 50% advance is non-refundable as materials are procured specifically for your order.",
      },
      {
        heading: "Freshness Guarantee",
        content: "While our pipe cleaner flowers don't wilt, we guarantee the structural integrity and colour vibrancy for 1 year. Any manufacturing defects within this period will be repaired or replaced free of charge.",
      },
    ],
  },
  {
    id: "privacy",
    icon: Lock,
    title: "Privacy Policy",
    shortDesc: "How we collect, use, and protect your personal information",
    sections: [
      {
        heading: "Information We Collect",
        content: "We collect personal information you provide directly: name, phone number, email, delivery address, and order details. We also collect usage data through cookies and analytics to improve our website experience.",
      },
      {
        heading: "How We Use Your Information",
        content: "Your information is used to process orders, communicate about deliveries, send order updates via WhatsApp, improve our services, and send promotional communications (only with your consent).",
      },
      {
        heading: "Information Sharing",
        content: "We share data only with trusted partners: logistics providers for delivery, payment processors for transactions, and WhatsApp Business API for order communications. We never sell your data to third parties.",
      },
      {
        heading: "Data Security",
        content: "We implement industry-standard security measures including encryption, secure servers, and access controls. Payment data is handled by certified processors (Razorpay/PayU) and never stored on our servers.",
      },
      {
        heading: "Your Rights",
        content: "You have the right to access, correct, or delete your personal data. You can opt out of marketing communications at any time. Contact us at privacy@dugguarts.com to exercise your rights.",
      },
      {
        heading: "Cookies",
        content: "Our website uses essential cookies for functionality and analytics cookies (with consent) to understand usage patterns. You can manage cookie preferences through your browser settings.",
      },
      {
        heading: "Data Retention",
        content: "Order data is retained for 7 years for legal/tax purposes. Marketing data is retained until you opt out. You can request deletion of non-essential data at any time.",
      },
    ],
  },
  {
    id: "terms",
    icon: FileText,
    title: "Terms & Conditions",
    shortDesc: "Terms of service, user obligations, and legal agreements",
    sections: [
      {
        heading: "Acceptance of Terms",
        content: "By accessing and using our website and services, you agree to be bound by these Terms & Conditions. If you disagree with any part, please do not use our services.",
      },
      {
        heading: "Order Agreement",
        content: "Placing an order constitutes an offer to purchase. Orders are confirmed only after our team verifies availability and contacts you via WhatsApp. Prices are in INR and include applicable taxes.",
      },
      {
        heading: "Product Representation",
        content: "Product images are for representation. Handmade flowers may have slight variations in colour, size, and shape - these are natural characteristics, not defects. Colours may appear different on various screens.",
      },
      {
        heading: "Payment Terms",
        content: "We accept UPI, credit/debit cards, net banking, and WhatsApp Pay. Custom orders require 50% advance. Orders are processed only after payment confirmation. Failed payments may result in order cancellation.",
      },
      {
        heading: "Intellectual Property",
        content: "All content, designs, images, and branding on this website are property of Duggu Arts. Unauthorized reproduction, distribution, or commercial use is prohibited without written permission.",
      },
      {
        heading: "Limitation of Liability",
        content: "Our liability is limited to the order value. We are not liable for indirect, consequential, or punitive damages. Force majeure events (natural disasters, strikes, pandemics) may delay deliveries without liability.",
      },
      {
        heading: "Dispute Resolution",
        content: "Any disputes shall be resolved through mutual discussion first. If unresolved, disputes are subject to the exclusive jurisdiction of courts in [City, State]. These terms are governed by Indian law.",
      },
    ],
  },
];

export default function PoliciesPage() {
  const [openPolicy, setOpenPolicy] = useState<string | null>("shipping");

  const togglePolicy = (id: string) => {
    setOpenPolicy(prev => prev === id ? null : id);
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" aria-hidden="true" />
        <div className="container relative z-10 py-20 visible-by-default">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
              Legal & Policies
            </span>
            <h1 className="font-heading font-bold text-5xl md:text-6xl text-text mb-6">
              Our Policies
            </h1>
            <p className="text-lg md:text-xl text-text-muted mb-10 max-w-2xl mx-auto">
              Transparency matters. Here's everything you need to know about shopping with us,
              from delivery to returns and data protection.
            </p>
          </div>
        </div>
      </section>

      {/* Policies Content */}
      <section className="section" aria-labelledby="policies-heading">
        <div className="container">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24 h-fit">
                <CardContent className="p-4 space-y-2">
                  <nav aria-label="Policy navigation">
                    <ul role="list" className="space-y-1">
                      {POLICIES.map((policy) => (
                        <li key={policy.id}>
                          <button
                            type="button"
                            onClick={() => togglePolicy(policy.id)}
                            className={cn(
                              "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all text-sm font-medium",
                              openPolicy === policy.id
                                ? "bg-primary text-white"
                                : "text-text-muted hover:text-text hover:bg-surface"
                            )}
                            aria-current={openPolicy === policy.id ? "page" : undefined}
                          >
                            <policy.icon className={cn("w-5 h-5 flex-shrink-0", openPolicy === policy.id && "text-white")} aria-hidden="true" />
                            <span>{policy.title}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </CardContent>
              </Card>

              {/* Quick Contact */}
              <Card className="mt-6">
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-heading text-lg font-semibold text-text">Need Help?</h3>
                  <p className="text-text-muted text-sm">Can't find what you're looking for? Our team is here to assist.</p>
                  <Button className="w-full" asChild>
                    <a href="/contact">Contact Support</a>
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <a href="https://wa.me/91XXXXXXXXXX" target="_blank" rel="noopener noreferrer">
                      WhatsApp Us
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Policy Content */}
            <div className="lg:col-span-3 space-y-6">
              {POLICIES.map((policy) => (
                <Card
                  key={policy.id}
                  className="overflow-hidden"
                  variant="outlined"
                >
                  <CardHeader className={cn("cursor-pointer", openPolicy === policy.id && "bg-primary/5")} onClick={() => togglePolicy(policy.id)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", openPolicy === policy.id ? "bg-primary text-white" : "bg-primary/10 text-primary")}>
                          <policy.icon className="w-5 h-5" aria-hidden="true" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">{policy.title}</CardTitle>
                          <p className="text-text-muted text-sm">{policy.shortDesc}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-text-muted">
                        {openPolicy === policy.id ? (
                          <ChevronUp className="w-5 h-5" aria-hidden="true" />
                        ) : (
                          <ChevronDown className="w-5 h-5" aria-hidden="true" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <div
                    className="overflow-hidden transition-all duration-300"
                    style={{
                      maxHeight: openPolicy === policy.id ? '2000px' : '0',
                      opacity: openPolicy === policy.id ? 1 : 0,
                      paddingTop: openPolicy === policy.id ? '0' : '0',
                      paddingBottom: openPolicy === policy.id ? '24px' : '0',
                    }}
                  >
                    <CardContent className="p-6 space-y-8">
                      {policy.sections.map((section, index) => (
                        <section key={index} className="space-y-2">
                          <h4 className="font-heading text-lg font-semibold text-text flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" aria-hidden="true" />
                            {section.heading}
                          </h4>
                          <p className="text-text-muted leading-relaxed pl-6">{section.content}</p>
                        </section>
                      ))}
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Last Updated */}
      <section className="section bg-surface/50">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-text-muted">
              Last updated: <time dateTime="2024-01-15">January 15, 2024</time>
            </p>
            <p className="text-text-muted text-sm mt-2">
              We review and update our policies regularly. Significant changes will be communicated via email and website notification.
            </p>
            <Button variant="outline" className="mt-6" asChild>
              <a href="/contact">Questions About Our Policies?</a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}