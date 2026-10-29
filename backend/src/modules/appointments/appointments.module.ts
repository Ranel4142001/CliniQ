// Composition for the appointments module: binds its ports to concrete adapters.
import { createAppointmentService } from "./application/services/appointment.service";
import { appointmentRepository } from "./infrastructure/persistence/repositories/appointment.repository";
import { patientDirectory } from "@backend/modules/patients";
import { prismaTransactionRunner } from "@backend/shared/infrastructure/persistence/prisma-transaction";
import { prismaAuditLog } from "@backend/shared/infrastructure/audit/audit-log";

export const appointmentService = createAppointmentService({
  appointmentRepository,
  patientDirectory,
  transactions: prismaTransactionRunner,
  auditRepository: prismaAuditLog,
});
