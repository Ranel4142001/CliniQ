"use client";

import { useApiMutation } from "@/hooks/useApiMutation";
import { apiClient } from "@/lib/api-client";
import { QUERY_KEYS } from "@/constants/query-keys";
import type { BookAppointmentInput } from "@backend/contracts";
import type { AppointmentDTO } from "@backend/contracts";

export function useBookAppointment() {
  return useApiMutation<AppointmentDTO, BookAppointmentInput>(
    async (data) => {
      const res = await apiClient.post<AppointmentDTO>("/api/appointments", data);
      return res.data;
    },
    {
      invalidateQueries: [QUERY_KEYS.APPOINTMENTS.all],
      successMessage: "Appointment booked successfully!",
    }
  );
}
