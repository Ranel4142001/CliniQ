"use client";

import { useApiMutation } from "@/shared/hooks/useApiMutation";
import { apiClient } from "@/shared/lib/api-client";
import { QUERY_KEYS } from "@/shared/constants/query-keys";
import type { CreatePatientInput } from "../schemas/patient.schema";
import type { PatientDTO } from "../types/patient.types";

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
