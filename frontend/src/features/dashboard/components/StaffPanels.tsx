import React from "react";
import Link from "next/link";
import { format } from "date-fns";
import { CalendarCheck, CheckCircle2, Package, Plus, ShieldCheck, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/feedback/StatusBadge";
import { InitialsAvatar } from "@/components/feedback/InitialsAvatar";
import { DashboardPanel, PanelEmpty } from "@/features/dashboard/components/DashboardPanel";
import { APPOINTMENT_STATUS_MAP } from "@/features/appointments/constants/appointment-status.constants";
import { STOCK_STATUS_MAP } from "@backend/contracts";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import type { AdminStaffDashboardData } from "@backend/contracts";

type Data = AdminStaffDashboardData;
type Appointment = Data["todayAppointments"][number];

const fullName = (appt: Appointment) =>
  `${appt.patient?.firstName ?? ""} ${appt.patient?.lastName ?? ""}`.trim() || "Patient";

/** The next visit still to happen today; highlighted like a "now serving" card. */
function nextUpId(items: Appointment[]): string | undefined {
  const now = Date.now();
  return items.find(
    (a) =>
      (a.status === "CONFIRMED" || a.status === "PENDING") &&
      new Date(a.scheduledAt).getTime() >= now - 30 * 60 * 1000
  )?.id;
}

function TimelineRow({ appt, isNext }: { appt: Appointment; isNext: boolean }) {
  return (
    <li className="grid grid-cols-[3.5rem_minmax(0,1fr)] items-center gap-3">
      <span className="text-sm font-semibold tabular-nums text-foreground">
        {format(new Date(appt.scheduledAt), "HH:mm")}
      </span>
      <div
        className={cn(
          "flex items-center gap-3 rounded-xl border px-4 py-3",
          isNext
            ? "border-transparent bg-primary text-primary-foreground shadow-md shadow-primary/20"
            : "border-border/80 bg-card"
        )}
      >
        <InitialsAvatar name={fullName(appt)} className={cn(isNext && "bg-white text-primary")} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold">{fullName(appt)}</p>
          <p
            className={cn(
              "flex items-center gap-1.5 truncate text-[13px]",
              isNext ? "text-blue-100" : "text-muted-foreground"
            )}
          >
            {appt.type === "ONLINE" && <Video className="h-3.5 w-3.5 shrink-0" />}
            <span className="truncate">{appt.clinician?.fullName}</span>
          </p>
        </div>
        <StatusBadge
          status={appt.status}
          statusMap={APPOINTMENT_STATUS_MAP}
          className={cn(isNext && "bg-white text-primary ring-0")}
        />
      </div>
    </li>
  );
}

export function TodayAppointmentsPanel({ items }: { items: Data["todayAppointments"] }) {
  const nextId = nextUpId(items);
  return (
    <DashboardPanel title="Today's appointments" linkLabel="View all" href={ROUTES.APPOINTMENTS}>
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
        <ul className="space-y-3">
          {items.map((appt) => (
            <TimelineRow key={appt.id} appt={appt} isNext={appt.id === nextId} />
          ))}
        </ul>
      )}
    </DashboardPanel>
  );
}

export function PendingPanel({ items }: { items: Data["pendingAppointments"] }) {
  return (
    <DashboardPanel title="Pending confirmations" linkLabel="Manage" href={ROUTES.APPOINTMENTS}>
      {items.length === 0 ? (
        <div className="flex items-center gap-3">
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
            <li key={appt.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <InitialsAvatar name={fullName(appt)} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-semibold text-foreground">
                  {fullName(appt)}
                </p>
                <p className="truncate text-[13px] text-muted-foreground">
                  {format(new Date(appt.scheduledAt), "MMM d · h:mm a")}
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
    <DashboardPanel title="Inventory alerts" linkLabel="Inventory" href={ROUTES.MEDICINES}>
      {items.length === 0 ? (
        <PanelEmpty
          icon={<ShieldCheck className="h-7 w-7" />}
          tone="bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300"
          title="Stock levels look good"
          description="No medicine is below its reorder level."
        />
      ) : (
        <ul className="space-y-3">
          {items.map((med) => (
            <li key={med.id} className="rounded-xl border border-border/80 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-semibold text-foreground">{med.name}</p>
                  <p className="text-[13px] text-muted-foreground">
                    {med.strength} · {med.dosageForm}
                  </p>
                </div>
                <StatusBadge status={med.stockStatus} statusMap={STOCK_STATUS_MAP} />
              </div>
              <div className="mt-3 flex items-center justify-between gap-3 border-t border-border/60 pt-3 text-[13px]">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Package className="h-4 w-4" />
                  <span className="font-semibold text-amber-700 dark:text-amber-400">
                    {med.totalStock} {med.unit}
                  </span>
                </span>
                <span className="rounded-lg border border-primary/20 bg-primary/5 px-2.5 py-1 font-medium text-primary">
                  Reorder at {med.reorderLevel}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </DashboardPanel>
  );
}
