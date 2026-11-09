import type { PrescriptionRepositoryPort } from "@backend/modules/prescriptions/application/ports/outbound/prescription-repository.port";
import type { StockDispenserPort } from "@backend/modules/prescriptions/application/ports/outbound/stock-dispenser.port";
import type { AuditAction, AuditLogPort } from "@backend/shared/application/ports/audit-log.port";
import type { RecordNumberGeneratorPort } from "@backend/shared/application/ports/record-number-generator.port";
import { RECORD_PREFIXES } from "@backend/shared/domain/record-number";
import type { TransactionRunner } from "@backend/shared/application/ports/transaction.port";
import {
  getPaginationSkipTake,
  buildPaginatedResponse,
} from "@backend/shared/application/pagination";
import {
  NotFoundError,
  ForbiddenError,
  ConflictError,
  ValidationError,
} from "@backend/shared/domain/errors/app-error";
import type { Role } from "@prisma/client";
import type {
  CreatePrescriptionInput,
  UpdatePrescriptionInput,
  VoidPrescriptionInput,
  ListPrescriptionsInput,
} from "@backend/modules/prescriptions/application/dto/prescription.schema";
import type { PrescriptionWithRelations } from "@backend/modules/prescriptions/application/dto/prescription.types";

export interface PrescriptionServiceDeps {
  prescriptionRepository: PrescriptionRepositoryPort;
  stock: StockDispenserPort;
  transactions: TransactionRunner;
  recordNumbers: RecordNumberGeneratorPort;
  auditLog: AuditLogPort;
}

const STATUS_CHANGED =
  "This prescription was changed by someone else. Please refresh and try again.";

export class PrescriptionService {
  constructor(private readonly deps: PrescriptionServiceDeps) {}

  async createPrescription(
    user: { id: string; role: Role },
    input: CreatePrescriptionInput
  ): Promise<PrescriptionWithRelations> {
    if (user.role !== "CLINICIAN" && user.role !== "ADMIN") {
      throw new ForbiddenError("Only clinicians can create prescriptions.");
    }

    const consultation = await this.deps.prescriptionRepository.findConsultation(
      input.consultationId
    );
    if (!consultation) throw new NotFoundError("Consultation not found.");
    if (user.role !== "ADMIN" && consultation.clinicianId !== user.id) {
      throw new ForbiddenError("Only the assigned clinician can prescribe for this consultation.");
    }

    const existing = await this.deps.prescriptionRepository.findByConsultationId(
      input.consultationId
    );
    if (existing) throw new ConflictError("A prescription already exists for this consultation.");

    await this.validateMedicinesActive(input.items.map((i) => i.medicineId));

    const created = await this.deps.prescriptionRepository.create({
      consultationId: input.consultationId,
      patientId: consultation.patientId,
      clinicianId: user.id,
      notes: input.notes,
      items: input.items,
    });

    await this.logAudit(user.id, "CREATE_PRESCRIPTION", created.id, {
      consultationId: consultation.id,
    });
    return created;
  }

  async getPrescription(
    user: { id: string; role: Role; patientId?: string },
    id: string
  ): Promise<PrescriptionWithRelations> {
    const prescription = await this.deps.prescriptionRepository.findById(id);
    if (!prescription) throw new NotFoundError("Prescription not found.");

    if (user.role === "PATIENT") {
      if (user.patientId && prescription.patientId !== user.patientId) {
        throw new ForbiddenError("You are not authorized to view this prescription.");
      }
      if (prescription.status === "DRAFT") {
        throw new ForbiddenError("Patients cannot view draft prescriptions.");
      }
    }

    return prescription;
  }

  async updatePrescription(
    user: { id: string; role: Role },
    id: string,
    input: UpdatePrescriptionInput
  ): Promise<PrescriptionWithRelations> {
    const prescription = await this.deps.prescriptionRepository.findById(id);
    if (!prescription) throw new NotFoundError("Prescription not found.");
    if (prescription.status !== "DRAFT") {
      throw new ConflictError(
        "Only draft prescriptions can be modified. Once issued, editing is locked."
      );
    }
    if (user.role !== "ADMIN" && prescription.clinicianId !== user.id) {
      throw new ForbiddenError("Only the prescribing clinician can edit this draft.");
    }

    if (input.items && input.items.length > 0) {
      await this.validateMedicinesActive(input.items.map((i) => i.medicineId));
    }

    const updated = await this.deps.prescriptionRepository.updateDraft(id, input);
    await this.logAudit(user.id, "UPDATE_PRESCRIPTION", id, { changes: input });
    return updated;
  }

  async issuePrescription(
    user: { id: string; role: Role },
    id: string
  ): Promise<PrescriptionWithRelations> {
    if (user.role !== "CLINICIAN" && user.role !== "ADMIN") {
      throw new ForbiddenError("Only clinicians can issue prescriptions.");
    }

    const prescription = await this.deps.prescriptionRepository.findById(id);
    if (!prescription) throw new NotFoundError("Prescription not found.");
    if (prescription.status !== "DRAFT") {
      throw new ConflictError(
        `Only draft prescriptions can be issued. Current status: ${prescription.status}`
      );
    }
    if (user.role !== "ADMIN" && prescription.clinicianId !== user.id) {
      throw new ForbiddenError("Only the prescribing clinician can issue this prescription.");
    }
    if (!prescription.items || prescription.items.length === 0) {
      throw new ValidationError("Cannot issue a prescription without medicine items.");
    }

    const issued = await this.deps.transactions.run(async (tx) => {
      const prescriptionNo = await this.deps.recordNumbers.next(RECORD_PREFIXES.PRESCRIPTION, (candidate) =>
        this.deps.prescriptionRepository.isPrescriptionNoTaken(candidate, tx)
      );
      return this.deps.prescriptionRepository.transition(
        id,
        ["DRAFT"],
        "ISSUED",
        { prescriptionNo, issuedAt: new Date() },
        tx
      );
    });
    if (!issued) throw new ConflictError(STATUS_CHANGED);

    await this.logAudit(user.id, "ISSUE_PRESCRIPTION", id, {
      prescriptionNo: issued.prescriptionNo,
    });
    return issued;
  }

  async dispensePrescription(
    user: { id: string; role: Role },
    id: string
  ): Promise<PrescriptionWithRelations> {
    if (user.role !== "STAFF" && user.role !== "ADMIN") {
      throw new ForbiddenError("Only clinic staff or administrators can dispense prescriptions.");
    }

    const prescription = await this.deps.prescriptionRepository.findById(id);
    if (!prescription) throw new NotFoundError("Prescription not found.");
    if (prescription.status !== "ISSUED") {
      throw new ConflictError(
        `Only ISSUED prescriptions can be dispensed. Current status: ${prescription.status}`
      );
    }

    await this.deps.transactions.run(async (tx) => {
      // Claim the prescription first: a concurrent dispense fails here, before any stock moves.
      const claimed = await this.deps.prescriptionRepository.transition(
        id,
        ["ISSUED"],
        "DISPENSED",
        { dispensedAt: new Date() },
        tx
      );
      if (!claimed) throw new ConflictError(STATUS_CHANGED);

      for (const item of prescription.items) {
        await this.deps.stock.dispense({
          medicineId: item.medicineId,
          quantity: item.quantity,
          performedById: user.id,
          prescriptionId: prescription.id,
          reason: `Dispensed Rx #${prescription.prescriptionNo}`,
          tx,
        });
      }
    });

    // Re-read after commit so the response includes the new stock movements.
    const dispensed = await this.deps.prescriptionRepository.findById(id);
    if (!dispensed) throw new NotFoundError("Prescription not found.");

    await this.logAudit(user.id, "DISPENSE_PRESCRIPTION", id, {
      prescriptionNo: prescription.prescriptionNo,
    });
    return dispensed;
  }

  async voidPrescription(
    user: { id: string; role: Role },
    id: string,
    input: VoidPrescriptionInput
  ): Promise<PrescriptionWithRelations> {
    if (user.role !== "CLINICIAN" && user.role !== "ADMIN") {
      throw new ForbiddenError("Only clinicians or administrators can void prescriptions.");
    }
    if (!input.voidReason?.trim()) {
      throw new ValidationError("A reason is required to void a prescription.");
    }

    const prescription = await this.deps.prescriptionRepository.findById(id);
    if (!prescription) throw new NotFoundError("Prescription not found.");
    if (prescription.status === "DISPENSED") {
      throw new ConflictError("Cannot void a prescription that has already been dispensed.");
    }
    if (prescription.status === "VOIDED") {
      throw new ConflictError("Prescription is already voided.");
    }
    if (user.role !== "ADMIN" && prescription.clinicianId !== user.id) {
      throw new ForbiddenError("Only the prescribing clinician can void this prescription.");
    }

    const voided = await this.deps.prescriptionRepository.transition(
      id,
      ["DRAFT", "ISSUED"],
      "VOIDED",
      {
        voidReason: input.voidReason.trim(),
      }
    );
    if (!voided) throw new ConflictError(STATUS_CHANGED);
    await this.logAudit(user.id, "VOID_PRESCRIPTION", id, { reason: input.voidReason });
    return voided;
  }

  async listPrescriptions(
    user: { id: string; role: Role; patientId?: string },
    params: ListPrescriptionsInput
  ) {
    const { skip, take } = getPaginationSkipTake(params.page, params.pageSize);
    let patientId = params.patientId;

    if (user.role === "PATIENT") {
      patientId = user.patientId;
    }

    const [items, total] = await Promise.all([
      this.deps.prescriptionRepository.findAll({
        patientId,
        consultationId: params.consultationId,
        status: user.role === "PATIENT" ? params.status || "ISSUED" : params.status,
        search: params.search,
        skip,
        take,
      }),
      this.deps.prescriptionRepository.countAll({
        patientId,
        consultationId: params.consultationId,
        status: user.role === "PATIENT" ? params.status || "ISSUED" : params.status,
        search: params.search,
      }),
    ]);

    return buildPaginatedResponse(items, total, params.page, params.pageSize);
  }

  async getStats(user: { id: string; role: Role; patientId?: string }) {
    const filterPatientId = user.role === "PATIENT" ? user.patientId : undefined;
    return this.deps.prescriptionRepository.countByStatus(filterPatientId);
  }

  private async validateMedicinesActive(medicineIds: string[]): Promise<void> {
    const [archived] = await this.deps.prescriptionRepository.findArchivedMedicines(medicineIds);
    if (archived) {
      throw new ConflictError(
        `Cannot prescribe archived medicine "${archived.name} ${archived.strength}".`
      );
    }
  }

  private async logAudit(
    actorId: string,
    action: AuditAction,
    entityId: string,
    metadata: Record<string, unknown>
  ) {
    await this.deps.auditLog.log({ actorId, action, entity: "Prescription", entityId, metadata });
  }
}
