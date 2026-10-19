"use client";

import { useApiMutation } from "@/shared/hooks/useApiMutation";
import { apiClient } from "@/shared/lib/api-client";
import { QUERY_KEYS } from "@/shared/constants/query-keys";
import type { EditPatientInput } from "../schemas/patient.schema";
import type { PatientDTO } from "../types/patient.types";

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
