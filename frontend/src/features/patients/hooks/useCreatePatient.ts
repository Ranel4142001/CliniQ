"use client";

import { useApiMutation } from "@/hooks/useApiMutation";
import { apiClient } from "@/lib/api-client";
import { QUERY_KEYS } from "@/constants/query-keys";
import type { CreatePatientInput } from "@backend/contracts";
import type { PatientDTO } from "@backend/contracts";

export function useCreatePatient() {
  return useApiMutation<PatientDTO, CreatePatientInput>(
    async (data) => {
      const res = await apiClient.post<PatientDTO>("/api/patients", data);
      return res.data;
    },
    {
      invalidateQueries: [QUERY_KEYS.PATIENTS.all, QUERY_KEYS.CURRENT_USER],
      successMessage: (patient) =>
        `Patient ${patient.fullName} (${patient.patientNo}) registered successfully!`,
    }
  );
}
