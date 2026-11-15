import React from "react";
import Link from "next/link";
import { Flower2, Instagram, MessageSquare, Mail, MapPin, Truck, RotateCcw, Gift, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { APP_CONFIG } from "@/lib/constants";

const footerLinks = {
  shop: [
    { href: "/shop", label: "All Products" },
    { href: "/shop?category=roses", label: "Roses" },
    { href: "/shop?category=tulips", label: "Tulips" },
    { href: "/shop?category=daisies", label: "Daisies" },
    { href: "/custom-order", label: "Custom Bouquets" },
  ],
  support: [
    { href: "/contact", label: "Contact Us" },
    { href: "/policies#shipping", label: "Shipping Policy" },
    { href: "/policies#returns", label: "Returns & Refunds" },
    { href: "/policies#custom", label: "Custom Order Policy" },
    { href: "/policies#privacy", label: "Privacy Policy" },
  ],
  company: [
    { href: "/about", label: "Our Story" },
    { href: "/reviews", label: "Customer Reviews" },
    { href: "/policies#terms", label: "Terms & Conditions" },
  ],
};

const socialLinks = [
  { href: "https://instagram.com", label: "Instagram", icon: Instagram },
  { href: "https://wa.me", label: "WhatsApp", icon: MessageSquare },
  { href: "mailto:hello@dugguarts.com", label: "Email", icon: Mail },
];

const features = [
  { icon: Truck, title: "Free Delivery", desc: "On orders above ₹999" },
  { icon: RotateCcw, title: "Easy Returns", desc: "7-day return policy" },
  { icon: Gift, title: "Gift Wrapping", desc: "Beautiful packaging" },
  { icon: Heart, title: "Handmade with Love", desc: "Crafted carefully" },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-surface border-t border-border" role="contentinfo">
      <div className="container py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 text-xl font-heading font-bold text-text mb-4" aria-label="Duggu Arts - Home">
              <Flower2 className="w-7 h-7 text-primary" aria-hidden="true" />
              <span>{APP_CONFIG.name}</span>
            </Link>
            <p className="text-text-muted text-sm mb-6 max-w-xs">
              {APP_CONFIG.description}
            </p>
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-surface-elevated border border-border flex items-center justify-center text-text-muted hover:text-primary hover:border-primary transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* Shop Links */}
          <nav aria-label="Shop">
            <h3 className="font-heading font-semibold text-text mb-4">Shop</h3>
            <ul className="space-y-3" role="list">
              {footerLinks.shop.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-text-muted hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Support Links */}
          <nav aria-label="Support">
            <h3 className="font-heading font-semibold text-text mb-4">Support</h3>
            <ul className="space-y-3" role="list">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-text-muted hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Company Links */}
          <nav aria-label="Company">
            <h3 className="font-heading font-semibold text-text mb-4">Company</h3>
            <ul className="space-y-3" role="list">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-text-muted hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact Info */}
          <div>
            <h3 className="font-heading font-semibold text-text mb-4">Contact Us</h3>
            <address className="not-italic space-y-3 text-sm text-text-muted">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5 text-primary" aria-hidden="true" />
                <span>123 Flower Street, Garden City, GC 560001</span>
              </div>
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 flex-shrink-0 text-primary" aria-hidden="true" />
                <a href="https://wa.me/91XXXXXXXXXX" className="hover:text-primary transition-colors">+91 XXXXX XXXXX</a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 flex-shrink-0 text-primary" aria-hidden="true" />
                <a href="mailto:hello@dugguarts.com" className="hover:text-primary transition-colors">hello@dugguarts.com</a>
              </div>
            </address>
          </div>
        </div>

        {/* Features */}
        <div className="mt-12 pt-12 border-t border-border">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-5 h-5 text-primary" aria-hidden="true" />
                </div>
                <div>
                  <h4 className="font-medium text-text">{feature.title}</h4>
                  <p className="text-xs text-text-muted">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-text-muted text-center md:text-left">
            © {currentYear} {APP_CONFIG.name}. All rights reserved.
          </p>
          <p className="text-xs text-text-muted text-center md:text-left">
            Handmade with <span className="text-primary" aria-label="love">♥</span> in India
          </p>
        </div>
      </div>
    </footer>
  );
}