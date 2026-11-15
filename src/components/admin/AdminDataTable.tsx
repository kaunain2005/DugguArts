"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { ChevronLeft, ChevronRight, Search, Filter, ChevronDown, ChevronUp, MoreVertical, Edit, Trash2, Eye } from "lucide-react";

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T, index: number) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

interface AdminDataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyField: keyof T;
  searchable?: boolean;
  searchPlaceholder?: string;
  filters?: FilterConfig[];
  onRowClick?: (item: T) => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onView?: (item: T) => void;
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
  loading?: boolean;
  emptyMessage?: string;
  actionsHeader?: string;
}

interface FilterConfig {
  key: string;
  label: string;
  options: { value: string; label: string }[];
}

export function AdminDataTable<T extends Record<string, any>>({
  data,
  columns,
  keyField,
  searchable = true,
  searchPlaceholder = "Search...",
  filters = [],
  onRowClick,
  onEdit,
  onDelete,
  onView,
  pagination,
  loading = false,
  emptyMessage = "No data available",
  actionsHeader = "Actions",
}: AdminDataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);

  // Filter and sort data
  const filteredData = React.useMemo(() => {
    let result = [...data];

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item =>
        Object.values(item).some(val =>
          String(val).toLowerCase().includes(query)
        )
      );
    }

    // Filters
    Object.entries(filterValues).forEach(([key, value]) => {
      if (value) {
        result = result.filter(item => String(item[key]) === value);
      }
    });

    // Sort
    if (sortConfig) {
      result.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, searchQuery, filterValues, sortConfig]);

  const handleSort = (key: string) => {
    const column = columns.find(c => c.key === key);
    if (!column?.sortable) return;

    setSortConfig(prev => ({
      key,
      direction: prev?.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilterValues(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setSearchQuery("");
    setFilterValues({});
  };

  const hasActiveFilters = searchQuery || Object.values(filterValues).some(v => v);

  if (loading) {
    return (
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="h-6 w-1/4 bg-border rounded animate-pulse" />
        </div>
        <div className="divide-y divide-border">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4 animate-pulse">
              <div className="h-4 w-1/4 bg-border rounded" />
              <div className="h-4 w-1/2 bg-border rounded mt-2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden">
      {/* Toolbar */}
      <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          {searchable && (
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" aria-hidden="true" />
              <input
                type="search"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-lg text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {filters.map((filter) => (
            <Select
              key={filter.key}
              value={filterValues[filter.key] || ""}
              onChange={(e) => handleFilterChange(filter.key, e.target.value)}
              options={[{ value: "", label: `All ${filter.label}` }, ...filter.options]}
              placeholder={`Filter by ${filter.label}`}
              className="w-[180px]"
            />
          ))}

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <Filter className="w-4 h-4 mr-1" aria-hidden="true" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-surface border-b border-border">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    "px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider",
                    column.sortable && "cursor-pointer hover:text-text select-none",
                    column.className
                  )}
                  onClick={() => column.sortable && handleSort(column.key)}
                  style={{ width: column.className?.includes("w-") ? undefined : undefined }}
                >
                  <div className="flex items-center gap-1">
                    {column.header}
                    {column.sortable && sortConfig?.key === column.key && (
                      sortConfig.direction === "asc" ? (
                        <ChevronUp className="w-4 h-4 text-text-muted" aria-hidden="true" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-text-muted" aria-hidden="true" />
                      )
                    )}
                  </div>
                </th>
              ))}
              {(onEdit || onDelete || onView) && (
                <th className="px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider w-32">
                  {actionsHeader}
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + ((onEdit || onDelete || onView) ? 1 : 0)} className="px-4 py-12 text-center">
                  <p className="text-text-muted">{emptyMessage}</p>
                </td>
              </tr>
            ) : (
              filteredData.map((item, index) => (
                <tr
                  key={String(item[keyField])}
                  className={cn(
                    "hover:bg-surface-elevated transition-colors",
                    onRowClick && "cursor-pointer"
                  )}
                  onClick={() => onRowClick && onRowClick(item)}
                >
                  {columns.map((column) => (
                    <td key={column.key} className={cn("px-4 py-3 text-sm text-text", column.className)}>
                      {column.render ? column.render(item, index) : String(item[column.key] ?? "")}
                    </td>
                  ))}
                  {(onEdit || onDelete || onView) && (
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {onView && (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onView(item); }}
                            className="p-2 text-text-muted hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                            aria-label="View"
                          >
                            <Eye className="w-4 h-4" aria-hidden="true" />
                          </button>
                        )}
                        {onEdit && (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onEdit(item); }}
                            className="p-2 text-text-muted hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                            aria-label="Edit"
                          >
                            <Edit className="w-4 h-4" aria-hidden="true" />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onDelete(item); }}
                            className="p-2 text-text-muted hover:text-error hover:bg-error/10 rounded-lg transition-colors"
                            aria-label="Delete"
                          >
                            <Trash2 className="w-4 h-4" aria-hidden="true" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))) }
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="px-4 py-3 border-t border-border flex items-center justify-between">
            <p className="text-sm text-text-muted">
              Page {pagination.currentPage} of {pagination.totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" aria-hidden="true" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
              >
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
        )}
      </div>
  );
}