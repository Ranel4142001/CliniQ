"use client";

import React, { useState, useMemo } from "react";
import { Calendar, Stethoscope } from "lucide-react";
import { DataTable, DataTableColumn } from "@/shared/components/data-table/DataTable";
import { StatusBadge, StatusMap } from "@/shared/components/feedback/StatusBadge";
import { formatDateTime } from "@/shared/lib/date";
import { usePatientHistory, PatientHistoryRecord } from "../hooks/usePatientHistory";

interface PatientHistoryTabsProps {
  patientId: string;
}

const APPT_STATUS_MAP: StatusMap<string> = {
  PENDING: { label: "Pending", variant: "outline" },
  CONFIRMED: { label: "Confirmed", variant: "default", className: "bg-blue-600 text-white" },
  COMPLETED: { label: "Completed", variant: "default", className: "bg-emerald-600 text-white" },
  CANCELLED: { label: "Cancelled", variant: "destructive" },
  NO_SHOW: { label: "No Show", variant: "secondary" },
};

export function PatientHistoryTabs({ patientId }: PatientHistoryTabsProps) {
  const [activeTab, setActiveTab] = useState<"appointments" | "consultations">("appointments");
  const [apptPage, setApptPage] = useState(1);
  const [consPage, setConsPage] = useState(1);
  const pageSize = 10;
  const { data = [], isLoading, error, refetch } = usePatientHistory(patientId);

  const paginatedAppointments = useMemo(() => {
    const start = (apptPage - 1) * pageSize;
    return (data as unknown as Record<string, unknown>[]).slice(start, start + pageSize);
  }, [data, apptPage]);

  const appointmentsColumns: DataTableColumn<PatientHistoryRecord>[] = [
    {
      header: "Scheduled Date & Time",
      cell: (item) => (
        <span className="font-medium text-xs">
          {formatDateTime(item.scheduledAt)}
        </span>
      ),
    },
    {
      header: "Type",
      cell: (item) => (
        <span className="text-xs">
          {item.type === "ONLINE" ? "Online Consultation" : "In-Person Visit"}
        </span>
      ),
    },
    {
      header: "Status",
      cell: (item) => (
        <StatusBadge status={item.status} statusMap={APPT_STATUS_MAP} />
      ),
    },
    {
      header: "Reason / Chief Complaint",
      accessorKey: "reason",
      className: "text-xs text-muted-foreground max-w-xs truncate",
    },
  ];

  const consultationsData = useMemo(() => {
    return data
      .filter((a) => a.consultation)
      .map((a) => ({
        id: a.consultation!.id,
        date: a.scheduledAt,
        chiefComplaint: a.consultation!.chiefComplaint,
        diagnosis: a.consultation!.diagnosis ?? "No diagnosis entered",
      }));
  }, [data]);

  const paginatedConsultations = useMemo(() => {
    const start = (consPage - 1) * pageSize;
    return (consultationsData as unknown as Record<string, unknown>[]).slice(start, start + pageSize);
  }, [consultationsData, consPage]);

  const consultationColumns: DataTableColumn<(typeof consultationsData)[0]>[] = [
    {
      header: "Date",
      cell: (item) => (
        <span className="font-medium text-xs">{formatDateTime(item.date)}</span>
      ),
    },
    {
      header: "Chief Complaint",
      accessorKey: "chiefComplaint",
      className: "text-xs max-w-xs truncate",
    },
    {
      header: "Diagnosis",
      accessorKey: "diagnosis",
      className: "text-xs text-muted-foreground max-w-sm truncate",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex border-b border-muted">
        <button
          type="button"
          onClick={() => setActiveTab("appointments")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "appointments"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Calendar className="h-4 w-4" /> Appointments ({data.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("consultations")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "consultations"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Stethoscope className="h-4 w-4" /> Consultations ({consultationsData.length})
        </button>
      </div>

      {activeTab === "appointments" ? (
        <DataTable
          data={paginatedAppointments}
          columns={appointmentsColumns as unknown as DataTableColumn<Record<string, unknown>>[]}
          isLoading={isLoading}
          error={error}
          onRetry={refetch}
          emptyTitle="No appointment history"
          emptyMessage="This patient has no recorded appointments."
          pagination={{
            page: apptPage,
            pageSize,
            total: data.length,
            totalPages: Math.max(1, Math.ceil(data.length / pageSize)),
            onPageChange: setApptPage,
          }}
        />
      ) : (
        <DataTable
          data={paginatedConsultations}
          columns={consultationColumns as unknown as DataTableColumn<Record<string, unknown>>[]}
          isLoading={isLoading}
          error={error}
          onRetry={refetch}
          emptyTitle="No consultation records"
          emptyMessage="No completed clinical consultations found for this patient."
          pagination={{
            page: consPage,
            pageSize,
            total: consultationsData.length,
            totalPages: Math.max(1, Math.ceil(consultationsData.length / pageSize)),
            onPageChange: setConsPage,
          }}
        />
      )}
    </div>
  );
}
