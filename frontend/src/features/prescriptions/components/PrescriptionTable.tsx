"use client";

import React from "react";
import { DataTable, type DataTableColumn } from "@/components/data-table/DataTable";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, CheckCircle2, PackageCheck, Ban, Edit } from "lucide-react";
import { StatusBadge } from "@/components/feedback/StatusBadge";
import { PRESCRIPTION_STATUS_MAP } from "@backend/contracts";
import type { PrescriptionWithRelations } from "@backend/contracts";

interface PrescriptionTableProps {
  prescriptions?: PrescriptionWithRelations[];
  isLoading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
  search?: string;
  onSearchChange?: (val: string) => void;
  onView: (prescription: PrescriptionWithRelations) => void;
  onEdit: (prescription: PrescriptionWithRelations) => void;
  onIssue: (prescription: PrescriptionWithRelations) => void;
  onDispense: (prescription: PrescriptionWithRelations) => void;
  onVoid: (prescription: PrescriptionWithRelations) => void;
  pagination?: {
    page: number;
    pageSize: number;
    totalPages: number;
    total: number;
    onPageChange: (page: number) => void;
  };
}

export function PrescriptionTable({
  prescriptions,
  isLoading,
  error,
  onRetry,
  search,
  onSearchChange,
  onView,
  onEdit,
  onIssue,
  onDispense,
  onVoid,
  pagination,
}: PrescriptionTableProps) {
  const columns: DataTableColumn<PrescriptionWithRelations>[] = [
    {
      header: "Rx Number",
      accessorKey: "prescriptionNo",
      cell: (item) => <span className="font-semibold">{item.prescriptionNo || "DRAFT"}</span>,
    },
    {
      header: "Patient",
      cell: (item) => (
        <div>
          <div className="font-medium">{item.patient?.firstName} {item.patient?.lastName}</div>
          <div className="text-xs text-muted-foreground">{item.patient?.patientNo}</div>
        </div>
      ),
    },
    {
      header: "Prescribed By",
      cell: (item) => `Dr. ${item.clinician?.fullName || "Clinician"}`,
    },
    {
      header: "Items",
      cell: (item) => <span className="text-xs">{item.items?.length || 0} med(s)</span>,
    },
    {
      header: "Date",
      cell: (item) => (item.issuedAt ? new Date(item.issuedAt) : new Date(item.createdAt)).toLocaleDateString(),
    },
    {
      header: "Status",
      cell: (item) => <StatusBadge status={item.status} statusMap={PRESCRIPTION_STATUS_MAP} />,
    },
    {
      header: "Actions",
      cell: (item) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={() => onView(item)}><Eye className="mr-2 h-4 w-4 text-blue-600" /> View Details</DropdownMenuItem>
            {item.status === "DRAFT" && (
              <>
                <DropdownMenuItem onClick={() => onEdit(item)}><Edit className="mr-2 h-4 w-4 text-slate-600" /> Edit Draft</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onIssue(item)}><CheckCircle2 className="mr-2 h-4 w-4 text-blue-600" /> Issue Prescription</DropdownMenuItem>
              </>
            )}
            {item.status === "ISSUED" && (
              <DropdownMenuItem onClick={() => onDispense(item)}><PackageCheck className="mr-2 h-4 w-4 text-emerald-600" /> Dispense Meds</DropdownMenuItem>
            )}
            {(item.status === "DRAFT" || item.status === "ISSUED") && (
              <DropdownMenuItem onClick={() => onVoid(item)}><Ban className="mr-2 h-4 w-4 text-rose-600" /> Void Prescription</DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <DataTable
      data={prescriptions as unknown as Record<string, unknown>[]}
      columns={columns as unknown as DataTableColumn<Record<string, unknown>>[]}
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      search={search}
      onSearchChange={onSearchChange}
      searchPlaceholder="Search by Rx number, patient name or ID..."
      emptyTitle="No prescriptions recorded"
      emptyMessage="Prescriptions issued by clinicians during consultations will appear here."
      pagination={pagination}
    />
  );
}
