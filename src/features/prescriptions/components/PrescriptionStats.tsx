"use client";

import React from "react";
import { StatCard } from "@/shared/components/layout/StatCard";
import { FileText, Clock, CheckCircle2, PackageCheck, Ban } from "lucide-react";
import type { PrescriptionStatsDTO } from "../types/prescription.types";

interface PrescriptionStatsProps {
  stats?: PrescriptionStatsDTO;
}

export function PrescriptionStats({ stats }: PrescriptionStatsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      <StatCard
        title="Total Prescriptions"
        value={stats?.total ?? 0}
        description="All recorded orders"
        icon={<FileText className="h-4 w-4" />}
      />
      <StatCard
        title="Draft"
        value={stats?.draft ?? 0}
        description="Editable clinician drafts"
        icon={<Clock className="h-4 w-4 text-slate-500" />}
      />
      <StatCard
        title="Issued"
        value={stats?.issued ?? 0}
        description="Awaiting pharmacy dispensing"
        icon={<CheckCircle2 className="h-4 w-4 text-blue-500" />}
      />
      <StatCard
        title="Dispensed"
        value={stats?.dispensed ?? 0}
        description="Completed & stock deducted"
        icon={<PackageCheck className="h-4 w-4 text-emerald-500" />}
      />
      <StatCard
        title="Voided"
        value={stats?.voided ?? 0}
        description="Cancelled orders"
        icon={<Ban className="h-4 w-4 text-rose-500" />}
      />
    </div>
  );
}
