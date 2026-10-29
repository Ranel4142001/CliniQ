import type { Sex } from "@prisma/client";

/**
 * DTO returned to the client – never includes raw Prisma relations or authId.
 */
export interface PatientDTO {
  id: string;
  patientNo: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  fullName: string; // computed: "First Middle Last"
  birthDate: string; // ISO date string yyyy-MM-dd
  age: number; // computed
  sex: Sex;
  contactNumber: string;
  address: string;
  guardianName: string | null;
  guardianContact: string | null;
  emergencyName: string;
  emergencyContact: string;
  bloodType: string | null;
  allergies: string | null;
  existingConditions: string | null;
  consentGivenAt: string; // ISO datetime
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PatientListItem {
  id: string;
  patientNo: string;
  fullName: string;
  birthDate: string;
  age: number;
  sex: Sex;
  contactNumber: string;
  isArchived: boolean;
}

export interface PatientHistoryItem {
  id: string;
  scheduledAt: string;
  type: string;
  status: string;
  reason: string;
}
