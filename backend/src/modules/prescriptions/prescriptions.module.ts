// Composition for the prescriptions module: binds its ports to concrete adapters.
import { PrescriptionService } from "./application/services/prescription.service";
import { prescriptionRepository } from "./infrastructure/persistence/repositories/prescription.repository";
import { dispenseMedicine } from "@backend/modules/medicines";
import { prismaTransactionRunner } from "@backend/shared/infrastructure/persistence/prisma-transaction";
import { prismaSequenceGenerator } from "@backend/shared/infrastructure/persistence/sequence";
import { prismaAuditLog } from "@backend/shared/infrastructure/audit/audit-log";

export const prescriptionService = new PrescriptionService({
  prescriptionRepository,
  stock: { dispense: dispenseMedicine },
  transactions: prismaTransactionRunner,
  sequences: prismaSequenceGenerator,
  auditLog: prismaAuditLog,
});
