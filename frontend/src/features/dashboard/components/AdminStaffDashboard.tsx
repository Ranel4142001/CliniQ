"use client";

import React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CalendarClock,
  CalendarPlus,
  Hourglass,
  Users,
  UserPlus,
  Clock,
} from "lucide-react";
import { StatCard } from "@/components/layout/StatCard";
import { BANNER_BUTTON, WelcomeBanner } from "@/features/dashboard/components/WelcomeBanner";
import { QuickActionTiles } from "@/features/dashboard/components/QuickActionTiles";
import {
  InventoryPanel,
  PendingPanel,
  TodayAppointmentsPanel,
} from "@/features/dashboard/components/StaffPanels";
import { clinicSummary } from "@/features/dashboard/utils/greeting";
import { ROUTES } from "@/constants/routes";
import type { AdminStaffDashboardData } from "@backend/contracts";

interface AdminStaffDashboardProps {
  data: AdminStaffDashboardData;
  userName?: string | null;
}

export function AdminStaffDashboard({ data, userName }: AdminStaffDashboardProps) {
  const { stats, todayAppointments, pendingAppointments, lowStockMedicines } = data;

  return (
    <div className="space-y-6 sm:space-y-8">
      <WelcomeBanner
        fullName={userName}
        summary={clinicSummary(stats)}
        actions={
          <>
            <Link href={ROUTES.APPOINTMENTS} className={BANNER_BUTTON.primary}>
              <CalendarPlus className="h-4 w-4" /> Book appointment
            </Link>
            <Link href={ROUTES.PATIENTS} className={BANNER_BUTTON.secondary}>
              <UserPlus className="h-4 w-4" /> Register patient
            </Link>
          </>
        }
      />

      <section
        aria-label="Today at a glance"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
      >
        <StatCard
          title="Today's schedule"
          value={stats.todayAppointmentsCount}
          icon={<CalendarClock className="h-5 w-5" />}
          tone="blue"
          description="Scheduled visits today"
        />
        <StatCard
          title="Pending requests"
          value={stats.pendingAppointmentsCount}
          icon={<Clock className="h-5 w-5" />}
          tone="teal"
          description="Awaiting confirmation"
        />
        <StatCard
          title="Low stock items"
          value={stats.lowStockCount}
          icon={<AlertTriangle className="h-5 w-5" />}
          tone="red"
          isAlert
          description={stats.lowStockCount > 0 ? "Needs restocking" : "At or below reorder"}
        />
        <StatCard
          title="Expiring soon"
          value={stats.expiringCount}
          icon={<Hourglass className="h-5 w-5" />}
          tone="amber"
          isAlert
          description="Batches expiring in 60 days"
        />
        <StatCard
          title="Total patients"
          value={stats.totalPatientsCount}
          icon={<Users className="h-5 w-5" />}
          tone="blue"
          description="Active registered records"
        />
      </section>

      <QuickActionTiles />

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <TodayAppointmentsPanel items={todayAppointments} />
        </div>
        <div className="space-y-6 lg:col-span-2">
          <PendingPanel items={pendingAppointments} />
          <InventoryPanel items={lowStockMedicines} />
        </div>
      </div>
    </div>
  );
}
