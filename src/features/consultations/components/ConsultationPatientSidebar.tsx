"use client";

import React from "react";
import { User, Phone, AlertCircle, HeartPulse } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { formatDate } from "@/shared/lib/date";

interface PatientSummaryProps {
  patient: {
    id: string;
    patientNo: string;
    firstName: string;
    middleName?: string | null;
    lastName: string;
    birthDate?: Date | string;
    sex?: string;
    contactNumber?: string;
    bloodType?: string | null;
    allergies?: string | null;
    existingConditions?: string | null;
    emergencyName?: string;
    emergencyContact?: string;
  };
}

export function ConsultationPatientSidebar({ patient }: PatientSummaryProps) {
  const fullName = `${patient.firstName} ${patient.middleName ? patient.middleName + " " : ""}${patient.lastName}`;

  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm space-y-5">
      <div className="flex items-center gap-3 border-b pb-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-lg">
          <User className="h-6 w-6" />
        </div>
        <div>
          <h3 className="font-bold text-foreground text-base leading-tight">{fullName}</h3>
          <p className="font-mono text-xs text-primary font-semibold mt-0.5">{patient.patientNo}</p>
        </div>
      </div>

      <div className="space-y-3 text-xs">
        {patient.birthDate && (
          <div className="flex justify-between border-b pb-2">
            <span className="text-muted-foreground">Birth Date</span>
            <span className="font-medium text-foreground">{formatDate(patient.birthDate)}</span>
          </div>
        )}

        {patient.sex && (
          <div className="flex justify-between border-b pb-2">
            <span className="text-muted-foreground">Sex</span>
            <span className="font-medium text-foreground">{patient.sex}</span>
          </div>
        )}

        {patient.bloodType && (
          <div className="flex justify-between border-b pb-2">
            <span className="text-muted-foreground">Blood Type</span>
            <Badge variant="outline" className="font-bold text-destructive">
              {patient.bloodType}
            </Badge>
          </div>
        )}

        {patient.contactNumber && (
          <div className="flex justify-between border-b pb-2 items-center">
            <span className="text-muted-foreground">Contact</span>
            <span className="font-medium text-foreground flex items-center gap-1">
              <Phone className="h-3 w-3 text-muted-foreground" />
              {patient.contactNumber}
            </span>
          </div>
        )}
      </div>

      {/* Medical Alerts */}
      <div className="space-y-3 pt-1">
        <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 space-y-1">
          <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-semibold text-xs">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>Allergies</span>
          </div>
          <p className="text-xs text-foreground font-medium pl-5">
            {patient.allergies || "None reported"}
          </p>
        </div>

        <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-3 space-y-1">
          <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-400 font-semibold text-xs">
            <HeartPulse className="h-3.5 w-3.5 shrink-0" />
            <span>Existing Conditions</span>
          </div>
          <p className="text-xs text-foreground font-medium pl-5">
            {patient.existingConditions || "None recorded"}
          </p>
        </div>
      </div>
    </div>
  );
}
