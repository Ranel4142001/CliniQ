"use client";

import React from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { LoadingState } from "@/components/feedback/LoadingState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { useDashboard } from "@/features/dashboard/hooks/use-dashboard";
import { AdminStaffDashboard } from "@/features/dashboard/components/AdminStaffDashboard";
import { PatientDashboard } from "@/features/dashboard/components/PatientDashboard";
import type {
  AdminStaffDashboardData,
  PatientDashboardData,
} from "@backend/contracts";

export default function DashboardPage() {
  const { data, isLoading, error, refetch } = useDashboard();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clinical Dashboard"
        description="Real-time clinic activity, patient appointments, and inventory status"
      />

      {isLoading && <LoadingState message="Loading dashboard overview..." />}

      {error && (
        <ErrorState
          title="Failed to load dashboard"
          message={error.message || "An unexpected error occurred while loading dashboard metrics."}
          onRetry={() => refetch()}
        />
      )}

      {data && (
        <>
          {data.role === "PATIENT" ? (
            <PatientDashboard data={data.data as PatientDashboardData} />
          ) : (
            <AdminStaffDashboard data={data.data as AdminStaffDashboardData} />
          )}
        </>
      )}
    </div>
  );
}
