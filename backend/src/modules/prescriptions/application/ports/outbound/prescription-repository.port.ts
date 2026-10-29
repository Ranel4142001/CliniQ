import type { Prescription, PrescriptionStatus } from "@prisma/client";
import type { PrescriptionWithRelations } from "@backend/modules/prescriptions/application/dto/prescription.types";
import type { PrescriptionItemInput } from "@backend/modules/prescriptions/application/dto/prescription.schema";
import type { TransactionContext } from "@backend/shared/application/ports/transaction.port";

export interface PrescriptionFilter {
  patientId?: string;
  consultationId?: string;
  status?: PrescriptionStatus;
  search?: string;
}

export interface NewPrescription {
  consultationId: string;
  patientId: string;
  clinicianId: string;
  notes?: string | null;
  items: PrescriptionItemInput[];
}

/** Fields that may change together with a status transition. */
export type PrescriptionTransitionData = Partial<
  Pick<Prescription, "prescriptionNo" | "issuedAt" | "dispensedAt" | "voidReason">
>;

export interface PrescriptionRepositoryPort {
  findById(id: string): Promise<PrescriptionWithRelations | null>;
  findByConsultationId(consultationId: string): Promise<PrescriptionWithRelations | null>;
  findAll(
    params: PrescriptionFilter & { skip?: number; take?: number }
  ): Promise<PrescriptionWithRelations[]>;
  countAll(params: PrescriptionFilter): Promise<number>;
  create(data: NewPrescription): Promise<PrescriptionWithRelations>;
  updateDraft(
    id: string,
    data: { notes?: string | null; items?: PrescriptionItemInput[] }
  ): Promise<PrescriptionWithRelations>;
  /**
   * Moves a prescription to `to` only if it is currently in one of `from`.
   * Returns null when the status changed concurrently (nothing is updated).
   */
  transition(
    id: string,
    from: PrescriptionStatus[],
    to: PrescriptionStatus,
    data: PrescriptionTransitionData,
    tx?: TransactionContext
  ): Promise<PrescriptionWithRelations | null>;
  countByStatus(
    patientId?: string
  ): Promise<Record<"total" | "draft" | "issued" | "dispensed" | "voided", number>>;
  /** The consultation a new prescription would belong to. */
  findConsultation(
    consultationId: string
  ): Promise<{ id: string; clinicianId: string; patientId: string } | null>;
  /** Of the given medicine ids, those that are archived (cannot be prescribed). */
  findArchivedMedicines(medicineIds: string[]): Promise<{ name: string; strength: string }[]>;
}
