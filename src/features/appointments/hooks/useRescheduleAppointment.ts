"use client";

import { useApiMutation } from "@/shared/hooks/useApiMutation";
import { apiClient } from "@/shared/lib/api-client";
import { QUERY_KEYS } from "@/shared/constants/query-keys";
import type { RescheduleAppointmentInput } from "../schemas/appointment.schema";
import type { AppointmentDTO } from "../types/appointment.types";

export interface RescheduleAppointmentVariables {
  id: string;
  data: RescheduleAppointmentInput;
}

export function useRescheduleAppointment() {
  return useApiMutation<AppointmentDTO, RescheduleAppointmentVariables>(
    async ({ id, data }) => {
      const res = await apiClient.patch<AppointmentDTO>(
        `/api/appointments/${id}`,
        data
      );
      return res.data;
    },
    {
      invalidateQueries: [QUERY_KEYS.APPOINTMENTS.all],
      successMessage: "Appointment rescheduled successfully.",
    }
  );
}
