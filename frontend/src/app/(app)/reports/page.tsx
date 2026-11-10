"use client";

import React, { useState } from "react";
import { ROUTES } from "@/constants/routes";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { ReportViewer } from "@/features/reports/components/ReportViewer";
import {
  appointmentsReportConfig,
  consultationsReportConfig,
  inventoryReportConfig,
  movementsReportConfig,
  prescriptionsReportConfig,
} from "@/features/reports/config/report-configs";
import { Calendar, UserCheck, Pill, ArrowLeftRight, FileText } from "lucide-react";
import type { ReportKey } from "@backend/contracts";
import type { ReportConfig } from "@/features/reports/types/report-config.types";

const REPORTS: Array<{
  key: ReportKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config: ReportConfig<any>;
}> = [
  { key: "appointments", label: "Appointments", icon: Calendar, config: appointmentsReportConfig },
  {
    key: "consultations",
    label: "Patient Visits",
    icon: UserCheck,
    config: consultationsReportConfig,
  },
  { key: "inventory", label: "Inventory", icon: Pill, config: inventoryReportConfig },
  {
    key: "movements",
    label: "Stock Movements",
    icon: ArrowLeftRight,
    config: movementsReportConfig,
  },
  {
    key: "prescriptions",
    label: "Prescriptions",
    icon: FileText,
    config: prescriptionsReportConfig,
  },
];

export default function ReportsPage() {
  const [activeKey, setActiveKey] = useState<ReportKey>("appointments");

  const currentReport = REPORTS.find((r) => r.key === activeKey) || REPORTS[0];

  return (
    <div className="space-y-6">
      <PageHeader
        feature={ROUTES.REPORTS}
        title="Reports"
        description="Filter clinic reports by date and export them as CSV or PDF."
      />

      <div className="flex flex-wrap items-center gap-2 border-b pb-3">
        {REPORTS.map((r) => {
          const Icon = r.icon;
          const isActive = r.key === activeKey;
          return (
            <Button
              key={r.key}
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveKey(r.key)}
              className="text-xs"
            >
              <Icon className="mr-1.5 h-3.5 w-3.5" />
              {r.label}
            </Button>
          );
        })}
      </div>

      <div>
        <div className="mb-3">
          <h3 className="text-base font-semibold">{currentReport.config.title}</h3>
          <p className="text-xs text-muted-foreground">{currentReport.config.description}</p>
        </div>

        <ReportViewer key={currentReport.key} config={currentReport.config} />
      </div>
    </div>
  );
}
