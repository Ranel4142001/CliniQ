"use client";

import React from "react";
import { TextField } from "@/shared/components/form/TextField";
import { SelectField } from "@/shared/components/form/SelectField";
import { DateField } from "@/shared/components/form/DateField";
import { BLOOD_TYPES } from "../../constants/patient.constants";

interface PatientPersonalSectionProps {
  disabled?: boolean;
}

const SEX_OPTIONS = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
];

const BLOOD_TYPE_OPTIONS = BLOOD_TYPES.map((type) => ({
  value: type,
  label: type,
}));

export function PatientPersonalSection({ disabled }: PatientPersonalSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-foreground border-b pb-1">
        Personal Details
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <TextField
          name="firstName"
          label="First Name"
          placeholder="First Name"
          required
          disabled={disabled}
        />
        <TextField
          name="middleName"
          label="Middle Name"
          placeholder="Optional"
          disabled={disabled}
        />
        <TextField
          name="lastName"
          label="Last Name"
          placeholder="Last Name"
          required
          disabled={disabled}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <DateField
          name="birthDate"
          label="Birth Date"
          required
          disabled={disabled}
        />
        <SelectField
          name="sex"
          label="Sex"
          options={SEX_OPTIONS}
          required
          disabled={disabled}
        />
        <SelectField
          name="bloodType"
          label="Blood Type"
          options={BLOOD_TYPE_OPTIONS}
          placeholder="Unknown / Select"
          disabled={disabled}
        />
      </div>
    </div>
  );
}
