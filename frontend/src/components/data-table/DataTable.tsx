"use client";

import React, { ReactNode } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SearchInput } from "@/components/data-table/SearchInput";
import { DataTablePaginationBar } from "@/components/data-table/DataTablePaginationBar";
import { DataTableCards } from "@/components/data-table/DataTableCards";
import { LoadingState } from "@/components/feedback/LoadingState";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";

export interface DataTableColumn<T> {
  header: string | ReactNode;
  accessorKey?: keyof T | string;
  cell?: (item: T) => ReactNode;
  sortable?: boolean;
  className?: string;
}

export interface DataTablePagination {
  page: number;
  pageSize: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
}

interface DataTableProps<T> {
  data?: T[];
  columns: DataTableColumn<T>[];
  isLoading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyMessage?: string;
  search?: string;
  onSearchChange?: (val: string) => void;
  searchPlaceholder?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSortChange?: (field: string, order: "asc" | "desc") => void;
  pagination?: DataTablePagination;
  actions?: ReactNode;
  onRowClick?: (item: T) => void;
  className?: string;
}

export function DataTable<T extends Record<string, unknown>>({
  data = [],
  columns,
  isLoading,
  error,
  onRetry,
  emptyTitle,
  emptyMessage,
  search,
  onSearchChange,
  searchPlaceholder,
  sortBy,
  sortOrder,
  onSortChange,
  pagination,
  actions,
  onRowClick,
  className = "",
}: DataTableProps<T>) {
  const handleSort = (key?: keyof T | string) => {
    if (!key || !onSortChange) return;
    const keyStr = String(key);
    const nextOrder = sortBy === keyStr && sortOrder === "asc" ? "desc" : "asc";
    onSortChange(keyStr, nextOrder);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {(onSearchChange || actions) && (
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          {onSearchChange && (
            <SearchInput
              value={search}
              onChange={onSearchChange}
              placeholder={searchPlaceholder}
              className="w-full sm:w-72"
            />
          )}
          {actions && <div className="ml-auto flex items-center gap-2">{actions}</div>}
        </div>
      )}

      <div className="shadow-xs overflow-hidden rounded-xl border border-border/80 bg-card">
        {error ? (
          <ErrorState message={error.message} onRetry={onRetry} />
        ) : isLoading ? (
          <LoadingState />
        ) : data.length === 0 ? (
          <EmptyState title={emptyTitle} description={emptyMessage} />
        ) : (
          <>
            {/* Phones and tablets: one card per row. Laptops and up: the full table. */}
            <div className="lg:hidden">
              <DataTableCards data={data} columns={columns} onRowClick={onRowClick} />
            </div>
            <div className="hidden lg:block">
              <Table>
                <TableHeader className="border-b border-border/80 bg-muted/40">
                  <TableRow className="hover:bg-transparent">
                    {columns.map((col, idx) => (
                      <TableHead
                        key={idx}
                        className={`py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground ${col.className ?? ""}`}
                      >
                        {col.sortable && col.accessorKey && onSortChange ? (
                          <button
                            type="button"
                            onClick={() => handleSort(col.accessorKey)}
                            className="flex items-center gap-1 font-semibold transition-colors hover:text-foreground"
                          >
                            {col.header}
                            {sortBy === col.accessorKey ? (
                              sortOrder === "asc" ? (
                                <ArrowUp className="h-3.5 w-3.5" />
                              ) : (
                                <ArrowDown className="h-3.5 w-3.5" />
                              )
                            ) : (
                              <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />
                            )}
                          </button>
                        ) : (
                          col.header
                        )}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-border/60">
                  {data.map((item, rowIdx) => (
                    <TableRow
                      key={rowIdx}
                      onClick={() => onRowClick?.(item)}
                      className={`transition-colors hover:bg-muted/30 ${onRowClick ? "cursor-pointer" : ""}`}
                    >
                      {columns.map((col, colIdx) => (
                        <TableCell key={colIdx} className={`py-3 ${col.className ?? ""}`}>
                          {col.cell
                            ? col.cell(item)
                            : col.accessorKey
                              ? String(item[col.accessorKey as string] ?? "-")
                              : null}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </div>

      {pagination && !isLoading && !error && data.length > 0 && (
        <DataTablePaginationBar
          page={pagination.page}
          pageSize={pagination.pageSize}
          total={pagination.total}
          totalPages={pagination.totalPages}
          onPageChange={pagination.onPageChange}
        />
      )}
    </div>
  );
}
