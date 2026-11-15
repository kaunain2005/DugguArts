"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { AlertTriangle, Package } from "lucide-react";

interface Material {
  materialId: string;
  materialName: string;
  category: string;
  currentStock: number;
  reorderLevel: number;
  unit: string;
  unitCost: number;
}

interface LowStockAlertProps {
  materials: Material[];
  limit?: number;
}

export function LowStockAlert({ materials = [], limit = 5 }: LowStockAlertProps) {
  const displayMaterials = materials.slice(0, limit);

  if (displayMaterials.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
            <Package className="w-5 h-5 text-success" aria-hidden="true" />
          </div>
          <h2 className="font-heading text-lg font-semibold text-text">Low Stock Alert</h2>
        </div>
        <p className="text-text-muted text-center py-4">All materials are well stocked</p>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-warning" aria-hidden="true" />
        </div>
        <h2 className="font-heading text-lg font-semibold text-text">Low Stock Alert</h2>
        <span className="ml-auto px-2 py-0.5 text-xs font-medium bg-warning/10 text-warning rounded-full">
          {displayMaterials.length} item{displayMaterials.length !== 1 ? "s" : ""}
        </span>
      </div>
      <div className="space-y-3">
        {displayMaterials.map((material) => (
          <div
            key={material.materialId}
            className={cn(
              "flex items-center justify-between p-3 rounded-lg border border-border",
              material.currentStock === 0 && "bg-error/5 border-error/30"
            )}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center flex-shrink-0">
                <Package className="w-5 h-5 text-warning" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-text truncate">{material.materialName}</p>
                <p className="text-xs text-text-muted truncate">{material.category} • {material.unit}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className={cn(
                  "font-bold text-sm",
                  material.currentStock === 0 ? "text-error" : "text-warning"
                )}>
                  {material.currentStock} {material.unit}
                </p>
                <p className="text-xs text-text-muted">Reorder: {material.reorderLevel}</p>
              </div>
              <span className={cn(
                "px-2 py-1 text-xs font-medium rounded-full",
                material.currentStock === 0
                  ? "bg-error/10 text-error"
                  : "bg-warning/10 text-warning"
              )}>
                {material.currentStock === 0 ? "Out of Stock" : "Low Stock"}
              </span>
            </div>
          </div>
        ))}
      </div>
      {materials.length > limit && (
        <a href="/admin/inventory" className="mt-4 block text-center text-sm text-primary hover:text-accent">
          View all {materials.length} low stock items
        </a>
      )}
    </div>
  );
}