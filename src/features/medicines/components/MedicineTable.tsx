"use client";

import React from "react";
import { DataTable, type DataTableColumn } from "@/shared/components/data-table/DataTable";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { MoreHorizontal, PlusCircle, MinusCircle, SlidersHorizontal, History, Edit, Archive } from "lucide-react";
import { StatusBadge } from "@/shared/components/feedback/StatusBadge";
import { STOCK_STATUS_MAP } from "../constants/medicine.constants";
import type { MedicineWithStock } from "../types/medicine.types";

interface MedicineTableProps {
  medicines?: MedicineWithStock[];
  isLoading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
  search?: string;
  onSearchChange?: (val: string) => void;
  onStockIn: (medicine: MedicineWithStock) => void;
  onStockOut: (medicine: MedicineWithStock) => void;
  onAdjust: (medicine: MedicineWithStock) => void;
  onViewHistory: (medicine: MedicineWithStock) => void;
  onEdit: (medicine: MedicineWithStock) => void;
  onToggleArchive: (medicine: MedicineWithStock) => void;
  pagination?: {
    page: number;
    pageSize: number;
    totalPages: number;
    total: number;
    onPageChange: (page: number) => void;
  };
}

export function MedicineTable({
  medicines,
  isLoading,
  error,
  onRetry,
  search,
  onSearchChange,
  onStockIn,
  onStockOut,
  onAdjust,
  onViewHistory,
  onEdit,
  onToggleArchive,
  pagination,
}: MedicineTableProps) {
  const columns: DataTableColumn<MedicineWithStock>[] = [
    {
      header: "Medicine Name",
      accessorKey: "name",
      cell: (item) => (
        <div>
          <div className="font-medium text-foreground">{item.name}</div>
          {item.genericName && (
            <div className="text-xs text-muted-foreground">{item.genericName}</div>
          )}
        </div>
      ),
    },
    {
      header: "Form & Strength",
      cell: (item) => `${item.dosageForm} • ${item.strength}`,
    },
    {
      header: "On Hand",
      cell: (item) => (
        <span className="font-semibold">
          {item.totalStock} {item.unit}
        </span>
      ),
    },
    {
      header: "Reorder At",
      cell: (item) => `${item.reorderLevel} ${item.unit}`,
    },
    {
      header: "Status",
      cell: (item) => (
        <StatusBadge status={item.stockStatus} statusMap={STOCK_STATUS_MAP} />
      ),
    },
    {
      header: "Actions",
      cell: (item) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={() => onStockIn(item)}>
              <PlusCircle className="mr-2 h-4 w-4 text-emerald-600" />
              Stock In
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStockOut(item)}>
              <MinusCircle className="mr-2 h-4 w-4 text-blue-600" />
              Stock Out
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAdjust(item)}>
              <SlidersHorizontal className="mr-2 h-4 w-4 text-amber-600" />
              Adjust Stock
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onViewHistory(item)}>
              <History className="mr-2 h-4 w-4 text-purple-600" />
              Movement Log
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(item)}>
              <Edit className="mr-2 h-4 w-4 text-slate-600" />
              Edit Info
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onToggleArchive(item)}>
              <Archive className="mr-2 h-4 w-4 text-rose-600" />
              {item.isArchived ? "Unarchive" : "Archive"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <DataTable
      data={medicines as unknown as Record<string, unknown>[]}
      columns={columns as unknown as DataTableColumn<Record<string, unknown>>[]}
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      search={search}
      onSearchChange={onSearchChange}
      searchPlaceholder="Search by brand or generic name..."
      emptyTitle="No medicines found"
      emptyMessage="No medicines registered in the inventory yet."
      pagination={pagination}
    />
  );
}
