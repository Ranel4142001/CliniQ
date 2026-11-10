"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, PlusCircle } from "lucide-react";
import { StatusBadge } from "@/components/feedback/StatusBadge";
import { SectionCard, SectionEmpty, SectionList } from "@/components/layout/SectionCard";
import { STOCK_STATUS_MAP } from "@backend/contracts";
import type { MedicineWithStock } from "@backend/contracts";

interface LowStockPanelProps {
  medicines: MedicineWithStock[];
  onStockIn: (medicine: MedicineWithStock) => void;
}

export function LowStockPanel({ medicines, onStockIn }: LowStockPanelProps) {
  return (
    <SectionCard
      title="Low stock"
      subtitle="At or below reorder level"
      icon={<AlertTriangle className="h-5 w-5" />}
      tone="amber"
      count={medicines.length}
    >
      {medicines.length === 0 ? (
        <SectionEmpty>All medicines are above their reorder levels.</SectionEmpty>
      ) : (
        <SectionList>
          {medicines.map((med) => (
            <li key={med.id} className="flex flex-wrap items-center justify-between gap-3 py-3.5">
              <div className="min-w-0">
                <p className="truncate text-[15px] font-semibold text-foreground">
                  {med.name}{" "}
                  <span className="text-[13px] font-normal text-muted-foreground">
                    {med.strength} · {med.dosageForm}
                  </span>
                </p>
                <p className="mt-0.5 text-[13px] text-muted-foreground">
                  <span className="font-semibold text-amber-700 dark:text-amber-400">
                    {med.totalStock} {med.unit}
                  </span>{" "}
                  on hand · reorder at {med.reorderLevel}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={med.stockStatus} statusMap={STOCK_STATUS_MAP} />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onStockIn(med)}
                  className="h-9 gap-1.5 rounded-lg font-semibold"
                >
                  <PlusCircle className="h-4 w-4" />
                  Stock in
                </Button>
              </div>
            </li>
          ))}
        </SectionList>
      )}
    </SectionCard>
  );
}
