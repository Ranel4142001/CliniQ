"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { QUERY_KEYS } from "@/constants/query-keys";
import type { AppointmentDTO } from "@backend/contracts";

export function useAppointment(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.APPOINTMENTS.detail(id),
    queryFn: async () => {
      const res = await apiClient.get<AppointmentDTO>(`/api/appointments/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
}
