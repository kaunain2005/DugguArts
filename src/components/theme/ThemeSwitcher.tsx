
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";

type Theme = "white" | "dark" | "pink";

interface FlowerThemeToggleProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const THEME_FLOWER_COLORS: Record<
  Theme,
  { petals: string; center: string; background: string; border: string }
> = {
  white: {
    petals: "#EFC75F",
    center: "#F5D76E",
    background: "#fdfbf700",
    border: "#E8DCC8",
  },
  dark: {
    petals: "#A995D9",
    center: "#D8BDF5",
    background: "#1a1a2e00",
    border: "#3D3D5C",
  },
  pink: {
    petals: "#EFA1C0",
    center: "#F7C9DA",
    background: "#FFF0F500",
    border: "#F8D7E3",
  },
};

const THEME_ORDER: Theme[] = ["white", "dark", "pink"];

const THEME_LABELS: Record<Theme, string> = {
  white: "White theme",
  dark: "Dark theme",
  pink: "Pink theme",
};

const SIZE_CLASSES = {
  sm: "w-8 h-8",
  md: "w-12 h-12",
  lg: "w-10 h-10",
};

export function FlowerThemeToggle({
  className,
  size = "md",
}: FlowerThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [isAnimating, setIsAnimating] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");

    const update = () => setPrefersReducedMotion(media.matches);
    update();

    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!isAnimating) return;

    const timer = window.setTimeout(() => {
      setIsAnimating(false);
    }, 750);

    return () => window.clearTimeout(timer);
  }, [isAnimating]);

  const colors = THEME_FLOWER_COLORS[theme];

  const handleClick = useCallback(() => {
    if (isAnimating) return;

    const currentIndex = THEME_ORDER.indexOf(theme);
    const nextTheme = THEME_ORDER[
      (currentIndex + 1) % THEME_ORDER.length
    ];

    if (!prefersReducedMotion) {
      setIsAnimating(true);
    }

    setTheme(nextTheme);
  }, [theme, setTheme, isAnimating, prefersReducedMotion]);

  return (
    <div className={cn("relative inline-flex", className)}>
      {/* {showTooltip && (
        <div
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 rounded-md bg-text text-background px-2.5 py-1.5 text-xs whitespace-nowrap shadow-lg z-50 pointer-events-none"
          role="tooltip"
        >
          {THEME_LABELS[theme]}
        </div>
      )} */}

      <button
        type="button"
        onClick={handleClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        disabled={isAnimating}
        aria-label={`Current theme: ${THEME_LABELS[theme]}. Click to change theme.`}
        className={cn(
          "relative flex items-center justify-center rounded-full",
          "border transition-colors duration-500",
          "hover:scale-110 active:scale-95",
          "focus-visible:outline-none focus-visible:ring-2",
          "focus-visible:ring-primary focus-visible:ring-offset-2",
          SIZE_CLASSES[size]
        )}
        style={{
          backgroundColor: colors.background,
          borderColor: colors.border,
        }}
      >
        <svg
          viewBox="0 0 40 40"
          className={cn(
            "w-[78%] h-[78%]",
            isAnimating && !prefersReducedMotion && "flower-spin"
          )}
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Eight distinct rounded petals */}
          <g
            stroke={colors.center}
            strokeWidth="0.7"
            strokeLinejoin="round"
            style={{
              transition: "fill 700ms ease, stroke 700ms ease",
            }}
          >
            {Array.from({ length: 8 }, (_, index) => (
              <ellipse
                key={index}
                cx="20"
                cy="10"
                rx="4.4"
                ry="7.2"
                transform={`rotate(${index * 45} 20 20)`}
                fill={colors.petals}
                style={{
                  transition: "fill 700ms ease",
                  filter: "drop-shadow(0 0.5px 0.7px rgba(0,0,0,0.12))",
                }}
              />
            ))}
          </g>

          {/* Round flower centre */}
          <circle
            cx="20"
            cy="20"
            r="5.5"
            fill={colors.center}
            stroke={colors.petals}
            strokeWidth="0.8"
            style={{
              transition: "fill 700ms ease, stroke 700ms ease",
            }}
          />

          {/* Small centre highlight */}
          <circle
            cx="18.3"
            cy="18.3"
            r="1.6"
            fill="white"
            opacity="0.55"
          />

          {/* Tiny centre detail */}
          <circle
            cx="21.2"
            cy="21.3"
            r="1.1"
            fill={colors.petals}
            opacity="0.55"
          />
        </svg>
      </button>

      <style jsx>{`
        .flower-spin {
          animation: flower-rotation 750ms
            cubic-bezier(0.22, 0.68, 0.32, 1) both;
        }

        @keyframes flower-rotation {
          0% {
            transform: rotate(0deg) scale(1);
          }
          45% {
            transform: rotate(190deg) scale(1.15);
          }
          100% {
            transform: rotate(360deg) scale(1);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .flower-spin {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}

// Hook for detecting reduced motion preference
function useReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setPrefersReduced(event.matches);
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return prefersReduced;
}

// Keep the dropdown version for mobile menu
export function ThemeSwitcherDropdown({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const themes = [
    { id: "white" as const, name: "White", description: "Clean & elegant" },
    { id: "dark" as const, name: "Dark", description: "Premium & modern" },
    { id: "pink" as const, name: "Pink", description: "Cute & playful" },
  ] as const;

  const currentTheme = themes.find((t) => t.id === theme) || themes[0];

  return (
    <div className={cn("relative inline-block", className)} ref={dropdownRef}>
      <FlowerThemeToggle size="sm" />

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-48 bg-surface border border-border rounded-xl shadow-lg overflow-hidden z-50 animate-slide-down"
          role="listbox"
          aria-label="Select theme"
        >
          {themes.map(({ id, name, description }) => (
            <button
              key={id}
              type="button"
              role="option"
              aria-selected={theme === id}
              onClick={() => {
                setTheme(id);
                setIsOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors",
                theme === id
                  ? "bg-primary/10 text-primary"
                  : "text-text hover:bg-surface-elevated"
              )}
            >
              <div className="flex flex-col">
                <span className="font-medium text-sm">{name}</span>
                <span className="text-xs text-text-muted">{description}</span>
              </div>
              {theme === id && (
                <svg className="w-5 h-5 text-primary ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}