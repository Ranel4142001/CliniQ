export type ReportKey =
  "appointments" | "consultations" | "inventory" | "movements" | "prescriptions";

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
