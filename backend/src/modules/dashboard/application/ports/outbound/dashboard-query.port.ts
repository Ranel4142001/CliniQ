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

/** Read-only queries behind the role-specific dashboards. */
export interface DashboardQueryPort {
  getTodayAppointments(
    todayStart: Date,
    todayEnd: Date,
    clinicianId?: string
  ): Promise<DashboardAppointment[]>;
  getPendingAppointments(clinicianId?: string): Promise<DashboardAppointment[]>;
  countAppointmentsToday(todayStart: Date, todayEnd: Date, clinicianId?: string): Promise<number>;
  countPendingAppointments(clinicianId?: string): Promise<number>;
  countTotalPatients(): Promise<number>;
  getMedicinesWithBatches(): Promise<(Medicine & { batches: MedicineBatch[] })[]>;
  countExpiringBatches(startDate: Date, endDate: Date): Promise<number>;
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
