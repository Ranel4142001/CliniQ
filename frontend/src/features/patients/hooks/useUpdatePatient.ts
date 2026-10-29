"use client";

import { useApiMutation } from "@/hooks/useApiMutation";
import { apiClient } from "@/lib/api-client";
import { QUERY_KEYS } from "@/constants/query-keys";
import type { EditPatientInput } from "@backend/contracts";
import type { PatientDTO } from "@backend/contracts";

export interface UpdatePatientVariables {
  id: string;
  data: EditPatientInput;
}

export function useUpdatePatient() {
  return useApiMutation<PatientDTO, UpdatePatientVariables>(
    async ({ id, data }) => {
      const res = await apiClient.patch<PatientDTO>(`/api/patients/${id}`, data);
      return res.data;
    },
    {
      invalidateQueries: [QUERY_KEYS.PATIENTS.all],
      successMessage: "Patient information updated successfully.",
    }
  );
}
