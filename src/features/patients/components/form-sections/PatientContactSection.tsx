"use client";

import React from "react";
import { TextField } from "@/shared/components/form/TextField";

interface PatientContactSectionProps {
  disabled?: boolean;
}

export function PatientContactSection({ disabled }: PatientContactSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-foreground border-b pb-1">
        Contact & Emergency Information
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <TextField
          name="contactNumber"
          label="Contact Number"
          placeholder="e.g. 09123456789"
          required
          disabled={disabled}
        />
        <TextField
          name="address"
          label="Home Address"
          placeholder="House No., Street, Barangay, City"
          required
          disabled={disabled}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <TextField
          name="emergencyName"
          label="Emergency Contact Name"
          placeholder="Full name of contact person"
          required
          disabled={disabled}
        />
        <TextField
          name="emergencyContact"
          label="Emergency Contact Number"
          placeholder="e.g. 09987654321"
          required
          disabled={disabled}
        />
      </div>
    </div>
  );
}
