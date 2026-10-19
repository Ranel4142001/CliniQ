"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Clock, ShieldAlert } from "lucide-react";
import type { MedicineBatchWithMedicine } from "../types/medicine.types";

interface ExpiringPanelProps {
  expiringSoon: MedicineBatchWithMedicine[];
  expired: MedicineBatchWithMedicine[];
  onStockAdjustment?: (medicineId: string) => void;
}

export function ExpiringPanel({ expiringSoon, expired }: ExpiringPanelProps) {
  const totalAlerts = expiringSoon.length + expired.length;

  if (totalAlerts === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-6 text-center text-sm text-muted-foreground">
          No expiry alerts. All inventory batches have healthy shelf life.
        </CardContent>
      </Card>
    );
  }

  const getDaysLeft = (date: Date | string) => {
    const diffTime = new Date(date).getTime() - new Date().setHours(0, 0, 0, 0);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <Card className="border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20">
      <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base font-semibold flex items-center gap-2 text-rose-800 dark:text-rose-400">
          <Clock className="h-5 w-5" />
          Expiry Alerts ({totalAlerts})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {expired.map((batch) => (
          <div
            key={batch.id}
            className="flex items-center justify-between p-3 rounded-md bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-800 shadow-sm"
          >
            <div>
              <div className="font-medium text-sm text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                <ShieldAlert className="h-4 w-4" />
                {batch.medicine.name} {batch.medicine.strength} • Batch: {batch.batchNo}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Expired on {new Date(batch.expiryDate).toLocaleDateString()} • {batch.quantity} {batch.medicine.unit} remaining
              </div>
            </div>
            <Badge variant="destructive">EXPIRED</Badge>
          </div>
        ))}

        {expiringSoon.map((batch) => {
          const days = getDaysLeft(batch.expiryDate);
          return (
            <div
              key={batch.id}
              className="flex items-center justify-between p-3 rounded-md bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 shadow-sm"
            >
              <div>
                <div className="font-medium text-sm">
                  {batch.medicine.name} {batch.medicine.strength} • Batch: {batch.batchNo}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Expires {new Date(batch.expiryDate).toLocaleDateString()} ({days} days left) • {batch.quantity} {batch.medicine.unit}
                </div>
              </div>
              <Badge variant="outline" className="border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-950/40">
                Expiring Soon
              </Badge>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
