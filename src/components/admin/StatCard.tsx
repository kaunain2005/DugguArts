"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: string;
  variant?: "default" | "primary" | "secondary" | "warning" | "error" | "info";
  trend?: { value: number; label: string };
}

const iconComponents: Record<string, React.ComponentType<{ className?: string }>> = {
  Package: ({ className }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>,
  ShoppingBag: ({ className }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>,
  MessageSquare: ({ className }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>,
  Star: ({ className }) => <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
  Users: ({ className }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/></svg>,
  AlertTriangle: ({ className }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>,
};

const variantStyles = {
  default: "bg-surface border border-border",
  primary: "bg-primary/10 border border-primary/30",
  secondary: "bg-secondary/10 border border-secondary/30",
  warning: "bg-yellow-500/10 border border-yellow-500/30",
  error: "bg-red-500/10 border border-red-500/30",
  info: "bg-blue-500/10 border border-blue-500/30",
};

const iconColors = {
  default: "text-text",
  primary: "text-primary",
  secondary: "text-secondary",
  warning: "text-yellow-600",
  error: "text-red-600",
  info: "text-blue-600",
};

export function StatCard({
  title,
  value,
  icon,
  variant = "default",
  trend,
}: StatCardProps) {
  const Icon = iconComponents[icon] || iconComponents.Package;
  const containerStyle = variantStyles[variant];
  const iconColor = iconColors[variant];

  return (
    <div className={cn("rounded-xl p-6 transition-all hover:shadow-md", containerStyle)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-text-muted">{title}</p>
          <p className="font-heading text-3xl font-bold text-text mt-1">{value}</p>
          {trend && (
            <p className="text-xs text-success mt-2 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18"/></svg>
              +{trend.value}% {trend.label}
            </p>
          )}
        </div>
        <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center", iconColor)}>
          <Icon className="w-6 h-6" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}