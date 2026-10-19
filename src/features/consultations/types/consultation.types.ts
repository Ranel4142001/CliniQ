import type { Consultation, Appointment, Patient, Profile, Prescription } from "@prisma/client";

export interface VitalsData {
  bloodPressure?: string; // e.g. "120/80"
  temperature?: number; // °C
  pulseRate?: number; // bpm
  respiratoryRate?: number; // cpm
  oxygenSaturation?: number; // %
  weight?: number; // kg
  height?: number; // cm
  bmi?: number; // kg/m^2
  notes?: string;
}

export type ConsultationWithRelations = Consultation & {
  appointment: Appointment;
  patient: Patient;
  clinician: Pick<Profile, "id" | "fullName" | "email" | "role">;
  prescription?: Prescription | null;
};

export interface CanJoinMeetingResult {
  canJoin: boolean;
  reason?: string;
  minutesUntilOpen?: number;
  isExpired?: boolean;
}
