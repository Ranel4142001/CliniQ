"use client";

import { useQuery } from "@tanstack/react-query";
import { formatInTimeZone } from "date-fns-tz";
import { apiClient } from "@/lib/api-client";
import { CLINIC_TIMEZONE } from "@/lib/date";
import { QUERY_KEYS } from "@/constants/query-keys";
import {
  summarizeAvailability,
  type DoctorAvailability,
} from "@/features/dashboard/utils/doctor-availability";
import type { AppointmentSlot } from "@backend/contracts";

interface ClinicianItem {
  id: string;
  fullName: string;
  email: string;
}

export interface AvailableDoctor extends DoctorAvailability {
  id: string;
  fullName: string;
}

/** Slots refresh this often, so "Next" stays current while the dashboard is open. */
const REFRESH_MS = 60_000;

async function fetchDoctorsForDay(date: string): Promise<AvailableDoctor[]> {
  const { data: clinicians } = await apiClient.get<ClinicianItem[]>("/api/clinicians");
  return Promise.all(
    clinicians.map(async (clinician) => {
      const params = new URLSearchParams({ clinicianId: clinician.id, date });
      const { data: slots } = await apiClient.get<AppointmentSlot[]>(
        `/api/appointments/slots?${params.toString()}`
      );
      return { id: clinician.id, fullName: clinician.fullName, ...summarizeAvailability(slots) };
    })
  );
}

/** Every active clinician with today's clinic hours and next open slot. */
export function useAvailableDoctors() {
  const today = formatInTimeZone(new Date(), CLINIC_TIMEZONE, "yyyy-MM-dd");
  return useQuery({
    queryKey: [...QUERY_KEYS.APPOINTMENTS.all, "available-doctors", today],
    queryFn: () => fetchDoctorsForDay(today),
    staleTime: REFRESH_MS,
    refetchInterval: REFRESH_MS,
  });
}
