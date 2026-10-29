import type { AppointmentStatus, Role } from "@prisma/client";

/** What consultations needs to know about an appointment (provided by the appointments module). */
export interface AppointmentRef {
  id: string;
  patientId: string;
  clinicianId: string;
  status: AppointmentStatus;
  reason: string;
}

export interface AppointmentAccessPort {
  /** Loads an appointment the caller is allowed to see; throws NotFound/Forbidden otherwise. */
  getAppointment(role: Role, profileId: string, appointmentId: string): Promise<AppointmentRef>;
}
