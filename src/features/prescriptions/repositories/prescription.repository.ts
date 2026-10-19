import { prisma } from "@/shared/lib/prisma";
import type { Prisma, PrescriptionStatus } from "@prisma/client";
import type { PrescriptionWithRelations } from "../types/prescription.types";
import type { PrescriptionItemInput } from "../schemas/prescription.schema";

const PRESCRIPTION_INCLUDE = {
  patient: true,
  clinician: {
    select: { id: true, fullName: true, email: true },
  },
  consultation: {
    select: {
      id: true,
      chiefComplaint: true,
      startedAt: true,
      endedAt: true,
      diagnosis: true,
      treatmentPlan: true,
    },
  },
  items: {
    include: {
      medicine: true,
    },
  },
  stockMovements: true,
} as const;

export const prescriptionRepository = {
  async findById(id: string): Promise<PrescriptionWithRelations | null> {
    return prisma.prescription.findUnique({
      where: { id },
      include: PRESCRIPTION_INCLUDE,
    }) as Promise<PrescriptionWithRelations | null>;
  },

  async findByConsultationId(consultationId: string): Promise<PrescriptionWithRelations | null> {
    return prisma.prescription.findUnique({
      where: { consultationId },
      include: PRESCRIPTION_INCLUDE,
    }) as Promise<PrescriptionWithRelations | null>;
  },

  async findAll(params: {
    patientId?: string;
    consultationId?: string;
    status?: PrescriptionStatus;
    search?: string;
    skip?: number;
    take?: number;
  }): Promise<PrescriptionWithRelations[]> {
    const where: Prisma.PrescriptionWhereInput = {
      ...(params.patientId ? { patientId: params.patientId } : {}),
      ...(params.consultationId ? { consultationId: params.consultationId } : {}),
      ...(params.status ? { status: params.status } : {}),
      ...(params.search
        ? {
            OR: [
              { prescriptionNo: { contains: params.search, mode: "insensitive" } },
              { patient: { firstName: { contains: params.search, mode: "insensitive" } } },
              { patient: { lastName: { contains: params.search, mode: "insensitive" } } },
              { patient: { patientNo: { contains: params.search, mode: "insensitive" } } },
            ],
          }
        : {}),
    };

    return prisma.prescription.findMany({
      where,
      skip: params.skip,
      take: params.take,
      include: PRESCRIPTION_INCLUDE,
      orderBy: { createdAt: "desc" },
    }) as Promise<PrescriptionWithRelations[]>;
  },

  async countAll(params: {
    patientId?: string;
    consultationId?: string;
    status?: PrescriptionStatus;
    search?: string;
  }): Promise<number> {
    const where: Prisma.PrescriptionWhereInput = {
      ...(params.patientId ? { patientId: params.patientId } : {}),
      ...(params.consultationId ? { consultationId: params.consultationId } : {}),
      ...(params.status ? { status: params.status } : {}),
      ...(params.search
        ? {
            OR: [
              { prescriptionNo: { contains: params.search, mode: "insensitive" } },
              { patient: { firstName: { contains: params.search, mode: "insensitive" } } },
              { patient: { lastName: { contains: params.search, mode: "insensitive" } } },
              { patient: { patientNo: { contains: params.search, mode: "insensitive" } } },
            ],
          }
        : {}),
    };
    return prisma.prescription.count({ where });
  },

  async create(data: {
    consultationId: string;
    patientId: string;
    clinicianId: string;
    notes?: string | null;
    items: PrescriptionItemInput[];
  }): Promise<PrescriptionWithRelations> {
    return prisma.prescription.create({
      data: {
        consultationId: data.consultationId,
        patientId: data.patientId,
        clinicianId: data.clinicianId,
        notes: data.notes,
        status: "DRAFT",
        items: {
          create: data.items.map((item) => ({
            medicineId: item.medicineId,
            dosage: item.dosage,
            frequency: item.frequency,
            durationDays: item.durationDays,
            quantity: item.quantity,
            instructions: item.instructions,
          })),
        },
      },
      include: PRESCRIPTION_INCLUDE,
    }) as Promise<PrescriptionWithRelations>;
  },

  async updateDraft(
    id: string,
    data: {
      notes?: string | null;
      items?: PrescriptionItemInput[];
    }
  ): Promise<PrescriptionWithRelations> {
    return prisma.$transaction(async (tx) => {
      if (data.items) {
        await tx.prescriptionItem.deleteMany({
          where: { prescriptionId: id },
        });
        await tx.prescriptionItem.createMany({
          data: data.items.map((item) => ({
            prescriptionId: id,
            medicineId: item.medicineId,
            dosage: item.dosage,
            frequency: item.frequency,
            durationDays: item.durationDays,
            quantity: item.quantity,
            instructions: item.instructions,
          })),
        });
      }

      return tx.prescription.update({
        where: { id },
        data: {
          ...(data.notes !== undefined ? { notes: data.notes } : {}),
        },
        include: PRESCRIPTION_INCLUDE,
      }) as Promise<PrescriptionWithRelations>;
    });
  },

  async markIssued(
    id: string,
    prescriptionNo: string,
    issuedAt: Date,
    client: Prisma.TransactionClient | typeof prisma = prisma
  ): Promise<PrescriptionWithRelations> {
    return client.prescription.update({
      where: { id },
      data: {
        prescriptionNo,
        issuedAt,
        status: "ISSUED",
      },
      include: PRESCRIPTION_INCLUDE,
    }) as Promise<PrescriptionWithRelations>;
  },

  async markDispensed(
    id: string,
    dispensedAt: Date,
    client: Prisma.TransactionClient | typeof prisma = prisma
  ): Promise<PrescriptionWithRelations> {
    return client.prescription.update({
      where: { id },
      data: {
        dispensedAt,
        status: "DISPENSED",
      },
      include: PRESCRIPTION_INCLUDE,
    }) as Promise<PrescriptionWithRelations>;
  },

  async markVoided(
    id: string,
    voidReason: string,
    client: Prisma.TransactionClient | typeof prisma = prisma
  ): Promise<PrescriptionWithRelations> {
    return client.prescription.update({
      where: { id },
      data: {
        voidReason,
        status: "VOIDED",
      },
      include: PRESCRIPTION_INCLUDE,
    }) as Promise<PrescriptionWithRelations>;
  },

  async countByStatus(patientId?: string) {
    const where = patientId ? { patientId } : {};
    const [total, draft, issued, dispensed, voided] = await Promise.all([
      prisma.prescription.count({ where }),
      prisma.prescription.count({ where: { ...where, status: "DRAFT" } }),
      prisma.prescription.count({ where: { ...where, status: "ISSUED" } }),
      prisma.prescription.count({ where: { ...where, status: "DISPENSED" } }),
      prisma.prescription.count({ where: { ...where, status: "VOIDED" } }),
    ]);
    return { total, draft, issued, dispensed, voided };
  },
};
