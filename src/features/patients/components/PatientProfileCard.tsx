"use client";

import React from "react";
import { User, Phone, MapPin, AlertCircle, ShieldAlert, HeartPulse, Edit } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { StatusBadge, StatusMap } from "@/shared/components/feedback/StatusBadge";
import type { PatientDTO } from "../types/patient.types";
import { SEX_LABELS } from "../constants/patient.constants";

interface PatientProfileCardProps {
  patient: PatientDTO;
  onEdit?: () => void;
  canEdit?: boolean;
}

const STATUS_MAP: StatusMap<"ACTIVE" | "ARCHIVED"> = {
  ACTIVE: {
    label: "Active Patient",
    variant: "default",
    className: "bg-emerald-600 hover:bg-emerald-600 text-white",
  },
  ARCHIVED: { label: "Archived Record", variant: "destructive" },
};

export function PatientProfileCard({
  patient,
  onEdit,
  canEdit,
}: PatientProfileCardProps) {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b pb-5">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shrink-0">
            <User className="h-7 w-7" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                {patient.fullName}
              </h2>
              <Badge variant="outline" className="font-mono text-xs">
                {patient.patientNo}
              </Badge>
              <StatusBadge
                status={patient.isArchived ? "ARCHIVED" : "ACTIVE"}
                statusMap={STATUS_MAP}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {patient.age} years old · Born on {patient.birthDate} · {SEX_LABELS[patient.sex] ?? patient.sex}
              {patient.bloodType && ` · Blood Type: ${patient.bloodType}`}
            </p>
          </div>
        </div>

        {canEdit && !patient.isArchived && onEdit && (
          <Button onClick={onEdit} variant="outline" size="sm" className="gap-2 shrink-0">
            <Edit className="h-4 w-4" /> Edit Profile
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="space-y-3">
          <h4 className="font-semibold text-foreground uppercase tracking-wider text-[11px] text-muted-foreground">
            Contact Information
          </h4>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="h-4 w-4 text-primary shrink-0" />
            <span className="font-mono text-foreground">{patient.contactNumber}</span>
          </div>
          <div className="flex items-start gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <span className="text-foreground">{patient.address}</span>
          </div>
          <div className="flex items-start gap-2 text-muted-foreground">
            <AlertCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <div>
              <span className="text-muted-foreground">Emergency: </span>
              <span className="font-medium text-foreground">{patient.emergencyName}</span>
              <span className="font-mono ml-1.5 text-foreground">({patient.emergencyContact})</span>
            </div>
          </div>
          {patient.guardianName && (
            <div className="flex items-start gap-2 text-muted-foreground">
              <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-muted-foreground">Guardian: </span>
                <span className="font-medium text-foreground">{patient.guardianName}</span>
                {patient.guardianContact && (
                  <span className="font-mono ml-1.5 text-foreground">({patient.guardianContact})</span>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold text-foreground uppercase tracking-wider text-[11px] text-muted-foreground">
            Clinical Background
          </h4>
          <div className="rounded-md border p-3 space-y-2 bg-muted/20">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
              <div>
                <span className="font-medium text-destructive">Allergies: </span>
                <span className="text-foreground">{patient.allergies || "None declared"}</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <HeartPulse className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div>
                <span className="font-medium text-foreground">Existing Conditions: </span>
                <span className="text-muted-foreground">
                  {patient.existingConditions || "None recorded"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
