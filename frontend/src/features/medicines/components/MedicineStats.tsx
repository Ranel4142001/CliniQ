"use client";

import React from "react";
import { StatCard } from "@/components/layout/StatCard";
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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Medicines"
        value={totalMedicines}
        description="Active catalog items"
        icon={<Package className="h-5 w-5" />}
        tone="blue"
      />
      <StatCard
        title="Low Stock Alerts"
        value={lowStockCount}
        description="Below reorder level"
        icon={<AlertTriangle className="h-5 w-5" />}
        tone="amber"
      />
      <StatCard
        title="Expiring Soon"
        value={expiringSoonCount}
        description="Within next 60 days"
        icon={<Clock className="h-5 w-5" />}
        tone="amber"
      />
      <StatCard
        title="Expired Batches"
        value={expiredCount}
        description="Cannot be dispensed"
        icon={<ShieldAlert className="h-5 w-5" />}
        tone="red"
      />
    </div>
  );
}
