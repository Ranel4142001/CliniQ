"use client";

import { useApiMutation } from "@/hooks/useApiMutation";
import { apiClient } from "@/lib/api-client";
import { QUERY_KEYS } from "@/constants/query-keys";
import type { RescheduleAppointmentInput } from "@backend/contracts";
import type { AppointmentDTO } from "@backend/contracts";

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
