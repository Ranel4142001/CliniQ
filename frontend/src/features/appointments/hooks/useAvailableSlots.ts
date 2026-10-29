"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { QUERY_KEYS } from "@/constants/query-keys";
import type { AppointmentSlot } from "@backend/contracts";

export function useAvailableSlots(clinicianId?: string, date?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.APPOINTMENTS.slots(clinicianId ?? "", date ?? ""),
    queryFn: async () => {
      const searchParams = new URLSearchParams({
        clinicianId: clinicianId!,
        date: date!,
      });
      const res = await apiClient.get<AppointmentSlot[]>(
        `/api/appointments/slots?${searchParams.toString()}`
      );
      return res.data;
    },
    enabled: !!clinicianId && !!date,
    staleTime: 1000 * 60, // 60s — slots don't change that fast
    gcTime: 1000 * 60 * 10,
  });
}
