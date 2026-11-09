// Composition for the prescriptions module: binds its ports to concrete adapters.
import { PrescriptionService } from "./application/services/prescription.service";
import { prescriptionRepository } from "./infrastructure/persistence/repositories/prescription.repository";
import { dispenseMedicine } from "@backend/modules/medicines";
import { prismaTransactionRunner } from "@backend/shared/infrastructure/persistence/prisma-transaction";
import { recordNumberGenerator } from "@backend/shared/infrastructure/persistence/record-number";
import { prismaAuditLog } from "@backend/shared/infrastructure/audit/audit-log";

export const prescriptionService = new PrescriptionService({
  prescriptionRepository,
  stock: { dispense: dispenseMedicine },
  transactions: prismaTransactionRunner,
  recordNumbers: recordNumberGenerator,
  auditLog: prismaAuditLog,
});
