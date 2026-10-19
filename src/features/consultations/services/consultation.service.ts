import { consultationRepository } from "../repositories/consultation.repository";
import { appointmentService } from "@/features/appointments/services/appointment.service";
import { manualLinkProvider } from "./meeting/manual-link.provider";
import type { MeetingLinkProvider } from "./meeting/meeting-link-provider";
import {
  NotFoundError,
  ForbiddenError,
  ConflictError,
  ValidationError,
} from "@/shared/lib/errors";
import { prisma } from "@/shared/lib/prisma";
import { getPaginationSkipTake, buildPaginatedResponse } from "@/shared/lib/pagination";
import type { Role } from "@prisma/client";
import type {
  StartConsultationInput,
  UpdateConsultationInput,
  CompleteConsultationInput,
} from "../schemas/consultation.schema";
import type { ConsultationWithRelations } from "../types/consultation.types";

export class ConsultationService {
  constructor(private readonly meetingProvider: MeetingLinkProvider = manualLinkProvider) {}

  async startConsultation(
    user: { id: string; role: Role },
    input: StartConsultationInput
  ): Promise<ConsultationWithRelations> {
    const existing = await consultationRepository.findByAppointmentId(input.appointmentId);
    if (existing) {
      if (user.role !== "ADMIN" && existing.clinicianId !== user.id) {
        throw new ForbiddenError("Only the assigned clinician can manage this consultation.");
      }
      return existing;
    }

    const appt = await appointmentService.getAppointment(user.role, user.id, input.appointmentId);

    if (user.role !== "ADMIN" && appt.clinicianId !== user.id) {
      throw new ForbiddenError("Only the assigned clinician can start this consultation.");
    }

    if (appt.status !== "CONFIRMED") {
      throw new ConflictError(
        `Consultation can only be started for CONFIRMED appointments. Current status is ${appt.status}.`
      );
    }

    const created = await consultationRepository.create({
      appointmentId: appt.id,
      patientId: appt.patientId,
      clinicianId: appt.clinicianId,
      chiefComplaint: input.chiefComplaint || appt.reason,
      startedAt: new Date(),
    });

    try {
      await prisma.auditLog.create({
        data: {
          actorId: user.id,
          action: "START_CONSULTATION",
          entity: "Consultation",
          entityId: created.id,
          metadata: { appointmentId: appt.id, patientId: appt.patientId },
        },
      });
    } catch (e) {
      console.warn("Audit log creation failed:", e);
    }

    return created;
  }

  async getConsultation(
    user: { id: string; role: Role },
    id: string
  ): Promise<ConsultationWithRelations> {
    const consultation = await consultationRepository.findById(id);
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
    const consultation = await consultationRepository.findByAppointmentId(appointmentId);
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
    const consultation = await consultationRepository.findById(id);
    if (!consultation) {
      throw new NotFoundError("Consultation not found.");
    }

    if (consultation.endedAt) {
      throw new ConflictError("This consultation has been completed and cannot be modified.");
    }

    if (user.role !== "ADMIN" && consultation.clinicianId !== user.id) {
      throw new ForbiddenError("Only the assigned clinician can update this consultation.");
    }

    const updated = await consultationRepository.update(id, {
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
    const consultation = await consultationRepository.findById(id);
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

    const completed = await consultationRepository.completeInTransaction(
      id,
      consultation.appointmentId,
      {
        diagnosis: input.diagnosis.trim(),
        treatmentPlan: input.treatmentPlan?.trim() || consultation.treatmentPlan,
        endedAt: new Date(),
      }
    );

    try {
      await prisma.auditLog.create({
        data: {
          actorId: user.id,
          action: "COMPLETE_CONSULTATION",
          entity: "Consultation",
          entityId: completed.id,
          metadata: {
            appointmentId: consultation.appointmentId,
            diagnosis: completed.diagnosis,
          },
        },
      });
    } catch (e) {
      console.warn("Audit log creation failed:", e);
    }

    return completed;
  }

  async resolveMeetingLink(appointment: {
    id: string;
    meetingUrl?: string | null;
  }): Promise<string> {
    return this.meetingProvider.resolveLink(appointment);
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
      consultationRepository.list({
        skip,
        take,
        patientId: targetPatientId,
        clinicianId: targetClinicianId,
      }),
      consultationRepository.count({
        patientId: targetPatientId,
        clinicianId: targetClinicianId,
      }),
    ]);

    return buildPaginatedResponse(items, total, page, pageSize);
  }
}

export const consultationService = new ConsultationService();
