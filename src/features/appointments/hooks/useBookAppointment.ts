"use client";

import { useApiMutation } from "@/shared/hooks/useApiMutation";
import { apiClient } from "@/shared/lib/api-client";
import { QUERY_KEYS } from "@/shared/constants/query-keys";
import type { BookAppointmentInput } from "../schemas/appointment.schema";
import type { AppointmentDTO } from "../types/appointment.types";

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
