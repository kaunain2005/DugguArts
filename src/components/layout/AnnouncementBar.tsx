"use client";

import React, { useState, useEffect } from "react";
import { X, Truck, RotateCcw, Gift } from "lucide-react";
import { cn } from "@/lib/utils";

const announcements = [
  { text: "Free delivery on orders above ₹999!", icon: Truck },
  { text: "Easy returns within 7 days", icon: RotateCcw },
  { text: "Gift wrapping available", icon: Gift },
];

export function AnnouncementBar({
  dismissible = true,
  autoRotate = true,
  rotationInterval = 5000
}: {
  dismissible?: boolean;
  autoRotate?: boolean;
  rotationInterval?: number;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  // useEffect(() => {
  //   const stored = localStorage.getItem("announcement-dismissed");
  //   if (stored) {
  //     const { timestamp } = JSON.parse(stored);
  //     const oneDay = 24 * 60 * 60 * 1000;
  //     if (Date.now() - timestamp < oneDay) {
  //       setDismissed(true);
  //     }
  //   }
  // }, []);

  useEffect(() => {
    if (!autoRotate || announcements.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, rotationInterval);

    return () => clearInterval(interval);
  }, [autoRotate, rotationInterval]);

  if (dismissed) return null;

  const currentAnnouncement = announcements[currentIndex];
  const Icon = currentAnnouncement.icon;

  // const handleDismiss = () => {
  //   setDismissed(true);
  //   localStorage.setItem("announcement-dismissed", JSON.stringify({ timestamp: Date.now() }));
  // };
  const handleDismiss = () => {
    setDismissed(true);
  };
  return (
    <div
      className={cn(
        "bg-primary text-white py-2 px-4",
        "transition-all duration-300 ease-in-out"
      )}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="container flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 animate-fade-in">
          <Icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
          <span className="text-sm font-medium">{currentAnnouncement.text}</span>
        </div>

        {dismissible && (
          <button
            type="button"
            onClick={handleDismiss}
            className="flex-shrink-0 p-1 rounded hover:bg-white/20 transition-colors"
            aria-label="Dismiss announcement"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}