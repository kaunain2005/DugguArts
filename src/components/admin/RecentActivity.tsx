"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/utils";

interface Activity {
  orderId: string;
  customerName: string;
  orderStatus: string;
  orderDate: string;
  totalAmount?: number;
  type?: string;
}

interface RecentActivityProps {
  activities: Activity[];
  limit?: number;
}

const statusLabels: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  confirmed: "Confirmed",
  in_production: "In Production",
  ready: "Ready",
  dispatched: "Dispatched",
  delivered: "Delivered",
  completed: "Completed",
  cancelled: "Cancelled",
};

const statusVariants: Record<string, string> = {
  new: "default",
  contacted: "warning",
  confirmed: "info",
  in_production: "secondary",
  ready: "info",
  dispatched: "primary",
  delivered: "success",
  completed: "success",
  cancelled: "error",
};

export function RecentActivity({ activities = [], limit = 5 }: RecentActivityProps) {
  const displayActivities = activities.slice(0, limit);

  if (displayActivities.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-xl p-6">
        <h2 className="font-heading text-lg font-semibold text-text mb-4">Recent Activity</h2>
        <p className="text-text-muted text-center py-4">No recent activity</p>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading text-lg font-semibold text-text">Recent Activity</h2>
        <a href="/admin/orders" className="text-sm text-primary hover:text-accent">View All</a>
      </div>
      <div className="space-y-3">
        {displayActivities.map((activity, index) => (
          <div
            key={activity.orderId || index}
            className={cn(
              "flex items-center justify-between p-3 rounded-lg border border-border",
              "hover:bg-surface-elevated transition-colors"
            )}
          >
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-medium text-sm">
                  {activity.customerName?.charAt(0) || "U"}
                </span>
              </div>
              <div className="min-w-0">
                <p className="font-medium text-text truncate">{activity.customerName}</p>
                <p className="text-xs text-text-muted truncate">
                  Order {activity.orderId} • {activity.totalAmount ? `₹${activity.totalAmount.toLocaleString("en-IN")}` : ""}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "px-2.5 py-1 text-xs font-medium rounded-full",
                  `bg-${statusVariants[activity.orderStatus] || "default"}/10`,
                  `text-${statusVariants[activity.orderStatus] || "default"}`
                )}
              >
                {statusLabels[activity.orderStatus] || activity.orderStatus}
              </span>
              <span className="text-xs text-text-muted whitespace-nowrap">
                {formatDateTime(activity.orderDate)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}