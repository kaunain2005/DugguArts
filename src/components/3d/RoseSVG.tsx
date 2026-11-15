"use client";

import React, { useId, useState } from "react";
import { cn } from "@/lib/utils";

interface RoseSVGProps {
  className?: string;
  size?: number;
  exploded?: boolean;
  hoveredPart?: string | null;
  animationPhase?: number;
  onPetalHover?: (id: string) => void;
  onPetalLeave?: () => void;
  onCentreHover?: () => void;
  onCentreLeave?: () => void;
  onLeafHover?: (index: number) => void;
  onLeafLeave?: () => void;
  onStemHover?: () => void;
  onStemLeave?: () => void;
}

const outerAngles = [0, 45, 90, 135, 180, 225, 270, 315];
const middleAngles = [0, 60, 120, 180, 240, 300];
const innerAngles = [0, 72, 144, 216, 288];

export function RoseSVG({
  className,
  size = 450,
  exploded = false,
  hoveredPart = null,
  onPetalHover,
  onPetalLeave,
  onCentreHover,
  onCentreLeave,
  onLeafHover,
  onLeafLeave,
  onStemHover,
  onStemLeave,
}: RoseSVGProps) {
  const id = useId().replace(/:/g, "");
  const [isHovered, setIsHovered] = useState(false);

  const separated = exploded || isHovered;

  const petalPath =
    "M0 12 C-22 4 -49 -17 -48 -53 C-47 -82 -24 -104 0 -119 C24 -104 47 -82 48 -53 C49 -17 22 4 0 12 Z";

  const middlePath =
    "M0 8 C-19 0 -37 -18 -35 -43 C-34 -65 -17 -83 0 -94 C17 -83 34 -65 35 -43 C37 -18 19 0 0 8 Z";

  const innerPath =
    "M0 5 C-15 -5 -26 -20 -23 -39 C-21 -56 -10 -69 0 -77 C10 -69 21 -56 23 -39 C26 -20 15 -5 0 5 Z";

  const renderLayer = (
    angles: number[],
    layer: string,
    path: string,
    gradient: string,
    distance: number,
    scale: number
  ) =>
    angles.map((angle, index) => {
      const partId = `${layer}-${index}`;
      const active = hoveredPart === partId;

      // Each petal moves outward along its own radial direction.
      const separation = separated ? distance : 0;

      return (
        <g
          key={partId}
          transform={`
            translate(250 215)
            rotate(${angle})
            translate(0 ${-separation})
            scale(${scale})
          `}
          style={{
            transformBox: "view-box",
            transition: "transform 850ms cubic-bezier(.2,.75,.25,1)",
            cursor: "pointer",
          }}
          onPointerEnter={() => onPetalHover?.(partId)}
          onPointerLeave={onPetalLeave}
        >
          <g
            style={{
              filter: active
                ? `url(#${id}-hover-shadow)`
                : `url(#${id}-shadow)`,
              transform: active ? "scale(1.04)" : "scale(1)",
              transformOrigin: "center",
              transition: "transform 350ms ease, filter 350ms ease",
            }}
          >
            <path
              d={path}
              fill={`url(#${id}-${gradient})`}
              stroke="#C96C8C"
              strokeOpacity=".25"
              strokeWidth="1.2"
            />

            {/* Petal highlight */}
            <path
              d="M0 -5 C-8 -28 -10 -60 0 -94"
              fill="none"
              stroke="#FFF4F7"
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity=".42"
            />

            {/* Soft inner shading */}
            <path
              d="M-20 -23 Q-29 -53 -14 -76"
              fill="none"
              stroke="#62a94f"
              strokeWidth="2"
              strokeLinecap="round"
              opacity=".14"
            />
          </g>
        </g>
      );
    });

  return (
    <svg
      viewBox="0 0 500 560"
      width={size}
      height={size}
      preserveAspectRatio="xMidYMid meet"
      className={cn("block w-full h-full", className)}
      role="img"
      aria-label="Interactive layered pink rose"
      style={{
        background: "transparent",
        overflow: "visible",
      }}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => {
        setIsHovered(false);
        onPetalLeave?.();
      }}
    >
      <defs>
        <linearGradient id={`${id}-outer`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFE6EF" />
          <stop offset="35%" stopColor="#F4B0C6" />
          <stop offset="75%" stopColor="#DE789A" />
          <stop offset="100%" stopColor="#B94F77" />
        </linearGradient>

        <linearGradient id={`${id}-middle`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFF0F5" />
          <stop offset="45%" stopColor="#F6C0D2" />
          <stop offset="100%" stopColor="#D86F94" />
        </linearGradient>

        <linearGradient id={`${id}-inner`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFF5F8" />
          <stop offset="55%" stopColor="#F3B4C9" />
          <stop offset="100%" stopColor="#CA5E87" />
        </linearGradient>

        <radialGradient id={`${id}-centre`}>
          <stop offset="0%" stopColor="#F8D0DE" />
          <stop offset="55%" stopColor="#D96F96" />
          <stop offset="100%" stopColor="#983A63" />
        </radialGradient>

        <linearGradient id={`${id}-stem`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#285B37" />
          <stop offset="45%" stopColor="#7BB77D" />
          <stop offset="100%" stopColor="#28603D" />
        </linearGradient>

        <linearGradient id={`${id}-leaf`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#A8D79C" />
          <stop offset="55%" stopColor="#65A76B" />
          <stop offset="100%" stopColor="#286A43" />
        </linearGradient>

        <filter id={`${id}-shadow`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur" />
          <feOffset in="blur" dx="2" dy="4" result="offset" />
          <feComponentTransfer in="offset" result="shadow">
            <feFuncA type="linear" slope=".2" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode in="shadow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id={`${id}-hover-shadow`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="6" result="blur" />
          <feOffset in="blur" dx="2" dy="7" result="offset" />
          <feComponentTransfer in="offset" result="shadow">
            <feFuncA type="linear" slope=".32" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode in="shadow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Stem */}
      <g
        onPointerEnter={onStemHover}
        onPointerLeave={onStemLeave}
        style={{ cursor: "pointer" }}
      >
        <path
          d="M250 260 C246 345 253 423 245 520"
          fill="none"
          stroke={`url(#${id}-stem)`}
          strokeWidth="14"
          strokeLinecap="round"
          filter={`url(#${id}-shadow)`}
        />
        <path
          d="M247 276 C246 350 250 430 244 510"
          fill="none"
          stroke="#C2E2B5"
          strokeWidth="2.5"
          opacity=".5"
        />
      </g>

      {/* Left leaf */}
      <g
        onPointerEnter={() => onLeafHover?.(0)}
        onPointerLeave={onLeafLeave}
        style={{ cursor: "pointer" }}
      >
        <path
          d="M247 397 C191 347 143 351 127 378 C130 426 185 442 247 397 Z"
          fill={`url(#${id}-leaf)`}
          stroke="#39764B"
          strokeWidth="1.5"
          filter={`url(#${id}-shadow)`}
        />
        <path
          d="M241 395 Q186 385 135 380"
          fill="none"
          stroke="#D8EFC8"
          strokeWidth="2"
          opacity=".7"
        />
      </g>

      {/* Right leaf */}
      <g
        onPointerEnter={() => onLeafHover?.(1)}
        onPointerLeave={onLeafLeave}
        style={{ cursor: "pointer" }}
      >
        <path
          d="M249 430 C293 374 346 364 373 388 C372 431 317 460 249 430 Z"
          fill={`url(#${id}-leaf)`}
          stroke="#39764B"
          strokeWidth="1.5"
          filter={`url(#${id}-shadow)`}
        />
        <path
          d="M254 428 Q312 399 365 389"
          fill="none"
          stroke="#D8EFC8"
          strokeWidth="2"
          opacity=".7"
        />
      </g>

      {/* Rose petals: all layers share one centre when not hovered */}
      <g>
        {renderLayer(outerAngles, "outer", petalPath, "outer", 43, 1)}
      </g>

      <g>
        {renderLayer(middleAngles, "middle", middlePath, "middle", 30, 0.78)}
      </g>

      <g>
        {renderLayer(innerAngles, "inner", innerPath, "inner", 19, 0.58)}
      </g>



      {/* Daisy-style circular rose centre */}
      <g
        onPointerEnter={onCentreHover}
        onPointerLeave={onCentreLeave}
        style={{
          cursor: "pointer",
          transform: hoveredPart === "centre" ? "scale(1.08)" : "scale(1)",
          transformOrigin: "250px 215px",
          transition: "transform 350ms ease",
        }}
      >
        {/* Small white petals arranged in a circle */}
        {Array.from({ length: 12 }).map((_, i) => (
          <ellipse
            key={i}
            cx="250"
            cy="196"
            rx="3.5"
            ry="7"
            fill="#FFFEF8"
            transform={`rotate(${i * 30} 250 215)`}
          />
        ))}

        {/* Golden yellow circular centre */}
        <circle
          cx="250"
          cy="215"
          r="13"
          fill="#F8B916"
        />

        {/* Subtle golden highlight */}
        <circle
          cx="246"
          cy="211"
          r="4"
          fill="#FFE477"
          opacity="0.65"
        />
      </g>


    </svg>
  );
}

export default RoseSVG;
