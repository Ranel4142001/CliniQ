"use client";

import React from "react";
import { useMedicines } from "@/features/medicines/hooks/use-medicines";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { STOCK_STATUS } from "@backend/contracts";

interface MedicineSelectProps {
  value?: string;
  onValueChange: (medicineId: string) => void;
  disabled?: boolean;
  placeholder?: string;
  excludeArchived?: boolean;
}

export function MedicineSelect({
  value,
  onValueChange,
  disabled = false,
  placeholder = "Select a medicine...",
  excludeArchived = true,
}: MedicineSelectProps) {
  const { data, isLoading } = useMedicines({
    isArchived: excludeArchived ? false : undefined,
    pageSize: 100,
  });

  const medicines = data?.items ?? [];

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled || isLoading}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={isLoading ? "Loading medicines..." : placeholder} />
      </SelectTrigger>
      <SelectContent>
        {medicines.length === 0 ? (
          <div className="p-2 text-sm text-muted-foreground text-center">
            No medicines available
          </div>
        ) : (
          medicines.map((med) => {
            const isOutOfStock = med.stockStatus === STOCK_STATUS.OUT_OF_STOCK || med.stockStatus === STOCK_STATUS.EXPIRED;
            return (
              <SelectItem
                key={med.id}
                value={med.id}
                disabled={isOutOfStock}
                className="flex items-center justify-between"
              >
                <span>
                  {med.name} {med.strength} ({med.dosageForm})
                  {med.genericName ? ` — ${med.genericName}` : ""}
                </span>
                <span className="ml-2 text-xs text-muted-foreground">
                  ({med.totalStock} {med.unit} available)
                </span>
              </SelectItem>
            );
          })
        )}
      </SelectContent>
    </Select>
  );
}
