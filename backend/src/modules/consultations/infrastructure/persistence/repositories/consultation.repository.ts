import { prisma } from "@backend/shared/infrastructure/persistence/prisma";
import type { ConsultationRepositoryPort } from "@backend/modules/consultations/application/ports/outbound/consultation-repository.port";
import type { Prisma } from "@prisma/client";
import type {
  ConsultationWithRelations,
  VitalsData,
} from "@backend/modules/consultations/application/dto/consultation.types";

export const consultationRepository = {
  async findById(id: string): Promise<ConsultationWithRelations | null> {
    return prisma.consultation.findUnique({
      where: { id },
      include: {
        appointment: true,
        patient: true,
        clinician: {
          select: { id: true, fullName: true, email: true, role: true },
        },
        prescription: true,
      },
    }) as Promise<ConsultationWithRelations | null>;
  },

  async findByAppointmentId(appointmentId: string): Promise<ConsultationWithRelations | null> {
    return prisma.consultation.findUnique({
      where: { appointmentId },
      include: {
        appointment: true,
        patient: true,
        clinician: {
          select: { id: true, fullName: true, email: true, role: true },
        },
        prescription: true,
      },
    }) as Promise<ConsultationWithRelations | null>;
  },

  async create(data: {
    appointmentId: string;
    patientId: string;
    clinicianId: string;
    chiefComplaint: string;
    vitals?: VitalsData | null;
    startedAt?: Date;
  }): Promise<ConsultationWithRelations> {
    return prisma.consultation.create({
      data: {
        appointmentId: data.appointmentId,
        patientId: data.patientId,
        clinicianId: data.clinicianId,
        chiefComplaint: data.chiefComplaint,
        vitals: (data.vitals as Prisma.InputJsonValue) ?? undefined,
        startedAt: data.startedAt ?? new Date(),
      },
      include: {
        appointment: true,
        patient: true,
        clinician: {
          select: { id: true, fullName: true, email: true, role: true },
        },
        prescription: true,
      },
    }) as Promise<ConsultationWithRelations>;
  },

  async update(
    id: string,
    data: {
      chiefComplaint?: string;
      vitals?: VitalsData | null;
      findings?: string | null;
      diagnosis?: string | null;
      treatmentPlan?: string | null;
    }
  ): Promise<ConsultationWithRelations> {
    return prisma.consultation.update({
      where: { id },
      data: {
        ...(data.chiefComplaint ? { chiefComplaint: data.chiefComplaint } : {}),
        ...(data.vitals !== undefined
          ? { vitals: (data.vitals as Prisma.InputJsonValue) ?? undefined }
          : {}),
        ...(data.findings !== undefined ? { findings: data.findings } : {}),
        ...(data.diagnosis !== undefined ? { diagnosis: data.diagnosis } : {}),
        ...(data.treatmentPlan !== undefined ? { treatmentPlan: data.treatmentPlan } : {}),
      },
      include: {
        appointment: true,
        patient: true,
        clinician: {
          select: { id: true, fullName: true, email: true, role: true },
        },
        prescription: true,
      },
    }) as Promise<ConsultationWithRelations>;
  },

  async completeInTransaction(
    id: string,
    appointmentId: string,
    data: {
      diagnosis: string;
      treatmentPlan?: string | null;
      endedAt: Date;
    }
  ): Promise<ConsultationWithRelations> {
    return prisma.$transaction(async (tx) => {
      // 1. Update Consultation with endedAt and diagnosis
      const updatedConsultation = await tx.consultation.update({
        where: { id },
        data: {
          diagnosis: data.diagnosis,
          treatmentPlan: data.treatmentPlan,
          endedAt: data.endedAt,
        },
        include: {
          appointment: true,
          patient: true,
          clinician: {
            select: { id: true, fullName: true, email: true, role: true },
          },
          prescription: true,
        },
      });

      // 2. Mark appointment COMPLETED in the same transaction
      await tx.appointment.update({
        where: { id: appointmentId },
        data: {
          status: "COMPLETED",
        },
      });

      return updatedConsultation as ConsultationWithRelations;
    });
  },

  async list(params: {
    skip?: number;
    take?: number;
    patientId?: string;
    clinicianId?: string;
  }): Promise<ConsultationWithRelations[]> {
    const where: Prisma.ConsultationWhereInput = {
      ...(params.patientId ? { patientId: params.patientId } : {}),
      ...(params.clinicianId ? { clinicianId: params.clinicianId } : {}),
    };

    return prisma.consultation.findMany({
      where,
      skip: params.skip,
      take: params.take,
      orderBy: { createdAt: "desc" },
      include: {
        appointment: true,
        patient: true,
        clinician: {
          select: { id: true, fullName: true, email: true, role: true },
        },
        prescription: true,
      },
    }) as Promise<ConsultationWithRelations[]>;
  },

  async count(params: { patientId?: string; clinicianId?: string }): Promise<number> {
    const where: Prisma.ConsultationWhereInput = {
      ...(params.patientId ? { patientId: params.patientId } : {}),
      ...(params.clinicianId ? { clinicianId: params.clinicianId } : {}),
    };
    return prisma.consultation.count({ where });
  },
} satisfies ConsultationRepositoryPort;
