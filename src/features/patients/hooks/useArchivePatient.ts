"use client";

import { useApiMutation } from "@/shared/hooks/useApiMutation";
import { apiClient } from "@/shared/lib/api-client";
import { QUERY_KEYS } from "@/shared/constants/query-keys";
import type { PatientDTO } from "../types/patient.types";

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
