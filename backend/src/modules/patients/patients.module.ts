// Composition for the patients module: binds its ports to concrete adapters.
import { createPatientService } from "./application/services/patient.service";
import { patientRepository } from "./infrastructure/persistence/repositories/patient.repository";
import { prismaTransactionRunner } from "@backend/shared/infrastructure/persistence/prisma-transaction";
import { prismaSequenceGenerator } from "@backend/shared/infrastructure/persistence/sequence";
import { prismaAuditLog } from "@backend/shared/infrastructure/audit/audit-log";

export const patientService = createPatientService({
  patientRepository,
  transactions: prismaTransactionRunner,
  sequences: prismaSequenceGenerator,
  auditRepository: prismaAuditLog,
});

/** Read-only patient lookups for other modules (e.g. appointment ownership checks). */
export const patientDirectory = {
  findById: (id: string) => patientRepository.findById(id),
  findByProfileId: (profileId: string) => patientRepository.findByProfileId(profileId),
};
