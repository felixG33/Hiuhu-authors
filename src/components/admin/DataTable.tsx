"use client";

import React, { useState } from "react";
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, Filter, Trash2, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  searchPlaceholder?: string;
  searchKey?: keyof T;
  filterOptions?: {
    label: string;
    key: keyof T;
    options: { label: string; value: string }[];
  }[];
  onBulkDelete?: (selectedIds: string[]) => void;
  onBulkPublish?: (selectedIds: string[]) => void;
  getRowId?: (row: T) => string;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  searchPlaceholder = "Search items...",
  searchKey,
  filterOptions,
  onBulkDelete,
  onBulkPublish,
  getRowId = (row) => row.id,
  emptyTitle = "No entries found",
  emptyDescription = "There are no records matching your current filter criteria.",
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sortColumn, setSortColumn] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Filter Data
  let filtered = data.filter((item) => {
    // Search filter
    if (search && searchKey) {
      const val = item[searchKey];
      if (typeof val === "string" && !val.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
    }
    // Custom filters
    for (const [key, value] of Object.entries(filters)) {
      if (value && String(item[key]) !== value) {
        return false;
      }
    }
    return true;
  });

  // Sort Data
  if (sortColumn) {
    filtered = [...filtered].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];
      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      return sortDirection === "asc" ? 1 : -1;
    });
  }

  // Pagination
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(paginated.map(getRowId));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSort = (key: keyof T) => {
    if (sortColumn === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(key);
      setSortDirection("asc");
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-ink-950 p-4 rounded-sm border border-parchment-300 dark:border-ink-800">
        <div className="flex flex-1 items-center gap-3">
          {searchKey && (
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-ink-400" />
              <Input
                type="text"
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9 h-9"
              />
            </div>
          )}

          {filterOptions?.map((f) => (
            <select
              key={String(f.key)}
              value={filters[String(f.key)] || ""}
              onChange={(e) => {
                setFilters((prev) => ({ ...prev, [String(f.key)]: e.target.value }));
                setCurrentPage(1);
              }}
              className="h-9 px-3 rounded-sm border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-950 text-xs text-ink-800 dark:text-parchment-200 focus:outline-none focus:ring-1 focus:ring-amber-700"
            >
              <option value="">{f.label}: All</option>
              {f.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ))}
        </div>

        {/* Bulk Action Controls */}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2 animate-in fade-in">
            <span className="text-xs font-mono text-ink-500">
              {selectedIds.length} selected
            </span>
            {onBulkPublish && (
              <Button
                size="sm"
                variant="outline"
                className="text-xs gap-1"
                onClick={() => onBulkPublish(selectedIds)}
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                Publish
              </Button>
            )}
            {onBulkDelete && (
              <Button
                size="sm"
                variant="destructive"
                className="text-xs gap-1"
                onClick={() => onBulkDelete(selectedIds)}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Table Container */}
      <div className="rounded-sm border border-parchment-300 dark:border-ink-800 bg-white dark:bg-ink-950 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-parchment-100/70 dark:bg-ink-900/60 border-b border-parchment-300 dark:border-ink-800 font-mono text-ink-600 dark:text-parchment-300 uppercase tracking-wider">
              <tr>
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={paginated.length > 0 && selectedIds.length === paginated.length}
                    onChange={handleSelectAll}
                    className="rounded-xs border-ink-300 text-amber-700 focus:ring-amber-700"
                  />
                </th>
                {columns.map((col, idx) => (
                  <th
                    key={idx}
                    className={`px-4 py-3 font-semibold ${
                      col.sortable && col.accessorKey ? "cursor-pointer select-none hover:text-ink-950 dark:hover:text-white" : ""
                    }`}
                    onClick={() => col.sortable && col.accessorKey && handleSort(col.accessorKey)}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{col.header}</span>
                      {col.sortable && <ArrowUpDown className="h-3 w-3 opacity-60" />}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-parchment-200 dark:divide-ink-800 text-ink-900 dark:text-parchment-100">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className="p-12 text-center">
                    <p className="font-serif text-base font-semibold text-ink-800 dark:text-parchment-200">{emptyTitle}</p>
                    <p className="text-xs text-ink-500 dark:text-parchment-400 mt-1">{emptyDescription}</p>
                  </td>
                </tr>
              ) : (
                paginated.map((row) => {
                  const id = getRowId(row);
                  const isSelected = selectedIds.includes(id);

                  return (
                    <tr
                      key={id}
                      className={`hover:bg-parchment-50/80 dark:hover:bg-ink-900/40 transition-colors ${
                        isSelected ? "bg-amber-50/50 dark:bg-amber-950/20" : ""
                      }`}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(id)}
                          className="rounded-xs border-ink-300 text-amber-700 focus:ring-amber-700"
                        />
                      </td>
                      {columns.map((col, idx) => (
                        <td key={idx} className="px-4 py-3">
                          {col.cell
                            ? col.cell(row)
                            : col.accessorKey
                            ? String(row[col.accessorKey] ?? "")
                            : null}
                        </td>
                      ))}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-parchment-200 dark:border-ink-800 bg-parchment-50/50 dark:bg-ink-900/20 font-mono text-xs">
            <span className="text-ink-500">
              Page {currentPage} of {totalPages} ({filtered.length} total)
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
