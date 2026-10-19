"use client";

import React from "react";
import { StatCard } from "@/shared/components/layout/StatCard";
import { Package, AlertTriangle, Clock, ShieldAlert } from "lucide-react";

interface MedicineStatsProps {
  totalMedicines: number;
  lowStockCount: number;
  expiringSoonCount: number;
  expiredCount: number;
}

export function MedicineStats({
  totalMedicines,
  lowStockCount,
  expiringSoonCount,
  expiredCount,
}: MedicineStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Medicines"
        value={totalMedicines}
        description="Active catalog items"
        icon={<Package className="h-4 w-4" />}
      />
      <StatCard
        title="Low Stock Alerts"
        value={lowStockCount}
        description="Below reorder level"
        icon={<AlertTriangle className="h-4 w-4 text-amber-500" />}
      />
      <StatCard
        title="Expiring Soon"
        value={expiringSoonCount}
        description="Within next 60 days"
        icon={<Clock className="h-4 w-4 text-orange-500" />}
      />
      <StatCard
        title="Expired Batches"
        value={expiredCount}
        description="Cannot be dispensed"
        icon={<ShieldAlert className="h-4 w-4 text-rose-500" />}
      />
    </div>
  );
}
