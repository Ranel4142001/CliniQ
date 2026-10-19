import { prescriptionRepository } from "../repositories/prescription.repository";
import { dispenseMedicine } from "@/features/medicines";
import { prisma } from "@/shared/lib/prisma";
import { nextSequenceNumber } from "@/shared/lib/sequence";
import { getPaginationSkipTake, buildPaginatedResponse } from "@/shared/lib/pagination";
import {
  NotFoundError,
  ForbiddenError,
  ConflictError,
  ValidationError,
} from "@/shared/lib/errors";
import type { Prisma, Role } from "@prisma/client";
import type {
  CreatePrescriptionInput,
  UpdatePrescriptionInput,
  VoidPrescriptionInput,
  ListPrescriptionsInput,
} from "../schemas/prescription.schema";
import type { PrescriptionWithRelations } from "../types/prescription.types";

export class PrescriptionService {
  async createPrescription(
    user: { id: string; role: Role },
    input: CreatePrescriptionInput
  ): Promise<PrescriptionWithRelations> {
    if (user.role !== "CLINICIAN" && user.role !== "ADMIN") {
      throw new ForbiddenError("Only clinicians can create prescriptions.");
    }

    const consultation = await prisma.consultation.findUnique({
      where: { id: input.consultationId },
    });
    if (!consultation) throw new NotFoundError("Consultation not found.");
    if (user.role !== "ADMIN" && consultation.clinicianId !== user.id) {
      throw new ForbiddenError("Only the assigned clinician can prescribe for this consultation.");
    }

    const existing = await prescriptionRepository.findByConsultationId(input.consultationId);
    if (existing) throw new ConflictError("A prescription already exists for this consultation.");

    await this.validateMedicinesActive(input.items.map((i) => i.medicineId));

    const created = await prescriptionRepository.create({
      consultationId: input.consultationId,
      patientId: consultation.patientId,
      clinicianId: user.id,
      notes: input.notes,
      items: input.items,
    });

    await this.logAudit(user.id, "CREATE_PRESCRIPTION", created.id, { consultationId: consultation.id });
    return created;
  }

  async getPrescription(
    user: { id: string; role: Role; patientId?: string },
    id: string
  ): Promise<PrescriptionWithRelations> {
    const prescription = await prescriptionRepository.findById(id);
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
    const prescription = await prescriptionRepository.findById(id);
    if (!prescription) throw new NotFoundError("Prescription not found.");
    if (prescription.status !== "DRAFT") {
      throw new ConflictError("Only draft prescriptions can be modified. Once issued, editing is locked.");
    }
    if (user.role !== "ADMIN" && prescription.clinicianId !== user.id) {
      throw new ForbiddenError("Only the prescribing clinician can edit this draft.");
    }

    if (input.items && input.items.length > 0) {
      await this.validateMedicinesActive(input.items.map((i) => i.medicineId));
    }

    const updated = await prescriptionRepository.updateDraft(id, input);
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

    const prescription = await prescriptionRepository.findById(id);
    if (!prescription) throw new NotFoundError("Prescription not found.");
    if (prescription.status !== "DRAFT") {
      throw new ConflictError(`Only draft prescriptions can be issued. Current status: ${prescription.status}`);
    }
    if (user.role !== "ADMIN" && prescription.clinicianId !== user.id) {
      throw new ForbiddenError("Only the prescribing clinician can issue this prescription.");
    }
    if (!prescription.items || prescription.items.length === 0) {
      throw new ValidationError("Cannot issue a prescription without medicine items.");
    }

    const issued = await prisma.$transaction(async (tx) => {
      const year = new Date().getFullYear();
      let prescriptionNo: string;
      try {
        prescriptionNo = await nextSequenceNumber(tx, `RX-${year}`);
      } catch {
        const rand = Math.floor(1000 + Math.random() * 9000);
        prescriptionNo = `RX-${year}-${rand}`;
      }
      return prescriptionRepository.markIssued(id, prescriptionNo, new Date(), tx);
    });

    await this.logAudit(user.id, "ISSUE_PRESCRIPTION", id, { prescriptionNo: issued.prescriptionNo });
    return issued;
  }

  async dispensePrescription(
    user: { id: string; role: Role },
    id: string
  ): Promise<PrescriptionWithRelations> {
    if (user.role !== "STAFF" && user.role !== "ADMIN") {
      throw new ForbiddenError("Only clinic staff or administrators can dispense prescriptions.");
    }

    const prescription = await prescriptionRepository.findById(id);
    if (!prescription) throw new NotFoundError("Prescription not found.");
    if (prescription.status !== "ISSUED") {
      throw new ConflictError(
        `Only ISSUED prescriptions can be dispensed. Current status: ${prescription.status}`
      );
    }

    const dispensed = await prisma.$transaction(async (tx) => {
      for (const item of prescription.items) {
        await dispenseMedicine({
          medicineId: item.medicineId,
          quantity: item.quantity,
          performedById: user.id,
          prescriptionId: prescription.id,
          reason: `Dispensed Rx #${prescription.prescriptionNo}`,
          tx,
        });
      }
      return prescriptionRepository.markDispensed(id, new Date(), tx);
    });

    await this.logAudit(user.id, "DISPENSE_PRESCRIPTION", id, { prescriptionNo: prescription.prescriptionNo });
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

    const prescription = await prescriptionRepository.findById(id);
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

    const voided = await prescriptionRepository.markVoided(id, input.voidReason.trim());
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
      prescriptionRepository.findAll({
        patientId,
        consultationId: params.consultationId,
        status: user.role === "PATIENT" ? (params.status || "ISSUED") : params.status,
        search: params.search,
        skip,
        take,
      }),
      prescriptionRepository.countAll({
        patientId,
        consultationId: params.consultationId,
        status: user.role === "PATIENT" ? (params.status || "ISSUED") : params.status,
        search: params.search,
      }),
    ]);

    return buildPaginatedResponse(items, total, params.page, params.pageSize);
  }

  async getStats(user: { id: string; role: Role; patientId?: string }) {
    const filterPatientId = user.role === "PATIENT" ? user.patientId : undefined;
    return prescriptionRepository.countByStatus(filterPatientId);
  }

  private async validateMedicinesActive(medicineIds: string[]): Promise<void> {
    const medicines = await prisma.medicine.findMany({
      where: { id: { in: medicineIds } },
    });
    for (const med of medicines) {
      if (med.isArchived) {
        throw new ConflictError(`Cannot prescribe archived medicine "${med.name} ${med.strength}".`);
      }
    }
  }

  private async logAudit(actorId: string, action: string, entityId: string, metadata: unknown) {
    try {
      await prisma.auditLog.create({
        data: {
          actorId,
          action,
          entity: "Prescription",
          entityId,
          metadata: metadata as Prisma.InputJsonValue,
        },
      });
    } catch (e) {
      console.warn("Audit log creation failed:", e);
    }
  }
}

export const prescriptionService = new PrescriptionService();
