import type { Patient, Profile } from "@prisma/client";

/** Compact person shapes reused by read-only queries (dashboards, reports). */
export type PatientBrief = Pick<Patient, "id" | "patientNo" | "firstName" | "lastName">;
export type ClinicianBrief = Pick<Profile, "id" | "fullName" | "email">;
