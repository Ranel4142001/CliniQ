"use client";

import React from "react";
import { Clock, Loader2, Stethoscope } from "lucide-react";
import { TonePill, type StatusTone } from "@/components/feedback/StatusBadge";
import { ErrorState } from "@/components/feedback/ErrorState";
import { InitialsAvatar } from "@/components/feedback/InitialsAvatar";
import { DashboardPanel, PanelEmpty } from "@/features/dashboard/components/DashboardPanel";
import {
  useAvailableDoctors,
  type AvailableDoctor,
} from "@/features/dashboard/hooks/use-available-doctors";
import type { DoctorStatus } from "@/features/dashboard/utils/doctor-availability";
import { ROUTES } from "@/constants/routes";

const STATUS_PILL: Record<DoctorStatus, { label: string; tone: StatusTone }> = {
  AVAILABLE: { label: "Available", tone: "green" },
  FULLY_BOOKED: { label: "Fully booked", tone: "amber" },
  DONE_FOR_TODAY: { label: "Done for today", tone: "neutral" },
  CLOSED: { label: "Clinic closed", tone: "neutral" },
};

function DoctorCard({ doctor }: { doctor: AvailableDoctor }) {
  const pill = STATUS_PILL[doctor.status];
  return (
    <li className="rounded-xl border border-border/80 p-4">
      <div className="flex items-center gap-3">
        <InitialsAvatar name={doctor.fullName} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold text-foreground">{doctor.fullName}</p>
          <p className="text-[13px] text-muted-foreground">
            {doctor.openSlots} open slot{doctor.openSlots === 1 ? "" : "s"} today
          </p>
        </div>
        <TonePill tone={pill.tone} label={pill.label} />
      </div>
      <div className="mt-3 flex items-center justify-between gap-3 border-t border-border/60 pt-3 text-[13px]">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <Clock className="h-4 w-4" />
          {doctor.hours ?? "No clinic hours today"}
        </span>
        {doctor.nextFree && (
          <span className="rounded-lg border border-primary/20 bg-primary/5 px-2.5 py-1 font-medium text-primary">
            Next: {doctor.nextFree}
          </span>
        )}
      </div>
    </li>
  );
}

/** Each clinician's hours today and their next free slot, from the booking calendar. */
export function AvailableDoctorsPanel() {
  const { data: doctors, isLoading, error, refetch } = useAvailableDoctors();

  return (
    <DashboardPanel title="Available doctors" linkLabel="Book" href={ROUTES.APPOINTMENTS}>
      {isLoading ? (
        <div className="flex justify-center py-8 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" aria-label="Loading doctors" />
        </div>
      ) : error ? (
        <ErrorState
          title="Doctors unavailable"
          message="Today's availability could not be loaded."
          onRetry={() => refetch()}
        />
      ) : !doctors || doctors.length === 0 ? (
        <PanelEmpty
          icon={<Stethoscope className="h-7 w-7" />}
          tone="blue"
          title="No doctors yet"
          description="Active clinician accounts will appear here."
        />
      ) : (
        <ul className="space-y-3">
          {doctors.map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </ul>
      )}
    </DashboardPanel>
  );
}
