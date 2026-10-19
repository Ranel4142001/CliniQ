"use client";

import { useApiMutation } from "@/shared/hooks/useApiMutation";
import { apiClient } from "@/shared/lib/api-client";
import { QUERY_KEYS } from "@/shared/constants/query-keys";
import type { UpdateAppointmentStatusInput } from "../schemas/appointment.schema";
import type { AppointmentDTO } from "../types/appointment.types";

export interface UpdateAppointmentStatusVariables {
  id: string;
  data: UpdateAppointmentStatusInput;
}

export function useUpdateAppointmentStatus() {
  return useApiMutation<AppointmentDTO, UpdateAppointmentStatusVariables>(
    async ({ id, data }) => {
      const res = await apiClient.patch<AppointmentDTO>(
        `/api/appointments/${id}/status`,
        data
      );
      return res.data;
    },
    {
      invalidateQueries: [QUERY_KEYS.APPOINTMENTS.all],
      successMessage: (appt) => `Appointment status updated to ${appt.status}.`,
    }
  );
}
