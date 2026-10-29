"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { QUERY_KEYS } from "@/constants/query-keys";
import type { PatientDTO } from "@backend/contracts";

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
