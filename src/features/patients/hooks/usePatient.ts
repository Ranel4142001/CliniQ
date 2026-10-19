"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/shared/lib/api-client";
import { QUERY_KEYS } from "@/shared/constants/query-keys";
import type { PatientDTO } from "../types/patient.types";

export function usePatient(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.PATIENTS.detail(id),
    queryFn: async () => {
      const res = await apiClient.get<PatientDTO>(`/api/patients/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
}
