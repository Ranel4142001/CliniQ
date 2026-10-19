"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/shared/lib/api-client";
import { QUERY_KEYS } from "@/shared/constants/query-keys";

export interface PatientHistoryRecord {
  id: string;
  scheduledAt: string;
  type: "IN_PERSON" | "ONLINE";
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
  reason: string;
  consultation?: {
    id: string;
    chiefComplaint: string;
    diagnosis: string | null;
    startedAt: string | null;
    endedAt: string | null;
  } | null;
}

export function usePatientHistory(patientId: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.PATIENTS.detail(patientId), "history"] as const,
    queryFn: async () => {
      const res = await apiClient.get<PatientHistoryRecord[]>(
        `/api/patients/${patientId}/history`
      );
      return res.data;
    },
    enabled: !!patientId,
  });
}
