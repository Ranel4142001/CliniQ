import type {
  Prescription,
  PrescriptionItem,
  Medicine,
  Patient,
  Profile,
  Consultation,
  StockMovement,
} from "@prisma/client";

export interface PrescriptionItemWithMedicine extends PrescriptionItem {
  medicine: Medicine;
}

export interface PrescriptionWithRelations extends Prescription {
  patient: Patient;
  clinician: Pick<Profile, "id" | "fullName" | "email">;
  consultation: Pick<
    Consultation,
    "id" | "chiefComplaint" | "startedAt" | "endedAt" | "diagnosis" | "treatmentPlan"
  >;
  items: PrescriptionItemWithMedicine[];
  stockMovements?: StockMovement[];
}

export interface PrescriptionStatsDTO {
  total: number;
  draft: number;
  issued: number;
  dispensed: number;
  voided: number;
}
