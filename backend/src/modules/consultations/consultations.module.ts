// Composition for the consultations module: binds its ports to concrete adapters.
import { ConsultationService } from "./application/services/consultation.service";
import { createConsultationMessageService } from "./application/services/consultation-message.service";
import { consultationRepository } from "./infrastructure/persistence/repositories/consultation.repository";
import { consultationMessageRepository } from "./infrastructure/persistence/repositories/consultation-message.repository";
import { manualLinkProvider } from "./infrastructure/meeting/manual-link.provider";
import { appointmentService } from "@backend/modules/appointments";
import { prismaAuditLog } from "@backend/shared/infrastructure/audit/audit-log";

export const consultationService = new ConsultationService({
  consultationRepository,
  appointments: appointmentService,
  meetingProvider: manualLinkProvider,
  auditLog: prismaAuditLog,
});

export const consultationMessageService = createConsultationMessageService({
  consultationMessageRepository,
});
