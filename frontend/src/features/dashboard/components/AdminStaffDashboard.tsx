"use client";

import React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CalendarClock,
  CalendarPlus,
  Clock,
  Hourglass,
  Users,
  UserPlus,
} from "lucide-react";
import { StatCard } from "@/components/layout/StatCard";
import { DashboardHeader, HEADER_BUTTON } from "@/features/dashboard/components/DashboardHeader";
import { QuickActionTiles } from "@/features/dashboard/components/QuickActionTiles";
import { PendingPanel, TodayAppointmentsPanel } from "@/features/dashboard/components/StaffPanels";
import { AvailableDoctorsPanel } from "@/features/dashboard/components/AvailableDoctorsPanel";
import { DASHBOARD_LINKS } from "@/features/dashboard/constants/dashboard-links";
import { clinicSummary } from "@/features/dashboard/utils/greeting";
import { ROUTES } from "@/constants/routes";
import type { AdminStaffDashboardData } from "@backend/contracts";

interface AdminStaffDashboardProps {
  data: AdminStaffDashboardData;
  userName?: string | null;
}

export function AdminStaffDashboard({ data, userName }: AdminStaffDashboardProps) {
  const { stats, todayAppointments, pendingAppointments } = data;

  return (
    <div className="space-y-6">
      <DashboardHeader
        fullName={userName}
        summary={clinicSummary(stats)}
        actions={
          <>
            <Link href={ROUTES.PATIENTS} className={HEADER_BUTTON.secondary}>
              <UserPlus className="h-4 w-4" /> Register patient
            </Link>
            <Link href={ROUTES.APPOINTMENTS} className={HEADER_BUTTON.primary}>
              <CalendarPlus className="h-4 w-4" /> Book appointment
            </Link>
          </>
        }
      />

      <QuickActionTiles />

      <section
        aria-label="Today at a glance"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
      >
        <StatCard
          title="Today's schedule"
          href={DASHBOARD_LINKS.TODAY}
          value={stats.todayAppointmentsCount}
          icon={<CalendarClock />}
          tone="blue"
          description="Scheduled visits today"
        />
        <StatCard
          title="Pending requests"
          href={DASHBOARD_LINKS.PENDING}
          value={stats.pendingAppointmentsCount}
          icon={<Clock />}
          tone="teal"
          description="Awaiting confirmation"
        />
        <StatCard
          title="Low stock items"
          href={DASHBOARD_LINKS.LOW_STOCK}
          value={stats.lowStockCount}
          icon={<AlertTriangle />}
          tone="amber"
          isAlert
          description={stats.lowStockCount > 0 ? "Needs restocking" : "At or below reorder"}
        />
        <StatCard
          title="Expiring soon"
          href={DASHBOARD_LINKS.EXPIRING}
          value={stats.expiringCount}
          icon={<Hourglass />}
          tone="amber"
          isAlert
          description="Within 60 days"
        />
        <StatCard
          title="Total patients"
          href={DASHBOARD_LINKS.PATIENTS}
          value={stats.totalPatientsCount}
          icon={<Users />}
          tone="blue"
          description="Active records"
        />
      </section>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TodayAppointmentsPanel items={todayAppointments} />
        </div>
        <div className="space-y-6">
          <PendingPanel items={pendingAppointments} />
          <AvailableDoctorsPanel />
        </div>
      </div>
    </div>
  );
}
