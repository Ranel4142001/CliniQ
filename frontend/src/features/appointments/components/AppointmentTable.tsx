"use client";

import React from "react";
import Link from "next/link";
import { Video, User, ExternalLink } from "lucide-react";
import { DataTable, DataTableColumn } from "@/components/data-table/DataTable";
import { StatusBadge } from "@/components/feedback/StatusBadge";
import { formatDateTime } from "@/lib/date";
import { APPOINTMENT_STATUS_MAP } from "@/features/appointments/constants/appointment-status.constants";
import { AppointmentActions } from "@/features/appointments/components/AppointmentActions";
import type { AppointmentListItem } from "@backend/contracts";
import type { Role } from "@prisma/client";

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
      header: "Scheduled Time",
      cell: (item) => (
        <span className="font-medium text-xs whitespace-nowrap">
          {formatDateTime(item.scheduledAt)}
        </span>
      ),
    },
    {
      header: "Patient",
      cell: (item) => (
        <div className="flex flex-col">
          <Link
            href={`/patients/${item.patientId}`}
            className="font-medium text-xs text-foreground hover:text-primary hover:underline"
          >
            {item.patientName}
          </Link>
          <span className="font-mono text-[10px] text-muted-foreground">
            {item.patientNo}
          </span>
        </div>
      ),
    },
    {
      header: "Clinician",
      cell: (item) => (
        <span className="text-xs text-muted-foreground">{item.clinicianName}</span>
      ),
    },
    {
      header: "Type",
      cell: (item) => (
        <div className="flex items-center gap-1.5 text-xs">
          {item.type === "ONLINE" ? (
            <>
              <Video className="h-3.5 w-3.5 text-blue-600" />
              <span>Online</span>
              {item.meetingUrl && (
                <a
                  href={item.meetingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline ml-1 inline-flex items-center gap-0.5"
                  title="Open Google Meet"
                >
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </>
          ) : (
            <>
              <User className="h-3.5 w-3.5 text-muted-foreground" />
              <span>In-Person</span>
            </>
          )}
        </div>
      ),
    },
    {
      header: "Status",
      cell: (item) => (
        <StatusBadge status={item.status} statusMap={APPOINTMENT_STATUS_MAP} />
      ),
    },
    {
      header: "Reason",
      accessorKey: "reason",
      className: "text-xs text-muted-foreground max-w-xs truncate",
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
      emptyMessage="Book a new consultation using the button above."
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
