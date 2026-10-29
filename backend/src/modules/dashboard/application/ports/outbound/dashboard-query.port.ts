import type {
  Appointment,
  Medicine,
  MedicineBatch,
  Patient,
  Prescription,
  PrescriptionItem,
  Profile,
} from "@prisma/client";
import type { ClinicianBrief, PatientBrief } from "@backend/shared/application/dto/read-models";

export type DashboardAppointment = Appointment & {
  patient: PatientBrief;
  clinician: ClinicianBrief;
};
export type PatientUpcomingAppointment = Appointment & { clinician: ClinicianBrief };
export type PatientRecentPrescription = Prescription & {
  clinician: Pick<Profile, "fullName">;
  items: PrescriptionItem[];
};

export interface StaffDashboardCounts {
  todayAppointments: number;
  pendingAppointments: number;
  activePatients: number;
  expiringBatches: number;
}

/** Read-only queries behind the role-specific dashboards. */
export interface DashboardQueryPort {
  /** All staff-dashboard counters in a single database round trip. */
  getStaffCounts(params: {
    todayStart: Date;
    todayEnd: Date;
    expiringUntil: Date;
    clinicianId?: string;
  }): Promise<StaffDashboardCounts>;
  getTodayAppointments(
    todayStart: Date,
    todayEnd: Date,
    clinicianId?: string
  ): Promise<DashboardAppointment[]>;
  getPendingAppointments(clinicianId?: string): Promise<DashboardAppointment[]>;
  getMedicinesWithBatches(): Promise<(Medicine & { batches: MedicineBatch[] })[]>;
  getPatientByProfileId(profileId: string): Promise<Patient | null>;
  getPatientUpcomingAppointments(
    patientId: string,
    fromDate: Date
  ): Promise<PatientUpcomingAppointment[]>;
  countPatientUpcomingAppointments(patientId: string, fromDate: Date): Promise<number>;
  countPatientConsultations(patientId: string): Promise<number>;
  getPatientPrescriptions(patientId: string): Promise<PatientRecentPrescription[]>;
  countPatientActivePrescriptions(patientId: string): Promise<number>;
}
