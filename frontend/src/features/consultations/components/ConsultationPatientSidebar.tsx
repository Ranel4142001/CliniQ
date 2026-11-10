"use client";

import React from "react";
import { User, Phone, AlertCircle, HeartPulse } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/date";
import { RecordNumber } from "@/components/feedback/RecordNumber";

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
    <div className="space-y-5 rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-3 border-b pb-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-lg font-bold text-primary">
          <User className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-base font-bold leading-tight text-foreground">{fullName}</h3>
          <RecordNumber value={patient.patientNo} variant="accent" className="mt-0.5 block" />
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
          <div className="flex items-center justify-between border-b pb-2">
            <span className="text-muted-foreground">Contact</span>
            <span className="flex items-center gap-1 font-medium text-foreground">
              <Phone className="h-3 w-3 text-muted-foreground" />
              {patient.contactNumber}
            </span>
          </div>
        )}
      </div>

      {/* Medical Alerts */}
      <div className="space-y-3 pt-1">
        <div className="space-y-1 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>Allergies</span>
          </div>
          <p className="pl-5 text-xs font-medium text-foreground">
            {patient.allergies || "None reported"}
          </p>
        </div>

        <div className="space-y-1 rounded-lg border border-blue-500/20 bg-blue-500/10 p-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 dark:text-blue-400">
            <HeartPulse className="h-3.5 w-3.5 shrink-0" />
            <span>Existing Conditions</span>
          </div>
          <p className="pl-5 text-xs font-medium text-foreground">
            {patient.existingConditions || "None recorded"}
          </p>
        </div>
      </div>
    </div>
  );
}
