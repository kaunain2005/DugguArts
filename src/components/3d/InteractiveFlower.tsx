
"use client";

import React, { useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import { RoseSVG } from "./RoseSVG";

interface InteractiveFlowerProps {
  className?: string;
  size?: number;
}

export function InteractiveFlower({
  className,
  size = 450,
}: InteractiveFlowerProps) {
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);
  const [exploded, setExploded] = useState(false);

  const handlePetalHover = useCallback((id: string) => {
    setHoveredPart(id);
  }, []);

  const handleLeave = useCallback(() => {
    setHoveredPart(null);
  }, []);

  const handleCentreHover = useCallback(() => {
    setHoveredPart("centre");
  }, []);

  const handleLeafHover = useCallback((index: number) => {
    setHoveredPart(`leaf-${index}`);
  }, []);

  const handleStemHover = useCallback(() => {
    setHoveredPart("stem");
  }, []);

  return (
    <div
      className={cn(
        "relative flex items-center justify-center",
        "w-full h-full min-h-[350px]",
        "bg-transparent border-0 shadow-none rounded-none",
        className
      )}
      style={{
        background: "transparent",
        overflow: "visible",
      }}
      onTouchStart={() => setHoveredPart(null)}
    >
      <div
        className="relative w-full h-full flex items-center justify-center"
        style={{
          background: "transparent",
          overflow: "visible",
        }}
      >
        <div
          className="w-full h-full flex items-center justify-center"
          style={{
            background: "transparent",
            animation: "roseFloat 5s ease-in-out infinite",
          }}
        >
          <RoseSVG
            size={size}
            exploded={exploded}
            hoveredPart={hoveredPart}
            animationPhase={0}
            onPetalHover={handlePetalHover}
            onPetalLeave={handleLeave}
            onCentreHover={handleCentreHover}
            onCentreLeave={handleLeave}
            onLeafHover={handleLeafHover}
            onLeafLeave={handleLeave}
            onStemHover={handleStemHover}
            onStemLeave={handleLeave}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes roseFloat {
          0%, 100% {
            transform: translateY(0px) rotate(-1deg);
          }
          50% {
            transform: translateY(-9px) rotate(1deg);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          div {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}

export default InteractiveFlower;
