"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/feedback/StatusBadge";
import { DownloadPdfButton } from "@/features/prescriptions/components/DownloadPdfButton";
import { PrintButton } from "@/features/prescriptions/components/PrintButton";
import { PRESCRIPTION_STATUS_MAP } from "@backend/contracts";
import { useIssuePrescription, useDispensePrescription } from "@/features/prescriptions/hooks/use-prescriptions";
import { CheckCircle2, AlertCircle, Ban, Edit } from "lucide-react";
import type { PrescriptionWithRelations } from "@backend/contracts";

interface PrescriptionDetailProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prescription: PrescriptionWithRelations | null;
  onEdit?: (prescription: PrescriptionWithRelations) => void;
  onVoidClick?: (prescription: PrescriptionWithRelations) => void;
  userRole?: string;
}

export function PrescriptionDetail({
  open,
  onOpenChange,
  prescription,
  onEdit,
  onVoidClick,
  userRole = "ADMIN",
}: PrescriptionDetailProps) {
  const issueMutation = useIssuePrescription(prescription?.id || "");
  const dispenseMutation = useDispensePrescription(prescription?.id || "");

  if (!prescription) return null;
  const isClinicianOrAdmin = userRole === "CLINICIAN" || userRole === "ADMIN";
  const isStaffOrAdmin = userRole === "STAFF" || userRole === "ADMIN";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between pr-4">
            <div>
              <DialogTitle className="text-xl">{prescription.prescriptionNo || "Draft Prescription"}</DialogTitle>
              <DialogDescription className="mt-1">
                Patient: {prescription.patient?.firstName} {prescription.patient?.lastName} ({prescription.patient?.patientNo})
              </DialogDescription>
            </div>
            <StatusBadge status={prescription.status} statusMap={PRESCRIPTION_STATUS_MAP} />
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900 text-xs">
            <div>
              <span className="text-muted-foreground">Prescribed By:</span>
              <p className="font-semibold text-sm">Dr. {prescription.clinician?.fullName}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Created / Issued:</span>
              <p className="font-semibold text-sm">
                {prescription.issuedAt ? new Date(prescription.issuedAt).toLocaleDateString() : new Date(prescription.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Prescribed Items ({prescription.items.length})</h4>
            <div className="divide-y rounded-lg border">
              {prescription.items.map((item) => (
                <div key={item.id} className="p-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{item.medicine.name} {item.medicine.strength}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {item.dosage} • {item.frequency} • {item.durationDays} days {item.instructions ? `(${item.instructions})` : ""}
                    </p>
                  </div>
                  <span className="font-semibold text-sm bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                    {item.quantity} {item.medicine.unit}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {prescription.notes && (
            <div className="p-3 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 text-xs">
              <span className="font-semibold text-blue-900 dark:text-blue-300">Clinician Notes:</span>
              <p className="mt-1 text-slate-700 dark:text-slate-300">{prescription.notes}</p>
            </div>
          )}

          {prescription.status === "VOIDED" && prescription.voidReason && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5" />
              <div><span className="font-semibold">Voided Reason:</span><p className="mt-0.5">{prescription.voidReason}</p></div>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t">
          <div className="flex items-center gap-2">
            <DownloadPdfButton prescription={prescription} />
            <PrintButton prescription={prescription} />
          </div>

          <div className="flex items-center gap-2">
            {prescription.status === "DRAFT" && isClinicianOrAdmin && (
              <>
                {onEdit && (
                  <Button variant="outline" size="sm" onClick={() => onEdit(prescription)}>
                    <Edit className="h-3.5 w-3.5 mr-1" /> Edit
                  </Button>
                )}
                <Button size="sm" onClick={() => issueMutation.mutate()} disabled={issueMutation.isPending}>
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Issue
                </Button>
              </>
            )}

            {prescription.status === "ISSUED" && isStaffOrAdmin && (
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => dispenseMutation.mutate()} disabled={dispenseMutation.isPending}>
                <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Dispense
              </Button>
            )}

            {(prescription.status === "DRAFT" || prescription.status === "ISSUED") && isClinicianOrAdmin && onVoidClick && (
              <Button variant="destructive" size="sm" onClick={() => onVoidClick(prescription)}>
                <Ban className="h-3.5 w-3.5 mr-1" /> Void
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
