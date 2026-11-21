import { can, type AuthAction } from "@backend/shared/domain/permissions";
import type { Role } from "@backend/shared/domain/roles";

export const REPORT_KEYS = [
  "appointments",
  "consultations",
  "inventory",
  "movements",
  "prescriptions",
] as const;

export type ReportKey = (typeof REPORT_KEYS)[number];

export function isReportKey(value: string): value is ReportKey {
  return (REPORT_KEYS as readonly string[]).includes(value);
}

/** What each report reveals beyond general reporting access. Consultations carry diagnoses. */
const REPORT_REQUIRED_ACTION: Record<ReportKey, AuthAction> = {
  appointments: "view_reports",
  consultations: "view_clinical_history",
  inventory: "view_reports",
  movements: "view_reports",
  prescriptions: "view_reports",
};

/** Shared by the API and the Reports page, so both agree on who sees which report. */
export function canViewReport(role: Role, reportKey: ReportKey): boolean {
  return can(role, "view_reports") && can(role, REPORT_REQUIRED_ACTION[reportKey]);
}

export interface AppointmentReportRow extends Record<string, unknown> {
  id: string;
  scheduledAt: string;
  patientName: string;
  patientNo: string;
  clinicianName: string;
  type: string;
  status: string;
  reason: string;
}

export interface ConsultationReportRow extends Record<string, unknown> {
  id: string;
  consultationDate: string;
  patientName: string;
  patientNo: string;
  clinicianName: string;
  chiefComplaint: string;
  diagnosis: string;
  completedAt: string;
}

export interface InventoryReportRow extends Record<string, unknown> {
  id: string;
  name: string;
  genericName: string;
  dosageForm: string;
  strength: string;
  totalStock: number;
  unit: string;
  reorderLevel: number;
  stockStatus: string;
}

export interface MovementReportRow extends Record<string, unknown> {
  id: string;
  date: string;
  medicineName: string;
  batchNo: string;
  type: string;
  quantity: number;
  reason: string;
  performedBy: string;
}

export interface PrescriptionReportRow extends Record<string, unknown> {
  id: string;
  prescriptionNo: string;
  issuedAt: string;
  patientName: string;
  patientNo: string;
  clinicianName: string;
  status: string;
  itemsCount: number;
  dispensedAt: string;
}

export interface ReportFilterParams {
  from?: string;
  to?: string;
  status?: string;
  search?: string;
}
