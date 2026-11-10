"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Eye, Archive } from "lucide-react";
import { DataTable, DataTableColumn } from "@/components/data-table/DataTable";
import { StatusBadge, StatusMap } from "@/components/feedback/StatusBadge";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { InitialsAvatar } from "@/components/feedback/InitialsAvatar";
import { Button } from "@/components/ui/button";
import type { PatientListItem } from "@backend/contracts";
import { SEX_LABELS } from "@backend/contracts";
import { RecordNumber } from "@/components/feedback/RecordNumber";

interface PatientTableProps {
  data: PatientListItem[];
  isLoading: boolean;
  error?: Error | null;
  onRetry?: () => void;
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  search: string;
  onSearchChange: (search: string) => void;
  onArchive?: (id: string) => Promise<void>;
  canArchive?: boolean;
}

const PATIENT_STATUS_MAP: StatusMap<"ACTIVE" | "ARCHIVED"> = {
  ACTIVE: { label: "Active", tone: "green" },
  ARCHIVED: { label: "Archived", tone: "red" },
};

export function PatientTable({
  data,
  isLoading,
  error,
  onRetry,
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
  search,
  onSearchChange,
  onArchive,
  canArchive = false,
}: PatientTableProps) {
  const [targetToArchive, setTargetToArchive] = useState<PatientListItem | null>(null);
  const [isArchiving, setIsArchiving] = useState(false);

  const handleConfirmArchive = async () => {
    if (!targetToArchive || !onArchive) return;
    setIsArchiving(true);
    try {
      await onArchive(targetToArchive.id);
      setTargetToArchive(null);
    } finally {
      setIsArchiving(false);
    }
  };

  const columns: DataTableColumn<PatientListItem>[] = [
    {
      header: "Patient",
      accessorKey: "fullName",
      cell: (p) => (
        <Link href={`/patients/${p.id}`} className="group flex items-center gap-3">
          <InitialsAvatar name={p.fullName} />
          <span className="text-[15px] font-semibold text-foreground group-hover:text-primary">
            {p.fullName}
          </span>
        </Link>
      ),
    },
    {
      header: "Patient No.",
      accessorKey: "patientNo",
      cell: (p) => <RecordNumber value={p.patientNo} variant="chip" />,
    },
    {
      header: "Age / Sex",
      cell: (p) => (
        <span className="whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
          {p.age} yrs · {SEX_LABELS[p.sex] ?? p.sex}
        </span>
      ),
    },
    {
      header: "Contact",
      accessorKey: "contactNumber",
      className: "text-sm tabular-nums text-slate-700 dark:text-slate-300",
    },
    {
      header: "Status",
      cell: (p) => (
        <StatusBadge status={p.isArchived ? "ARCHIVED" : "ACTIVE"} statusMap={PATIENT_STATUS_MAP} />
      ),
    },
    {
      header: "Actions",
      className: "text-right w-36",
      cell: (p) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-9 gap-1.5 rounded-lg font-semibold text-primary"
          >
            <Link href={`/patients/${p.id}`}>
              <Eye className="h-4 w-4" /> View
            </Link>
          </Button>
          {canArchive && !p.isArchived && onArchive && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-destructive hover:text-destructive"
              title="Archive Patient"
              aria-label={`Archive ${p.fullName}`}
              onClick={() => setTargetToArchive(p)}
            >
              <Archive className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <DataTable
        data={data as unknown as Record<string, unknown>[]}
        columns={columns as unknown as DataTableColumn<Record<string, unknown>>[]}
        isLoading={isLoading}
        error={error}
        onRetry={onRetry}
        search={search}
        onSearchChange={onSearchChange}
        searchPlaceholder="Search by name or patient no…"
        emptyTitle="No patients found"
        emptyMessage="Try another search, or register a patient."
        pagination={{
          page,
          pageSize,
          total,
          totalPages,
          onPageChange,
        }}
      />

      <ConfirmDialog
        open={!!targetToArchive}
        onOpenChange={(open) => !open && setTargetToArchive(null)}
        title="Archive Patient Record"
        description={`Are you sure you want to archive ${targetToArchive?.fullName} (${targetToArchive?.patientNo})? In accordance with clinic policy, records are archived and never hard deleted.`}
        confirmLabel="Archive Record"
        variant="destructive"
        isLoading={isArchiving}
        onConfirm={handleConfirmArchive}
      />
    </>
  );
}
