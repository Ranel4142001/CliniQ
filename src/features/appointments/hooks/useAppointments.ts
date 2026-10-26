"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/shared/lib/api-client";
import { QUERY_KEYS } from "@/shared/constants/query-keys";
import type { AppointmentListItem } from "../types/appointment.types";
import type { Paginated } from "@/shared/types/api";

export interface UseAppointmentsParams {
  page?: number;
  pageSize?: number;
  status?: string;
  type?: string;
  clinicianId?: string;
  patientId?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
}

export function useAppointments(params: UseAppointmentsParams = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.APPOINTMENTS.list(params),
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.page) searchParams.set("page", String(params.page));
      if (params.pageSize) searchParams.set("pageSize", String(params.pageSize));
      if (params.status) searchParams.set("status", params.status);
      if (params.type) searchParams.set("type", params.type);
      if (params.clinicianId) searchParams.set("clinicianId", params.clinicianId);
      if (params.patientId) searchParams.set("patientId", params.patientId);
      if (params.date) searchParams.set("date", params.date);
      if (params.startDate) searchParams.set("startDate", params.startDate);
      if (params.endDate) searchParams.set("endDate", params.endDate);

      const res = await apiClient.get<AppointmentListItem[]>(
        `/api/appointments?${searchParams.toString()}`
      );
      return {
        items: res.data,
        meta: res.meta as unknown as Paginated<AppointmentListItem>,
      };
    },
    staleTime: 1000 * 30, // 30s — appointments change frequently
    placeholderData: (prev) => prev, // keep previous data while refetching (no flash)
  });
}
