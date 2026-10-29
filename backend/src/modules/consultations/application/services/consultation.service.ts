import type { ConsultationRepositoryPort } from "@backend/modules/consultations/application/ports/outbound/consultation-repository.port";
import type { AppointmentAccessPort } from "@backend/modules/consultations/application/ports/outbound/appointment-access.port";
import type { MeetingLinkProvider } from "@backend/modules/consultations/application/ports/outbound/meeting-link-provider.port";
import type { AuditLogPort } from "@backend/shared/application/ports/audit-log.port";
import {
  NotFoundError,
  ForbiddenError,
  ConflictError,
  ValidationError,
} from "@backend/shared/domain/errors/app-error";
import {
  getPaginationSkipTake,
  buildPaginatedResponse,
} from "@backend/shared/application/pagination";
import type { Role } from "@prisma/client";
import type {
  StartConsultationInput,
  UpdateConsultationInput,
  CompleteConsultationInput,
} from "@backend/modules/consultations/application/dto/consultation.schema";
import type { ConsultationWithRelations } from "@backend/modules/consultations/application/dto/consultation.types";

export interface ConsultationServiceDeps {
  consultationRepository: ConsultationRepositoryPort;
  appointments: AppointmentAccessPort;
  meetingProvider: MeetingLinkProvider;
  auditLog: AuditLogPort;
}

export class ConsultationService {
  constructor(private readonly deps: ConsultationServiceDeps) {}

  async startConsultation(
    user: { id: string; role: Role },
    input: StartConsultationInput
  ): Promise<ConsultationWithRelations> {
    const existing = await this.deps.consultationRepository.findByAppointmentId(
      input.appointmentId
    );
    if (existing) {
      if (user.role !== "ADMIN" && existing.clinicianId !== user.id) {
        throw new ForbiddenError("Only the assigned clinician can manage this consultation.");
      }
      return existing;
    }

    const appt = await this.deps.appointments.getAppointment(
      user.role,
      user.id,
      input.appointmentId
    );

    if (user.role !== "ADMIN" && appt.clinicianId !== user.id) {
      throw new ForbiddenError("Only the assigned clinician can start this consultation.");
    }

    if (appt.status !== "CONFIRMED") {
      throw new ConflictError(
        `Consultation can only be started for CONFIRMED appointments. Current status is ${appt.status}.`
      );
    }

    const created = await this.deps.consultationRepository.create({
      appointmentId: appt.id,
      patientId: appt.patientId,
      clinicianId: appt.clinicianId,
      chiefComplaint: input.chiefComplaint || appt.reason,
      startedAt: new Date(),
    });

    await this.deps.auditLog.log({
      actorId: user.id,
      action: "START_CONSULTATION",
      entity: "Consultation",
      entityId: created.id,
      metadata: { appointmentId: appt.id, patientId: appt.patientId },
    });

    return created;
  }

  async getConsultation(
    user: { id: string; role: Role },
    id: string
  ): Promise<ConsultationWithRelations> {
    const consultation = await this.deps.consultationRepository.findById(id);
    if (!consultation) {
      throw new NotFoundError("Consultation not found.");
    }

    if (user.role === "PATIENT" && consultation.patient.profileId !== user.id) {
      throw new ForbiddenError("You may only view your own consultations.");
    }

    return consultation;
  }

  async getConsultationByAppointment(
    user: { id: string; role: Role },
    appointmentId: string
  ): Promise<ConsultationWithRelations | null> {
    const consultation = await this.deps.consultationRepository.findByAppointmentId(appointmentId);
    if (!consultation) return null;

    if (user.role === "PATIENT" && consultation.patient.profileId !== user.id) {
      throw new ForbiddenError("You may only view your own consultations.");
    }

    return consultation;
  }

  async updateConsultation(
    user: { id: string; role: Role },
    id: string,
    input: UpdateConsultationInput
  ): Promise<ConsultationWithRelations> {
    const consultation = await this.deps.consultationRepository.findById(id);
    if (!consultation) {
      throw new NotFoundError("Consultation not found.");
    }

    if (consultation.endedAt) {
      throw new ConflictError("This consultation has been completed and cannot be modified.");
    }

    if (user.role !== "ADMIN" && consultation.clinicianId !== user.id) {
      throw new ForbiddenError("Only the assigned clinician can update this consultation.");
    }

    const updated = await this.deps.consultationRepository.update(id, {
      chiefComplaint: input.chiefComplaint,
      vitals: input.vitals,
      findings: input.findings,
      diagnosis: input.diagnosis,
      treatmentPlan: input.treatmentPlan,
    });

    return updated;
  }

  async completeConsultation(
    user: { id: string; role: Role },
    id: string,
    input: CompleteConsultationInput
  ): Promise<ConsultationWithRelations> {
    const consultation = await this.deps.consultationRepository.findById(id);
    if (!consultation) {
      throw new NotFoundError("Consultation not found.");
    }

    if (consultation.endedAt) {
      throw new ConflictError("This consultation has already been completed.");
    }

    if (user.role !== "ADMIN" && consultation.clinicianId !== user.id) {
      throw new ForbiddenError("Only the assigned clinician can complete this consultation.");
    }

    if (!input.diagnosis || !input.diagnosis.trim()) {
      throw new ValidationError("A diagnosis is required before completing the consultation.");
    }

    const completed = await this.deps.consultationRepository.completeInTransaction(
      id,
      consultation.appointmentId,
      {
        diagnosis: input.diagnosis.trim(),
        treatmentPlan: input.treatmentPlan?.trim() || consultation.treatmentPlan,
        endedAt: new Date(),
      }
    );

    await this.deps.auditLog.log({
      actorId: user.id,
      action: "COMPLETE_CONSULTATION",
      entity: "Consultation",
      entityId: completed.id,
      metadata: {
        appointmentId: consultation.appointmentId,
        diagnosis: completed.diagnosis,
      },
    });

    return completed;
  }

  async resolveMeetingLink(appointment: {
    id: string;
    meetingUrl?: string | null;
  }): Promise<string> {
    return this.deps.meetingProvider.resolveLink(appointment);
  }

  async listConsultations(
    user: { id: string; role: Role },
    params: { page?: number; pageSize?: number; patientId?: string }
  ) {
    const { page = 1, pageSize = 10, patientId } = params;
    const { skip, take } = getPaginationSkipTake(page, pageSize);

    const targetPatientId = user.role === "PATIENT" ? undefined : patientId;
    const targetClinicianId = user.role === "CLINICIAN" ? user.id : undefined;

    const [items, total] = await Promise.all([
      this.deps.consultationRepository.list({
        skip,
        take,
        patientId: targetPatientId,
        clinicianId: targetClinicianId,
      }),
      this.deps.consultationRepository.count({
        patientId: targetPatientId,
        clinicianId: targetClinicianId,
      }),
    ]);

    return buildPaginatedResponse(items, total, page, pageSize);
  }
}
