import type {
  Appointment,
  Consultation,
  Medicine,
  MedicineBatch,
  Prescription,
  PrescriptionItem,
  StockMovement,
} from "@prisma/client";
import type { ClinicianBrief, PatientBrief } from "@backend/shared/application/dto/read-models";

export type AppointmentReportRecord = Appointment & {
  patient: PatientBrief;
  clinician: ClinicianBrief;
};
export type ConsultationReportRecord = Consultation & {
  patient: PatientBrief;
  clinician: ClinicianBrief;
};
export type MovementReportRecord = StockMovement & {
  medicine: Pick<Medicine, "id" | "name" | "strength" | "dosageForm">;
  batch: Pick<MedicineBatch, "id" | "batchNo">;
  performedBy: ClinicianBrief;
};
export type PrescriptionReportRecord = Prescription & {
  patient: PatientBrief;
  clinician: ClinicianBrief;
  items: PrescriptionItem[];
};

/** Read-only queries behind the exportable reports. */
export interface ReportsQueryPort {
  getAppointments(from?: Date, to?: Date, status?: string): Promise<AppointmentReportRecord[]>;
  getConsultations(from?: Date, to?: Date): Promise<ConsultationReportRecord[]>;
  getInventory(): Promise<(Medicine & { batches: MedicineBatch[] })[]>;
  getMovements(from?: Date, to?: Date): Promise<MovementReportRecord[]>;
  getPrescriptions(from?: Date, to?: Date, status?: string): Promise<PrescriptionReportRecord[]>;
}
