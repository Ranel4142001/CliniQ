"use client";

import { useApiMutation } from "@/hooks/useApiMutation";
import { apiClient } from "@/lib/api-client";
import { QUERY_KEYS } from "@/constants/query-keys";
import type { PatientDTO } from "@backend/contracts";

export function useArchivePatient() {
  return useApiMutation<PatientDTO, string>(
    async (id: string) => {
      const res = await apiClient.patch<PatientDTO>(`/api/patients/${id}/archive`, {});
      return res.data;
    },
    {
      invalidateQueries: [QUERY_KEYS.PATIENTS.all],
      successMessage: "Patient record has been archived.",
    }
  );
}
