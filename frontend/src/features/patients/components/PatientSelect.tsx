"use client";

import React, { useCallback } from "react";
import { AsyncSelect, AsyncSelectOption } from "@/components/data-table/AsyncSelect";
import { apiClient } from "@/lib/api-client";
import type { PatientListItem } from "@backend/contracts";

interface PatientSelectProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function PatientSelect({
  value,
  onChange,
  placeholder = "Search and select patient...",
  disabled,
  className,
}: PatientSelectProps) {
  const loadOptions = useCallback(async (query: string): Promise<AsyncSelectOption[]> => {
    const searchParams = new URLSearchParams({
      pageSize: "15",
      isArchived: "false",
    });
    if (query) searchParams.set("search", query);

    const res = await apiClient.get<PatientListItem[]>(
      `/api/patients?${searchParams.toString()}`
    );

    return res.data.map((p) => ({
      value: p.id,
      label: p.fullName,
      subLabel: `${p.patientNo} · Age: ${p.age} · ${p.contactNumber}`,
    }));
  }, []);

  return (
    <AsyncSelect
      value={value}
      onChange={onChange}
      loadOptions={loadOptions}
      placeholder={placeholder}
      searchPlaceholder="Search by name or PT-YYMMDD-NNN..."
      disabled={disabled}
      className={className}
    />
  );
}
