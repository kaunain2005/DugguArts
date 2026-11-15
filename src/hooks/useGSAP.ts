"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Custom hook for GSAP animations with proper cleanup
 */
export function useGSAP(animationFn: (ctx: gsap.Context) => void, deps: React.DependencyList = []) {
  const ctx = useRef<gsap.Context | null>(null);

  useEffect(() => {
    ctx.current = gsap.context(() => {
      animationFn(ctx.current!);
    });

    return () => {
      ctx.current?.revert();
    };
  }, deps);

  return ctx;
}

/**
 * Hook to check for reduced motion preference
 */
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);

    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return prefersReducedMotion;
}

/**
 * Hook for simple element animations on mount
 * Respects reduced motion preference - content is visible by default
 */

export function useEntranceAnimation(
  elementRef: React.RefObject<HTMLElement | SVGElement | null>,
  animation: gsap.TweenVars = { opacity: 0, y: 20 },
  duration: number = 0.6,
  delay: number = 0
) {
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Reduced motion: keep content visible
    if (prefersReducedMotion) {
      gsap.set(element, { opacity: 1, y: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        element,
        animation,
        {
          opacity: 1,
          y: 0,
          duration,
          delay,
          ease: "power2.out",
        }
      );
    });

    return () => ctx.revert();
  }, [elementRef, prefersReducedMotion, animation, duration, delay]);
}

/**
 * Hook for ScrollTrigger animations with automatic cleanup
 * Respects reduced motion preference
 */
export function useScrollReveal(
  elementRef: React.RefObject<HTMLElement | SVGElement | null>,
  options: {
    animation?: gsap.TweenVars;
    trigger?: "self" | "parent";
    start?: string;
    end?: string;
    scrub?: boolean | number;
    once?: boolean;
  } = {}
) {
  const {
    animation = { opacity: 0, y: 30 },
    trigger = "self",
    start = "top 85%",
    end = "bottom 20%",
    scrub = false,
    once = true,
  } = options;

  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Ensure element is visible by default (before any animation runs)
    gsap.set(element, { opacity: 1, y: 0 });

    // If reduced motion is preferred, ensure element is visible and don't animate
    if (prefersReducedMotion) {
      gsap.set(element, { opacity: 1, y: 0 });
      return;
    }

    const triggerElement = element;
    if (!triggerElement) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(element, animation, {
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: triggerElement,
          start: "top 85%",
          end: "bottom 20%",
          scrub: false,
          once: true,
          toggleActions: "play none none reverse",
        },
      });
    });

    return () => ctx.revert();
  }, [elementRef]);
}

/**
 * Hook for staggered children animations
 */
export function useStaggeredAnimation(
  containerRef: React.RefObject<HTMLElement | null>,
  childSelector: string = "> *",
  animation: gsap.TweenVars = { opacity: 0, y: 20 },
  stagger: number = 0.1,
  duration: number = 0.5
) {
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // If reduced motion is preferred, ensure all children are visible
    if (prefersReducedMotion) {
      gsap.set(container.querySelectorAll(childSelector), { opacity: 1, y: 0 });
      return;
    }

    const children = container.querySelectorAll(childSelector);
    if (children.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(children, animation, {
        duration: 0.5,
        stagger,
        ease: "power2.out",
      });
    });

    return () => ctx.revert();
  }, [containerRef]);
}

/**
 * Hook for hover animations
 */
export function useHoverAnimation(
  elementRef: React.RefObject<HTMLElement | null>,
  hoverAnimation: gsap.TweenVars = { scale: 1.02, y: -4 },
  duration: number = 0.2
) {
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const element = elementRef.current;
    if (!element || prefersReducedMotion) return;

    const handleMouseEnter = () => {
      gsap.to(element, {
        ...hoverAnimation,
        duration: 0.3,
        ease: "power2.out",
      });
    };

    const handleMouseLeave = () => {
      gsap.to(element, {
        scale: 1,
        y: 0,
        duration: 0.3,
        ease: "power2.out",
      });
    };

    element.addEventListener("mouseenter", handleMouseEnter);
    element.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      element.removeEventListener("mouseenter", handleMouseEnter);
      element.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [elementRef]);
}

/**
 * Hook for click/tap feedback animation
 */
export function useTapAnimation(
  elementRef: React.RefObject<HTMLElement | null>,
  tapAnimation: gsap.TweenVars = { scale: 0.96 },
  duration: number = 0.1
) {
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const element = elementRef.current;
    if (!element || prefersReducedMotion) return;

    const handleMouseDown = () => {
      gsap.to(element, {
        ...{ scale: 0.96 },
        duration: 0.1,
        ease: "power2.out",
      });
    };

    const handleMouseUp = () => {
      gsap.to(element, {
        scale: 1,
        duration: 0.2,
        ease: "power2.out",
      });
    };

    element.addEventListener("mousedown", handleMouseDown);
    element.addEventListener("mouseup", handleMouseUp);
    element.addEventListener("mouseleave", handleMouseUp);

    return () => {
      element.removeEventListener("mousedown", handleMouseDown);
      element.removeEventListener("mouseup", handleMouseUp);
      element.removeEventListener("mouseleave", handleMouseUp);
    };
  }, [elementRef]);
}

/**
 * Utility for creating smooth page transitions
 */
export function createPageTransition(
  outgoingRef: React.RefObject<HTMLElement | null>,
  incomingRef: React.RefObject<HTMLElement | null>,
  options: {
    duration?: number;
    ease?: string;
  } = {}
) {
  const { duration = 0.4, ease = "power2.inOut" } = options;

  const timeline = gsap.timeline();

  if (outgoingRef.current) {
    timeline.to(outgoingRef.current, {
      opacity: 0,
      y: -20,
      duration: duration * 0.5,
      ease: "power2.in",
    });
  }

  if (incomingRef.current) {
    gsap.set(incomingRef.current, { opacity: 0, y: 20 });
    timeline.to(incomingRef.current, {
      opacity: 1,
      y: 0,
      duration: duration * 0.5,
      ease: "power2.out",
    }, "-=" + duration * 0.3);
  }

  return timeline;
}

/**
 * Utility for creating modal/drawer animations
 */
export function createModalAnimation(
  elementRef: React.RefObject<HTMLElement | null>,
  type: "modal" | "drawer" | "popover" = "modal",
  isOpening: boolean = true
) {
  const duration = 0.3;
  const ease = "power2.out";

  if (isOpening) {
    switch (type) {
      case "modal":
        gsap.fromTo(
          elementRef.current!,
          { opacity: 0, scale: 0.9, y: 20 },
          { opacity: 1, scale: 1, y: 0, duration, ease: "power2.out" }
        );
        break;
      case "drawer":
        gsap.fromTo(
          elementRef.current!,
          { opacity: 0, x: "100%" },
          { opacity: 1, x: "0%", duration, ease: "power2.out" }
        );
        break;
      case "popover":
        gsap.fromTo(
          elementRef.current!,
          { opacity: 0, scale: 0.8, y: 10 },
          { opacity: 1, scale: 1, y: 0, duration: 0.2, ease: "power2.out" }
        );
        break;
    }
  } else {
    switch (type) {
      case "modal":
        gsap.to(elementRef.current!, {
          opacity: 0,
          scale: 0.9,
          y: 20,
          duration: 0.2,
          ease: "power2.in",
        });
        break;
      case "drawer":
        gsap.to(elementRef.current!, {
          opacity: 0,
          x: "100%",
          duration: 0.2,
          ease: "power2.in",
        });
        break;
      case "popover":
        gsap.to(elementRef.current!, {
          opacity: 0,
          scale: 0.8,
          y: 10,
          duration: 0.15,
          ease: "power2.in",
        });
        break;
    }
  }
}

/**
 * Utility for button press animation
 */
export function animateButtonPress(
  element: HTMLElement,
  scale: number = 0.96,
  duration: number = 0.1
) {
  return gsap.to(element, {
    scale,
    duration: 0.1,
    ease: "power2.out",
  });
}

/**
 * Utility for button release animation
 */
export function animateButtonRelease(
  element: HTMLElement,
  duration: number = 0.2
) {
  return gsap.to(element, {
    scale: 1,
    duration: 0.2,
    ease: "power2.out",
  });
}

/**
 * Utility for loading spinner animation
 */
export function createSpinnerAnimation(elementRef: React.RefObject<HTMLElement | null>) {
  return gsap.to(elementRef.current!, {
    rotation: 360,
    duration: 1,
    ease: "none",
    repeat: -1,
  });
}

/**
 * Utility for shimmer/skeleton loading animation
 */
export function createShimmerAnimation(
  elementRef: React.RefObject<HTMLElement | null>,
  color: string = "currentColor"
) {
  const element = elementRef.current;
  if (!element) return;

  const gradient = document.createElement("div");
  gradient.style.cssText = `
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      ${color}20,
      transparent
    );
    animation: shimmer 1.5s infinite;
  `;
  element.style.position = "relative";
  element.style.overflow = "hidden";
  element.appendChild(gradient);

  return () => {
    gradient.remove();
  };
}

// Add keyframes for shimmer
if (typeof window !== "undefined" && !document.getElementById("gsap-shimmer-styles")) {
  const style = document.createElement("style");
  style.id = "gsap-shimmer-styles";
  style.textContent = `
    @keyframes shimmer {
      0% { left: -100%; }
      100% { left: 100%; }
    }
  `;
  document.head.appendChild(style);
}

export { gsap, ScrollTrigger };