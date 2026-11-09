"use client";

import React from "react";
import { StatCard } from "@/components/layout/StatCard";
import { FileText, Clock, CheckCircle2, PackageCheck, Ban } from "lucide-react";
import type { PrescriptionStatsDTO } from "@backend/contracts";

interface PrescriptionStatsProps {
  stats?: PrescriptionStatsDTO;
}

export function PrescriptionStats({ stats }: PrescriptionStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      <StatCard
        title="Total Prescriptions"
        value={stats?.total ?? 0}
        description="All recorded orders"
        icon={<FileText className="h-5 w-5" />}
        tone="blue"
      />
      <StatCard
        title="Draft"
        value={stats?.draft ?? 0}
        description="Editable clinician drafts"
        icon={<Clock className="h-5 w-5" />}
        tone="blue"
      />
      <StatCard
        title="Issued"
        value={stats?.issued ?? 0}
        description="Awaiting pharmacy dispensing"
        icon={<CheckCircle2 className="h-5 w-5" />}
        tone="blue"
      />
      <StatCard
        title="Dispensed"
        value={stats?.dispensed ?? 0}
        description="Completed & stock deducted"
        icon={<PackageCheck className="h-5 w-5" />}
        tone="teal"
      />
      <StatCard
        title="Voided"
        value={stats?.voided ?? 0}
        description="Cancelled orders"
        icon={<Ban className="h-5 w-5" />}
        tone="red"
      />
    </div>
  );
}
