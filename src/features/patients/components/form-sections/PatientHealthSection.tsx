"use client";

import React from "react";
import { TextareaField } from "@/shared/components/form/TextareaField";

interface PatientHealthSectionProps {
  disabledConditions?: boolean;
}

export function PatientHealthSection({ disabledConditions }: PatientHealthSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-foreground border-b pb-1">
        Health & Medical Background
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <TextareaField
          name="allergies"
          label="Known Allergies"
          placeholder="e.g. Penicillin, Peanuts, Pollen (or 'None')"
          rows={2}
          description="Medications, foods, or environmental triggers"
        />
        <TextareaField
          name="existingConditions"
          label="Existing Medical Conditions"
          placeholder="e.g. Hypertension, Asthma, Diabetes (or 'None')"
          rows={2}
          description="Chronic illnesses or past diagnoses"
          disabled={disabledConditions}
        />
      </div>
    </div>
  );
}
