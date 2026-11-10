"use client";

import React from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { LoadingState } from "@/components/feedback/LoadingState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { useDashboard } from "@/features/dashboard/hooks/use-dashboard";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { AdminStaffDashboard } from "@/features/dashboard/components/AdminStaffDashboard";
import { PatientDashboard } from "@/features/dashboard/components/PatientDashboard";
import type { AdminStaffDashboardData, PatientDashboardData } from "@backend/contracts";

export default function DashboardPage() {
  const { data, isLoading, error, refetch } = useDashboard();
  const { user } = useCurrentUser();

  return (
    <div className="space-y-6">
      {!data && <PageHeader title="Dashboard" description="Today's clinic activity at a glance." />}

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
            <PatientDashboard data={data.data as PatientDashboardData} userName={user?.fullName} />
          ) : (
            <AdminStaffDashboard
              data={data.data as AdminStaffDashboardData}
              userName={user?.fullName}
            />
          )}
        </>
      )}
    </div>
  );
}
