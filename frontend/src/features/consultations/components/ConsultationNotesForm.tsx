"use client";

import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Stethoscope } from "lucide-react";
import type { UpdateConsultationInput } from "@backend/contracts";

interface ConsultationNotesFormProps {
  form: UseFormReturn<UpdateConsultationInput>;
  isReadOnly?: boolean;
}

export function ConsultationNotesForm({
  form,
  isReadOnly = false,
}: ConsultationNotesFormProps) {
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-2 border-b pb-3">
        <Stethoscope className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Clinical SOAP & Examination Notes</h3>
      </div>

      <div className="space-y-4">
        {/* Chief Complaint */}
        <div className="space-y-1.5">
          <Label htmlFor="chiefComplaint" className="text-xs font-medium">
            Chief Complaint <span className="text-destructive">*</span>
          </Label>
          <textarea
            id="chiefComplaint"
            rows={2}
            disabled={isReadOnly}
            placeholder="e.g. Cough and mild fever for 3 days"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            {...register("chiefComplaint")}
          />
          {errors.chiefComplaint && (
            <p className="text-[11px] text-destructive">{errors.chiefComplaint.message}</p>
          )}
        </div>

        {/* Clinical Findings / Examination */}
        <div className="space-y-1.5">
          <Label htmlFor="findings" className="text-xs font-medium">
            Clinical Findings / Physical Examination
          </Label>
          <textarea
            id="findings"
            rows={4}
            disabled={isReadOnly}
            placeholder="Objective findings, clear lung fields, no tonsillar exudates, abdomen soft and non-tender..."
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            {...register("findings")}
          />
          {errors.findings && (
            <p className="text-[11px] text-destructive">{errors.findings.message}</p>
          )}
        </div>

        {/* Diagnosis */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="diagnosis" className="text-xs font-medium">
              Assessment / Diagnosis <span className="text-destructive">*</span>
            </Label>
            <span className="text-[11px] text-muted-foreground">Required to complete consultation</span>
          </div>
          <textarea
            id="diagnosis"
            rows={2}
            disabled={isReadOnly}
            placeholder="e.g. Acute Upper Respiratory Tract Infection (URTI)"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            {...register("diagnosis")}
          />
          {errors.diagnosis && (
            <p className="text-[11px] text-destructive">{errors.diagnosis.message}</p>
          )}
        </div>

        {/* Treatment Plan */}
        <div className="space-y-1.5">
          <Label htmlFor="treatmentPlan" className="text-xs font-medium">
            Treatment Plan & Patient Instructions
          </Label>
          <textarea
            id="treatmentPlan"
            rows={3}
            disabled={isReadOnly}
            placeholder="Supportive care, adequate oral fluid intake, paracetamol 500mg Q6H PRN for fever > 38C..."
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            {...register("treatmentPlan")}
          />
          {errors.treatmentPlan && (
            <p className="text-[11px] text-destructive">{errors.treatmentPlan.message}</p>
          )}
        </div>
      </div>
    </div>
  );
}
