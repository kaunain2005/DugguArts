"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { InteractiveFlower } from "./InteractiveFlower";

interface FlowerViewerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function FlowerViewer({
  className,
  size = "lg",
}: FlowerViewerProps) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center",
        "w-full bg-transparent",
        size === "sm" && "min-h-[280px]",
        size === "md" && "min-h-[360px]",
        size === "lg" && "min-h-[450px]",
        className
      )}
    >
      <InteractiveFlower className="w-full h-full" />
    </div>
  );
}

export default FlowerViewer;