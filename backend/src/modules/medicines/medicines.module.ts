// Composition for the medicines module: binds its ports to concrete adapters.
import { MedicineService } from "./application/services/medicine.service";
import { medicineRepository } from "./infrastructure/persistence/repositories/medicine.repository";
import { prismaTransactionRunner } from "@backend/shared/infrastructure/persistence/prisma-transaction";
import { prismaAuditLog } from "@backend/shared/infrastructure/audit/audit-log";

export const medicineService = new MedicineService({
  medicineRepository,
  transactions: prismaTransactionRunner,
  auditLog: prismaAuditLog,
});
