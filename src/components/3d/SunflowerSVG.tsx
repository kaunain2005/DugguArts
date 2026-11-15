"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface SunflowerSVGProps {
  className?: string;
  size?: number;
  onPetalHover?: (id: string) => void;
  onPetalLeave?: () => void;
  onCentreHover?: () => void;
  onCentreLeave?: () => void;
  onLeafHover?: (index: number) => void;
  onLeafLeave?: () => void;
  onStemHover?: () => void;
  onStemLeave?: () => void;
  exploded?: boolean;
  hoveredPart?: string | null;
  animationPhase?: number;
}

export function SunflowerSVG({
  className,
  size = 400,
  onPetalHover,
  onPetalLeave,
  onCentreHover,
  onCentreLeave,
  onLeafHover,
  onLeafLeave,
  onStemHover,
  onStemLeave,
  exploded = false,
  hoveredPart = null,
  animationPhase = 0,
}: SunflowerSVGProps) {
  const scale = size / 400;
  const centerX = 200;
  const centerY = 200;

  const petalData = React.useMemo(() => {
    const petals: any[] = [];
    const petalCount = 16;
    const petalLength = 90;
    const petalWidth = 16;
    const centerRadius = 55;

    for (let i = 0; i < petalCount; i++) {
      const angle = (i / petalCount) * Math.PI * 2;
      const radius = centerRadius + petalLength / 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      // Main petal
      petals.push({
        id: `petal-${i}`,
        layer: 'main',
        index: i,
        angle,
        x: x * scale,
        y: 15 * scale,
        z: z * scale,
        width: petalWidth * scale,
        length: petalLength * scale,
        thickness: 3 * scale,
        rotation: -Math.PI / 2,
        petalRotation: angle,
      });

      // Back petal (slightly behind)
      petals.push({
        id: `petal-back-${i}`,
        layer: 'back',
        index: i,
        angle: angle + 0.05,
        x: x * 1.05 * scale,
        y: 10 * scale,
        z: z * 1.05 * scale,
        width: petalWidth * 0.9 * scale,
        length: petalLength * 1.1 * scale,
        thickness: 3 * scale,
        rotation: -Math.PI / 2,
        petalRotation: angle + 0.05,
      });
    }

    return petals;
  }, [animationPhase, scale]);

  const getPetalTransform = (petal: any, isHovered: boolean, isExploded: boolean) => {
    let tx = petal.x;
    let ty = petal.y;
    let tz = petal.z;
    let rotate = petal.petalRotation * 180 / Math.PI;
    let scaleX = 1;
    let scaleY = 1;

    if (isHovered) {
      const offset = 12;
      const angle = petal.angle;
      tx += Math.cos(angle) * offset;
      ty -= Math.sin(angle) * offset * 0.3;
      scaleX = 1.05;
      scaleY = 1.05;
    }

    if (isExploded && petal.layer === 'main') {
      const offset = 20;
      const angle = petal.angle;
      tx += Math.cos(angle) * offset;
      ty -= Math.sin(angle) * offset * 0.2;
    }

    return 'translate(' + tx + 'px, ' + ty + 'px) rotate(' + rotate + 'deg) scale(' + scaleX + ', ' + scaleY + ')';
  };

  const isPetalHovered = (id: string) => hoveredPart === id;
  const isPetalExploded = (petal: any) => exploded && petal.layer === 'main';

  const centreHovered = hoveredPart === 'centre';
  const stemHovered = hoveredPart === 'stem';
  const leaf0Hovered = hoveredPart === 'leaf-0';
  const leaf1Hovered = hoveredPart === 'leaf-1';
  const leaf2Hovered = hoveredPart === 'leaf-2';
  const leaf3Hovered = hoveredPart === 'leaf-3';

  const stemSway = Math.sin(animationPhase * 0.6) * 4;
  const leafSway = (index: number) => Math.sin(animationPhase * 0.8 + index * 2) * 5;

  // Seed pattern for centre
  const seedData = React.useMemo(() => {
    const seeds = [];
    const seedCount = 180;
    const centerRadiusSeed = 45;

    for (let i = 0; i < seedCount; i++) {
      const phi = i * 2.39996; // Golden angle
      const r = centerRadiusSeed * Math.sqrt(i / seedCount);
      const x = r * Math.cos(phi);
      const z = r * Math.sin(phi);
      const y = 10 + (i / seedCount) * 8;

      seeds.push({
        x: x * scale,
        y: y * scale,
        z: z * scale,
        size: (2.5 + Math.random() * 1.5) * scale,
      });
    }
    return seeds;
  }, [scale]);

  const svgContent = React.useMemo(() => {
    let svg = '<svg viewBox="0 0 400 400" width="' + size + '" height="' + size + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Interactive 3D Sunflower" style="touch-action: none;">';

    // Defs
    svg += '<defs>';
    svg += '<linearGradient id="petalMainGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#FFEB3B" /><stop offset="40%" stopColor="#FFD700" /><stop offset="70%" stopColor="#FFC107" /><stop offset="100%" stopColor="#FFA000" /></linearGradient>';
    svg += '<linearGradient id="petalBackGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#FFD600" /><stop offset="50%" stopColor="#FFC107" /><stop offset="100%" stopColor="#FFA000" /></linearGradient>';
    svg += '<radialGradient id="centreGrad" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#3E2723" /><stop offset="30%" stopColor="#4E342E" /><stop offset="60%" stopColor="#3E2723" /><stop offset="100%" stopColor="#212121" /></radialGradient>';
    svg += '<radialGradient id="centreHighlightGrad" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#5D4037" /><stop offset="50%" stopColor="#4E342E" /><stop offset="100%" stopColor="#3E2723" /></radialGradient>';
    svg += '<linearGradient id="stemGrad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#388E3C" /><stop offset="50%" stopColor="#2E7D32" /><stop offset="100%" stopColor="#1B5E20" /></linearGradient>';
    svg += '<linearGradient id="leafGrad1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#4CAF50" /><stop offset="50%" stopColor="#388E3C" /><stop offset="100%" stopColor="#2E7D32" /></linearGradient>';
    svg += '<linearGradient id="leafGrad2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#66BB6A" /><stop offset="50%" stopColor="#4CAF50" /><stop offset="100%" stopColor="#388E3C" /></linearGradient>';
    svg += '<filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3" /><feOffset dx="2" dy="3" /><feComponentTransfer><feFuncA type="table" tableValues="0 0.3" /></feComponentTransfer><feBlend in="SourceGraphic" mode="normal" /></filter>';
    svg += '<filter id="dropShadowHover" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="5" /><feOffset dx="3" dy="5" /><feComponentTransfer><feFuncA type="table" tableValues="0 0.5" /></feComponentTransfer><feBlend in="SourceGraphic" mode="normal" /></filter>';
    svg += '<filter id="innerShadow" x="-20%" y="-20%" width="140%" height="140%"><feOffset dx="0" dy="1" /><feGaussianBlur stdDeviation="2" /><feComponentTransfer><feFuncA type="table" tableValues="0 0.2" /></feComponentTransfer><feBlend in="SourceGraphic" mode="normal" /></filter>';
    svg += '</defs>';

    // Petal data generation
    const petals = [];
    const petalCount = 16;
    const petalLength = 90;
    const petalWidth = 16;
    const centerRadius = 55;

    for (let i = 0; i < petalCount; i++) {
      const angle = (i / petalCount) * Math.PI * 2;
      const radius = centerRadius + petalLength / 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      // Main petal
      petals.push({
        id: `petal-${i}`,
        layer: 'main',
        index: i,
        angle,
        x: x * scale,
        y: 15 * scale,
        z: z * scale,
        width: petalWidth * scale,
        length: petalLength * scale,
        thickness: 3 * scale,
        rotation: -Math.PI / 2,
        petalRotation: angle,
      });

      // Back petal (slightly behind)
      petals.push({
        id: `petal-back-${i}`,
        layer: 'back',
        index: i,
        angle: angle + 0.05,
        x: x * 1.05 * scale,
        y: 10 * scale,
        z: z * 1.05 * scale,
        width: petalWidth * 0.9 * scale,
        length: petalLength * 1.1 * scale,
        thickness: 3 * scale,
        rotation: -Math.PI / 2,
        petalRotation: angle + 0.05,
      });
    }

    const getPetalTransform = (petal: any, isHovered: boolean, isExploded: boolean) => {
      let tx = petal.x;
      let ty = petal.y;
      let tz = petal.z;
      let rotate = petal.petalRotation * 180 / Math.PI;
      let scaleX = 1;
      let scaleY = 1;

      if (isHovered) {
        const offset = 12;
        const angle = petal.angle;
        tx += Math.cos(angle) * offset;
        ty -= Math.sin(angle) * offset * 0.3;
        scaleX = 1.05;
        scaleY = 1.05;
      }

      if (isExploded && petal.layer === 'main') {
        const offset = 20;
        const angle = petal.angle;
        tx += Math.cos(angle) * offset;
        ty -= Math.sin(angle) * offset * 0.2;
      }

      return 'translate(' + tx + 'px, ' + ty + 'px) rotate(' + rotate + 'deg) scale(' + scaleX + ', ' + scaleY + ')';
    };

    const isPetalHovered = (id: string) => hoveredPart === id;
    const isPetalExploded = (petal: any) => exploded && petal.layer === 'main';

    const centreHovered = hoveredPart === 'centre';
    const stemHovered = hoveredPart === 'stem';
    const leaf0Hovered = hoveredPart === 'leaf-0';
    const leaf1Hovered = hoveredPart === 'leaf-1';
    const leaf2Hovered = hoveredPart === 'leaf-2';
    const leaf3Hovered = hoveredPart === 'leaf-3';

    const stemSway = Math.sin(animationPhase * 0.6) * 4;
    const leafSway = (index: number) => Math.sin(animationPhase * 0.8 + index * 2) * 5;

    // Seed pattern for centre
    const seedData = [];
    const seedCount = 180;
    const centerRadiusSeed = 45;
    const seeds = [];

    for (let i = 0; i < seedCount; i++) {
      const phi = i * 2.39996; // Golden angle
      const r = centerRadiusSeed * Math.sqrt(i / seedCount);
      const x = r * Math.cos(phi);
      const z = r * Math.sin(phi);
      const y = 10 + (i / seedCount) * 8;

      seeds.push({
        x: x * scale,
        y: y * scale,
        z: z * scale,
        size: (2.5 + Math.random() * 1.5) * scale,
      });
    }

    let result = '<svg viewBox="0 0 400 400" width="' + size + '" height="' + size + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Interactive 3D Sunflower" style="touch-action: none;">';
    result += '<defs>';
    result += '<linearGradient id="petalMainGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#FFEB3B" /><stop offset="40%" stopColor="#FFD700" /><stop offset="70%" stopColor="#FFC107" /><stop offset="100%" stopColor="#FFA000" /></linearGradient>';
    result += '<linearGradient id="petalBackGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#FFD600" /><stop offset="50%" stopColor="#FFC107" /><stop offset="100%" stopColor="#FFA000" /></linearGradient>';
    result += '<radialGradient id="centreGrad" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#3E2723" /><stop offset="30%" stopColor="#4E342E" /><stop offset="60%" stopColor="#3E2723" /><stop offset="100%" stopColor="#212121" /></radialGradient>';
    result += '<radialGradient id="centreHighlightGrad" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#5D4037" /><stop offset="50%" stopColor="#4E342E" /><stop offset="100%" stopColor="#3E2723" /></radialGradient>';
    result += '<linearGradient id="stemGrad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#388E3C" /><stop offset="50%" stopColor="#2E7D32" /><stop offset="100%" stopColor="#1B5E20" /></linearGradient>';
    result += '<linearGradient id="leafGrad1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#4CAF50" /><stop offset="50%" stopColor="#388E3C" /><stop offset="100%" stopColor="#2E7D32" /></linearGradient>';
    result += '<linearGradient id="leafGrad2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#66BB6A" /><stop offset="50%" stopColor="#4CAF50" /><stop offset="100%" stopColor="#388E3C" /></linearGradient>';
    result += '<filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3" /><feOffset dx="2" dy="3" /><feComponentTransfer><feFuncA type="table" tableValues="0 0.3" /></feComponentTransfer><feBlend in="SourceGraphic" mode="normal" /></filter>';
    result += '<filter id="dropShadowHover" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="5" /><feOffset dx="3" dy="5" /><feComponentTransfer><feFuncA type="table" tableValues="0 0.5" /></feComponentTransfer><feBlend in="SourceGraphic" mode="normal" /></filter>';
    result += '<filter id="innerShadow" x="-20%" y="-20%" width="140%" height="140%"><feOffset dx="0" dy="1" /><feGaussianBlur stdDeviation="2" /><feComponentTransfer><feFuncA type="table" tableValues="0 0.2" /></feComponentTransfer><feBlend in="SourceGraphic" mode="normal" /></filter>';
    result += '</defs>';

    // Simple sunflower - center with petals
    result += '<circle cx="200" cy="200" r="50" fill="url(#centreGrad)" />';
    result += '<circle cx="200" cy="200" r="40" fill="url(#centreHighlightGrad)" />';

    // Petals
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      const cx = 200 + Math.cos(angle) * 90;
      const cy = 200 + Math.sin(angle) * 90;
      const rot = (i / 16) * 360 - 90;
      result += '<ellipse cx="' + cx + '" cy="' + cy + '" rx="80" ry="16" fill="url(#petalMainGrad)" transform="rotate(' + rot + ' ' + cx + ' ' + cy + ')" filter="url(#dropShadow)" />';
    }

    // Stem
    result += '<path d="M200,250 Q220,350 200,450" stroke="url(#stemGrad)" stroke-width="12" fill="none" stroke-linecap="round" filter="url(#dropShadow)" />';

    // Leaves
    result += '<ellipse cx="140" cy="320" rx="50" ry="20" fill="url(#leafGrad1)" transform="rotate(-40 140 320)" filter="url(#dropShadow)" />';
    result += '<ellipse cx="260" cy="300" rx="45" ry="18" fill="url(#leafGrad2)" transform="rotate(30 260 300)" filter="url(#dropShadow)" />';
    result += '<ellipse cx="160" cy="380" rx="45" ry="18" fill="url(#leafGrad1)" transform="rotate(-30 160 380)" filter="url(#dropShadow)" />';

    result += '</svg>';

    return svg;
  }, [animationPhase, exploded, hoveredPart]);

  return (
    <div
      className={cn("w-full h-full", className)}
      style={{ minHeight: 400 }}
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
}