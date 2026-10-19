"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Eye, Archive } from "lucide-react";
import { DataTable, DataTableColumn } from "@/shared/components/data-table/DataTable";
import { StatusBadge, StatusMap } from "@/shared/components/feedback/StatusBadge";
import { ConfirmDialog } from "@/shared/components/feedback/ConfirmDialog";
import { Button } from "@/shared/components/ui/button";
import type { PatientListItem } from "../types/patient.types";
import { SEX_LABELS } from "../constants/patient.constants";

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
  ACTIVE: {
    label: "Active",
    variant: "default",
    className: "bg-emerald-600 hover:bg-emerald-600 text-white",
  },
  ARCHIVED: { label: "Archived", variant: "destructive" },
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
      header: "Patient No.",
      accessorKey: "patientNo",
      className: "font-mono text-xs font-semibold w-36",
    },
    {
      header: "Full Name",
      accessorKey: "fullName",
      cell: (p) => (
        <Link
          href={`/patients/${p.id}`}
          className="font-medium text-foreground hover:text-primary hover:underline"
        >
          {p.fullName}
        </Link>
      ),
    },
    {
      header: "Age / Sex",
      cell: (p) => (
        <span className="text-xs text-muted-foreground">
          {p.age} yrs · {SEX_LABELS[p.sex] ?? p.sex}
        </span>
      ),
    },
    {
      header: "Contact",
      accessorKey: "contactNumber",
      className: "text-xs font-mono",
    },
    {
      header: "Status",
      cell: (p) => (
        <StatusBadge
          status={p.isArchived ? "ARCHIVED" : "ACTIVE"}
          statusMap={PATIENT_STATUS_MAP}
        />
      ),
    },
    {
      header: "Actions",
      className: "text-right w-24",
      cell: (p) => (
        <div className="flex items-center justify-end gap-1">
          <Button asChild variant="ghost" size="icon" className="h-8 w-8" title="View Profile">
            <Link href={`/patients/${p.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          {canArchive && !p.isArchived && onArchive && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              title="Archive Patient"
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
        searchPlaceholder="Search patients by name or ID..."
        emptyTitle="No patients found"
        emptyMessage="Try adjusting your search query or register a new patient."
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
