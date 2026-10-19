"use client";

import React, { useCallback } from "react";
import { AsyncSelect, AsyncSelectOption } from "@/shared/components/data-table/AsyncSelect";
import { apiClient } from "@/shared/lib/api-client";

interface ClinicianSelectProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

interface ClinicianItem {
  id: string;
  fullName: string;
  email: string;
}

export function ClinicianSelect({
  value,
  onChange,
  placeholder = "Select a doctor / nurse...",
  disabled,
  className,
}: ClinicianSelectProps) {
  const loadOptions = useCallback(async (query: string): Promise<AsyncSelectOption[]> => {
    const res = await apiClient.get<ClinicianItem[]>("/api/clinicians");
    const lower = query.toLowerCase();

    return res.data
      .filter(
        (c) =>
          !query ||
          c.fullName.toLowerCase().includes(lower) ||
          c.email.toLowerCase().includes(lower)
      )
      .map((c) => ({
        value: c.id,
        label: c.fullName,
        subLabel: c.email,
      }));
  }, []);

  return (
    <AsyncSelect
      value={value}
      onChange={onChange}
      loadOptions={loadOptions}
      placeholder={placeholder}
      searchPlaceholder="Search clinician by name..."
      disabled={disabled}
      className={className}
    />
  );
}
