"use client";

import { useApiMutation } from "@/hooks/useApiMutation";
import { apiClient } from "@/lib/api-client";
import { QUERY_KEYS } from "@/constants/query-keys";
import type { UpdateAppointmentStatusInput } from "@backend/contracts";
import type { AppointmentDTO } from "@backend/contracts";

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
