"use client";

import React from "react";
import { User, Phone, MapPin, AlertCircle, ShieldAlert, HeartPulse, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge, StatusMap } from "@/components/feedback/StatusBadge";
import type { PatientDTO } from "@backend/contracts";
import { SEX_LABELS } from "@backend/contracts";

interface PatientProfileCardProps {
  patient: PatientDTO;
  onEdit?: () => void;
  canEdit?: boolean;
}

const STATUS_MAP: StatusMap<"ACTIVE" | "ARCHIVED"> = {
  ACTIVE: { label: "Active Patient", tone: "green" },
  ARCHIVED: { label: "Archived Record", tone: "red" },
};

export function PatientProfileCard({ patient, onEdit, canEdit }: PatientProfileCardProps) {
  return (
    <div className="space-y-6 rounded-xl border bg-card p-6 shadow-sm">
      <div className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
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
            <p className="mt-1 text-xs text-muted-foreground">
              {patient.age} years old · Born on {patient.birthDate} ·{" "}
              {SEX_LABELS[patient.sex] ?? patient.sex}
              {patient.bloodType && ` · Blood Type: ${patient.bloodType}`}
            </p>
          </div>
        </div>

        {canEdit && !patient.isArchived && onEdit && (
          <Button onClick={onEdit} variant="outline" size="sm" className="shrink-0 gap-2">
            <Edit className="h-4 w-4" /> Edit Profile
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 text-xs md:grid-cols-2">
        <div className="space-y-3">
          <h4 className="text-[11px] font-semibold uppercase tracking-wider text-foreground text-muted-foreground">
            Contact Information
          </h4>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="h-4 w-4 shrink-0 text-primary" />
            <span className="font-mono text-foreground">{patient.contactNumber}</span>
          </div>
          <div className="flex items-start gap-2 text-muted-foreground">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span className="text-foreground">{patient.address}</span>
          </div>
          <div className="flex items-start gap-2 text-muted-foreground">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <div>
              <span className="text-muted-foreground">Emergency: </span>
              <span className="font-medium text-foreground">{patient.emergencyName}</span>
              <span className="ml-1.5 font-mono text-foreground">({patient.emergencyContact})</span>
            </div>
          </div>
          {patient.guardianName && (
            <div className="flex items-start gap-2 text-muted-foreground">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <div>
                <span className="text-muted-foreground">Guardian: </span>
                <span className="font-medium text-foreground">{patient.guardianName}</span>
                {patient.guardianContact && (
                  <span className="ml-1.5 font-mono text-foreground">
                    ({patient.guardianContact})
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <h4 className="text-[11px] font-semibold uppercase tracking-wider text-foreground text-muted-foreground">
            Clinical Background
          </h4>
          <div className="space-y-2 rounded-md border bg-muted/20 p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
              <div>
                <span className="font-medium text-destructive">Allergies: </span>
                <span className="text-foreground">{patient.allergies || "None declared"}</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <HeartPulse className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
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
