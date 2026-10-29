"use client";

import React from "react";
import { CheckboxField } from "@/components/form/CheckboxField";

interface PatientConsentSectionProps {
  mode: "self-register" | "staff-create" | "edit";
  consentGivenAt?: string;
}

export function PatientConsentSection({
  mode,
  consentGivenAt,
}: PatientConsentSectionProps) {
  if (mode === "edit") {
    return (
      <div className="rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
        ✓ Data Privacy Consent was recorded on{" "}
        <span className="font-medium text-foreground">
          {consentGivenAt ? new Date(consentGivenAt).toLocaleDateString() : "Registration"}
        </span>
        .
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-md border p-3.5 bg-muted/20">
      <h3 className="text-sm font-semibold text-foreground">Data Privacy Consent</h3>
      <p className="text-xs text-muted-foreground leading-relaxed">
        In accordance with the Data Privacy Act of 2012, I hereby authorize CliniQ to collect,
        store, and process my personal and health information solely for medical consultation,
        clinic operations, and treatment management.
      </p>
      <CheckboxField
        name="consentGiven"
        label="I understand and voluntarily consent to the collection and processing of my health data."
      />
    </div>
  );
}
