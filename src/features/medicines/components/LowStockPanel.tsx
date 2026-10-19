"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { AlertTriangle, PlusCircle } from "lucide-react";
import { StatusBadge } from "@/shared/components/feedback/StatusBadge";
import { STOCK_STATUS_MAP } from "../constants/medicine.constants";
import type { MedicineWithStock } from "../types/medicine.types";

interface LowStockPanelProps {
  medicines: MedicineWithStock[];
  onStockIn: (medicine: MedicineWithStock) => void;
}

export function LowStockPanel({ medicines, onStockIn }: LowStockPanelProps) {
  if (medicines.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-6 text-center text-sm text-muted-foreground">
          No low stock alerts. All inventories are above reorder levels.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20">
      <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base font-semibold flex items-center gap-2 text-amber-800 dark:text-amber-400">
          <AlertTriangle className="h-5 w-5" />
          Low Stock Alerts ({medicines.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {medicines.map((med) => (
          <div
            key={med.id}
            className="flex items-center justify-between p-3 rounded-md bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800/50 shadow-sm"
          >
            <div>
              <div className="font-medium text-sm">
                {med.name} {med.strength} ({med.dosageForm})
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Current: <span className="font-semibold text-rose-600">{med.totalStock} {med.unit}</span> (Reorder level: {med.reorderLevel})
              </div>
            </div>

            <div className="flex items-center gap-2">
              <StatusBadge status={med.stockStatus} statusMap={STOCK_STATUS_MAP} />
              <Button size="sm" variant="outline" onClick={() => onStockIn(med)} className="h-8">
                <PlusCircle className="h-3.5 w-3.5 mr-1" />
                Stock In
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
