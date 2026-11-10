"use client";

import React from "react";
import Link from "next/link";
import { Video, User, ExternalLink } from "lucide-react";
import { DataTable, DataTableColumn } from "@/components/data-table/DataTable";
import { StatusBadge } from "@/components/feedback/StatusBadge";
import { InitialsAvatar } from "@/components/feedback/InitialsAvatar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { TONE_TILES } from "@/lib/tones";
import { formatDateTime } from "@/lib/date";
import { APPOINTMENT_STATUS_MAP } from "@/features/appointments/constants/appointment-status.constants";
import { AppointmentActions } from "@/features/appointments/components/AppointmentActions";
import type { AppointmentListItem } from "@backend/contracts";
import type { Role } from "@prisma/client";
import { RecordNumber } from "@/components/feedback/RecordNumber";

/** Pill around the "Online" / "In-person" label. */
const TYPE_CHIP = "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-semibold";

interface AppointmentTableProps {
  data: AppointmentListItem[];
  isLoading: boolean;
  error?: Error | null;
  onRetry?: () => void;
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  userRole?: Role;
  onConfirm: (id: string, meetingUrl?: string) => Promise<void>;
  onCancel: (id: string, reason: string) => Promise<void>;
  onReschedule: (id: string, newScheduledAt: string) => Promise<void>;
  onNoShow?: (id: string) => Promise<void>;
  isUpdating?: boolean;
}

export function AppointmentTable({
  data,
  isLoading,
  error,
  onRetry,
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
  userRole,
  onConfirm,
  onCancel,
  onReschedule,
  onNoShow,
  isUpdating,
}: AppointmentTableProps) {
  const columns: DataTableColumn<AppointmentListItem>[] = [
    {
      header: "When",
      cell: (item) => (
        <div className="flex items-center gap-3" title={formatDateTime(item.scheduledAt)}>
          <span
            className={cn(
              "flex w-12 shrink-0 flex-col items-center rounded-xl py-1",
              TONE_TILES.blue
            )}
          >
            <span className="text-[10px] font-semibold uppercase">
              {format(new Date(item.scheduledAt), "MMM")}
            </span>
            <span className="text-lg font-bold leading-tight">
              {format(new Date(item.scheduledAt), "dd")}
            </span>
          </span>
          <span className="flex flex-col whitespace-nowrap">
            <span className="text-sm font-semibold text-foreground">
              {format(new Date(item.scheduledAt), "h:mm a")}
            </span>
            <span className="text-xs text-muted-foreground">
              {format(new Date(item.scheduledAt), "EEEE, yyyy")}
            </span>
          </span>
        </div>
      ),
    },
    {
      header: "Patient",
      cell: (item) => (
        <Link href={`/patients/${item.patientId}`} className="group flex items-center gap-3">
          <InitialsAvatar name={item.patientName} />
          <span className="flex flex-col">
            <span className="whitespace-nowrap text-sm font-semibold text-foreground group-hover:text-primary">
              {item.patientName}
            </span>
            <RecordNumber value={item.patientNo} />
          </span>
        </Link>
      ),
    },
    {
      header: "Clinician",
      cell: (item) => (
        <span className="whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
          {item.clinicianName}
        </span>
      ),
    },
    {
      header: "Type",
      cell: (item) => (
        <div className="flex items-center gap-1.5 text-xs">
          {item.type === "ONLINE" ? (
            <>
              <span className={cn(TYPE_CHIP, TONE_TILES.violet)}>
                <Video className="h-3.5 w-3.5" /> Online
              </span>
              {item.meetingUrl && (
                <a
                  href={item.meetingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-1 inline-flex items-center gap-0.5 text-primary hover:underline"
                  title="Open Google Meet"
                >
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </>
          ) : (
            <>
              <span className={cn(TYPE_CHIP, TONE_TILES.slate)}>
                <User className="h-3.5 w-3.5" /> In-person
              </span>
            </>
          )}
        </div>
      ),
    },
    {
      header: "Status",
      cell: (item) => <StatusBadge status={item.status} statusMap={APPOINTMENT_STATUS_MAP} />,
    },
    {
      header: "Reason",
      accessorKey: "reason",
      className: "text-sm text-slate-600 dark:text-slate-400 max-w-xs truncate",
    },
    {
      header: "Actions",
      className: "text-right",
      cell: (item) => (
        <div className="flex justify-end">
          <AppointmentActions
            appointment={item}
            userRole={userRole}
            onConfirm={(url) => onConfirm(item.id, url)}
            onCancel={(reason) => onCancel(item.id, reason)}
            onReschedule={(newSlot) => onReschedule(item.id, newSlot)}
            onNoShow={onNoShow ? () => onNoShow(item.id) : undefined}
            isUpdating={isUpdating}
          />
        </div>
      ),
    },
  ];

  return (
    <DataTable
      data={data as unknown as Record<string, unknown>[]}
      columns={columns as unknown as DataTableColumn<Record<string, unknown>>[]}
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      emptyTitle="No appointments scheduled"
      emptyMessage="Use Book Appointment to add one."
      pagination={{
        page,
        pageSize,
        total,
        totalPages,
        onPageChange,
      }}
    />
  );
}
