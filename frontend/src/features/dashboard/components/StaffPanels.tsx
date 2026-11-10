import React from "react";
import Link from "next/link";
import { CalendarCheck, CheckCircle2, Plus, ShieldCheck, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/feedback/StatusBadge";
import { DashboardPanel, PanelEmpty } from "@/features/dashboard/components/DashboardPanel";
import { APPOINTMENT_STATUS_MAP } from "@/features/appointments/constants/appointment-status.constants";
import { STOCK_STATUS_MAP } from "@backend/contracts";
import { ROUTES } from "@/constants/routes";
import type { AdminStaffDashboardData } from "@backend/contracts";

type Data = AdminStaffDashboardData;

const timeOf = (iso: string | Date) =>
  new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

const initialsOf = (first?: string | null, last?: string | null) =>
  `${first?.[0] ?? "P"}${last?.[0] ?? ""}`.toUpperCase();

export function TodayAppointmentsPanel({ items }: { items: Data["todayAppointments"] }) {
  return (
    <DashboardPanel
      title="Today's appointments"
      subtitle={`${items.length} patient${items.length === 1 ? "" : "s"} queued for today`}
      linkLabel="View all"
      href={ROUTES.APPOINTMENTS}
    >
      {items.length === 0 ? (
        <PanelEmpty
          icon={<CalendarCheck className="h-7 w-7" />}
          tone="bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300"
          title="No appointments today"
          description="New bookings will appear here automatically."
          action={
            <Button asChild className="h-11 gap-2 rounded-xl px-4">
              <Link href={ROUTES.APPOINTMENTS}>
                <Plus className="h-4 w-4" /> Book appointment
              </Link>
            </Button>
          }
        />
      ) : (
        <ul className="divide-y divide-border/60">
          {items.map((appt) => (
            <li key={appt.id} className="flex items-center justify-between gap-3 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                  {initialsOf(appt.patient?.firstName, appt.patient?.lastName)}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-semibold text-foreground">
                    {appt.patient?.firstName} {appt.patient?.lastName}
                  </p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[13px] text-muted-foreground">
                    <span className="font-semibold text-foreground">
                      {timeOf(appt.scheduledAt)}
                    </span>
                    <span className="truncate">{appt.clinician?.fullName}</span>
                    {appt.type === "ONLINE" && (
                      <span className="inline-flex items-center gap-1 font-medium text-violet-700 dark:text-violet-300">
                        <Video className="h-3.5 w-3.5" /> Online
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <StatusBadge status={appt.status} statusMap={APPOINTMENT_STATUS_MAP} />
            </li>
          ))}
        </ul>
      )}
    </DashboardPanel>
  );
}

export function PendingPanel({ items }: { items: Data["pendingAppointments"] }) {
  return (
    <DashboardPanel
      title="Pending confirmations"
      subtitle="Front desk or clinician review"
      linkLabel="Manage"
      href={ROUTES.APPOINTMENTS}
    >
      {items.length === 0 ? (
        <div className="flex items-center gap-3 px-1 py-1">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300">
            <CheckCircle2 className="h-5 w-5" />
          </span>
          <div>
            <p className="text-[15px] font-semibold text-foreground">All caught up</p>
            <p className="text-[13px] text-muted-foreground">Every appointment is confirmed.</p>
          </div>
        </div>
      ) : (
        <ul className="divide-y divide-border/60">
          {items.map((appt) => (
            <li key={appt.id} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="truncate text-[15px] font-semibold text-foreground">
                  {appt.patient?.firstName} {appt.patient?.lastName}
                </p>
                <p className="truncate text-[13px] text-muted-foreground">
                  {new Date(appt.scheduledAt).toLocaleDateString()} at {timeOf(appt.scheduledAt)} ·{" "}
                  {appt.reason}
                </p>
              </div>
              <Button asChild size="sm" variant="outline" className="h-9 rounded-lg font-semibold">
                <Link href={ROUTES.APPOINTMENTS}>Review</Link>
              </Button>
            </li>
          ))}
        </ul>
      )}
    </DashboardPanel>
  );
}

export function InventoryPanel({ items }: { items: Data["lowStockMedicines"] }) {
  return (
    <DashboardPanel
      title="Inventory alerts"
      subtitle="At or below reorder level"
      linkLabel="Inventory"
      href={ROUTES.MEDICINES}
    >
      {items.length === 0 ? (
        <PanelEmpty
          icon={<ShieldCheck className="h-7 w-7" />}
          tone="bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300"
          title="Stock levels look good"
          description="No medicine is below its reorder level."
        />
      ) : (
        <ul className="divide-y divide-border/60">
          {items.map((med) => {
            const percent =
              med.reorderLevel > 0 ? Math.min(100, (med.totalStock / med.reorderLevel) * 100) : 0;
            return (
              <li key={med.id} className="space-y-2 py-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="min-w-0 truncate text-[15px] font-semibold text-foreground">
                    {med.name}{" "}
                    <span className="text-[13px] font-normal text-muted-foreground">
                      {med.strength}
                    </span>
                  </p>
                  <StatusBadge status={med.stockStatus} statusMap={STOCK_STATUS_MAP} />
                </div>
                <div
                  className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-muted"
                  aria-hidden="true"
                >
                  <div
                    className="h-full rounded-full bg-amber-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <p className="text-[13px] text-muted-foreground">
                  <span className="font-semibold text-amber-700 dark:text-amber-400">
                    {med.totalStock} {med.unit}
                  </span>{" "}
                  on hand · reorder at {med.reorderLevel}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </DashboardPanel>
  );
}
