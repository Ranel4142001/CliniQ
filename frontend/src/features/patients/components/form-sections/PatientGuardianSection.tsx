"use client";

import React from "react";
import { TextField } from "@/components/form/TextField";

interface PatientGuardianSectionProps {
  isVisible: boolean;
  disabled?: boolean;
}

export function PatientGuardianSection({
  isVisible,
  disabled,
}: PatientGuardianSectionProps) {
  if (!isVisible) return null;

  return (
    <div className="space-y-4 rounded-md border border-amber-200 bg-amber-50/40 p-3.5 dark:border-amber-900/50 dark:bg-amber-950/20">
      <div className="flex items-center justify-between border-b border-amber-200 pb-1 dark:border-amber-900/50">
        <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-200">
          Parent / Guardian Information (Required for Minors under 18)
        </h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <TextField
          name="guardianName"
          label="Guardian Full Name"
          placeholder="e.g. Maria Santos"
          required
          disabled={disabled}
        />
        <TextField
          name="guardianContact"
          label="Guardian Contact Number"
          placeholder="e.g. 09171234567"
          required
          disabled={disabled}
        />
      </div>
    </div>
  );
}
