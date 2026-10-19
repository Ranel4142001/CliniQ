"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { DataTable, type DataTableColumn } from "@/shared/components/data-table/DataTable";
import { Badge } from "@/shared/components/ui/badge";
import { useStockMovements } from "../hooks/use-medicines";
import type { StockMovementWithRelations } from "../types/medicine.types";

interface MovementHistoryTableProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medicineId?: string;
  medicineTitle?: string;
}

export function MovementHistoryTable({
  open,
  onOpenChange,
  medicineId,
  medicineTitle,
}: MovementHistoryTableProps) {
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading, error, refetch } = useStockMovements({
    medicineId,
    page,
    pageSize,
  });

  const columns: DataTableColumn<StockMovementWithRelations>[] = [
    {
      header: "Date & Time",
      accessorKey: "createdAt",
      cell: (item) => new Date(item.createdAt).toLocaleString(),
    },
    {
      header: "Type",
      accessorKey: "type",
      cell: (item) => {
        const variants: Record<string, string> = {
          STOCK_IN: "bg-emerald-600 text-white",
          STOCK_OUT: "bg-blue-600 text-white",
          ADJUSTMENT: "bg-amber-600 text-white",
        };
        return (
          <Badge className={variants[item.type] || "bg-muted text-foreground"}>
            {item.type}
          </Badge>
        );
      },
    },
    {
      header: "Batch No",
      accessorKey: "batch.batchNo",
      cell: (item) => item.batch?.batchNo || "—",
    },
    {
      header: "Quantity",
      accessorKey: "quantity",
      cell: (item) => (
        <span
          className={`font-semibold ${
            item.type === "STOCK_IN" ? "text-emerald-600" : "text-rose-600"
          }`}
        >
          {item.type === "STOCK_IN" ? `+${item.quantity}` : `-${item.quantity}`}
        </span>
      ),
    },
    {
      header: "Reason / Notes",
      accessorKey: "reason",
      cell: (item) => item.reason || "—",
    },
    {
      header: "Performed By",
      accessorKey: "performedBy.fullName",
      cell: (item) => item.performedBy?.fullName || "—",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Stock Movement History {medicineTitle ? `• ${medicineTitle}` : ""}
          </DialogTitle>
        </DialogHeader>

        <div className="pt-2">
          <DataTable
            data={data?.items as unknown as Record<string, unknown>[]}
            columns={columns as unknown as DataTableColumn<Record<string, unknown>>[]}
            isLoading={isLoading}
            error={error as Error}
            onRetry={refetch}
            emptyTitle="No movements recorded"
            emptyMessage="Stock movement logs will appear here when stock is added, deducted, or adjusted."
            pagination={{
              page: data?.meta?.page ?? page,
              pageSize: data?.meta?.pageSize ?? pageSize,
              totalPages: data?.meta?.totalPages ?? 1,
              total: data?.meta?.total ?? 0,
              onPageChange: setPage,
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
