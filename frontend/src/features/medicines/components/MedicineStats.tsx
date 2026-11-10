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
        title="Total medicines"
        value={totalMedicines}
        description="In the catalog"
        icon={<Package className="h-5 w-5" />}
        tone="blue"
      />
      <StatCard
        title="Low stock"
        value={lowStockCount}
        description="Below reorder level"
        icon={<AlertTriangle className="h-5 w-5" />}
        tone="amber"
      />
      <StatCard
        title="Expiring soon"
        value={expiringSoonCount}
        description="Within 60 days"
        icon={<Clock className="h-5 w-5" />}
        tone="amber"
      />
      <StatCard
        title="Expired batches"
        value={expiredCount}
        description="Can't be dispensed"
        icon={<ShieldAlert className="h-5 w-5" />}
        tone="red"
      />
    </div>
  );
}
