import type { AppointmentStatus, AppointmentType, Patient } from "@prisma/client";
import type { EditPatientInput } from "@backend/modules/patients/application/dto/patient.schema";
import type { TransactionContext } from "@backend/shared/application/ports/transaction.port";

export type PatientRecord = Omit<Patient, never>;

export type PatientSummary = Pick<
  Patient,
  | "id"
  | "patientNo"
  | "firstName"
  | "middleName"
  | "lastName"
  | "birthDate"
  | "sex"
  | "contactNumber"
  | "isArchived"
>;

export type NewPatient = Omit<Patient, "id" | "isArchived" | "createdAt" | "updatedAt">;

export interface PatientVisit {
  id: string;
  scheduledAt: Date;
  type: AppointmentType;
  status: AppointmentStatus;
  reason: string;
  consultation: {
    id: string;
    chiefComplaint: string;
    diagnosis: string | null;
    startedAt: Date | null;
    endedAt: Date | null;
  } | null;
}

export interface PatientListQuery {
  skip: number;
  take: number;
  search?: string;
  isArchived?: boolean;
}

export interface PatientRepositoryPort {
  findById(id: string): Promise<PatientRecord | null>;
  findByPatientNo(patientNo: string): Promise<PatientRecord | null>;
  findByProfileId(profileId: string): Promise<PatientRecord | null>;
  findDuplicate(
    firstName: string,
    lastName: string,
    birthDate: Date
  ): Promise<Pick<Patient, "id" | "patientNo"> | null>;
  list(query: PatientListQuery): Promise<PatientSummary[]>;
  count(query: Omit<PatientListQuery, "skip" | "take">): Promise<number>;
  create(data: NewPatient, tx?: TransactionContext): Promise<PatientRecord>;
  update(id: string, data: Partial<EditPatientInput>): Promise<PatientRecord>;
  archive(id: string): Promise<PatientRecord>;
  getHistory(patientId: string): Promise<PatientVisit[]>;
}
