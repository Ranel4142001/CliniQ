import { prisma } from "@/shared/lib/prisma";
import type { Prisma, PrescriptionStatus } from "@prisma/client";
import type { PrescriptionWithRelations } from "../types/prescription.types";
import type { PrescriptionItemInput } from "../schemas/prescription.schema";
import { demoStore } from "@/shared/lib/demo-data";

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
    try {
      return (await prisma.prescription.findUnique({
        where: { id },
        include: PRESCRIPTION_INCLUDE,
      })) as PrescriptionWithRelations | null;
    } catch {
      return (demoStore.prescriptions.find((p) => p.id === id) || demoStore.prescriptions[0]) as unknown as PrescriptionWithRelations;
    }
  },

  async findByConsultationId(consultationId: string): Promise<PrescriptionWithRelations | null> {
    try {
      return (await prisma.prescription.findUnique({
        where: { consultationId },
        include: PRESCRIPTION_INCLUDE,
      })) as PrescriptionWithRelations | null;
    } catch {
      return (demoStore.prescriptions.find((p) => p.consultationId === consultationId) || null) as unknown as PrescriptionWithRelations | null;
    }
  },

  async findAll(params: {
    patientId?: string;
    consultationId?: string;
    status?: PrescriptionStatus;
    search?: string;
    skip?: number;
    take?: number;
  }): Promise<PrescriptionWithRelations[]> {
    try {
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

      return (await prisma.prescription.findMany({
        where,
        skip: params.skip,
        take: params.take,
        include: PRESCRIPTION_INCLUDE,
        orderBy: { createdAt: "desc" },
      })) as PrescriptionWithRelations[];
    } catch {
      let filtered = [...demoStore.prescriptions];
      const pid = params.patientId;
      if (pid) filtered = filtered.filter((p) => p.patientId === pid || (p.patient.profileId ? p.patient.profileId.includes(pid) : false));
      if (params.status) filtered = filtered.filter((p) => p.status === params.status);
      const skip = params.skip || 0;
      const take = params.take || 10;
      return filtered.slice(skip, skip + take) as unknown as PrescriptionWithRelations[];
    }
  },

  async countAll(params: {
    patientId?: string;
    consultationId?: string;
    status?: PrescriptionStatus;
    search?: string;
  }): Promise<number> {
    try {
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
      return await prisma.prescription.count({ where });
    } catch {
      let filtered = [...demoStore.prescriptions];
      if (params.patientId) filtered = filtered.filter((p) => p.patientId === params.patientId);
      if (params.status) filtered = filtered.filter((p) => p.status === params.status);
      return filtered.length;
    }
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
    try {
      const where = patientId ? { patientId } : {};
      const [total, draft, issued, dispensed, voided] = await Promise.all([
        prisma.prescription.count({ where }),
        prisma.prescription.count({ where: { ...where, status: "DRAFT" } }),
        prisma.prescription.count({ where: { ...where, status: "ISSUED" } }),
        prisma.prescription.count({ where: { ...where, status: "DISPENSED" } }),
        prisma.prescription.count({ where: { ...where, status: "VOIDED" } }),
      ]);
      return { total, draft, issued, dispensed, voided };
    } catch {
      const list = demoStore.prescriptions.filter((p) => (patientId ? p.patientId === patientId : true));
      return {
        total: list.length,
        draft: list.filter((p) => p.status === "DRAFT").length,
        issued: list.filter((p) => p.status === "ISSUED").length,
        dispensed: list.filter((p) => p.status === "DISPENSED").length,
        voided: list.filter((p) => p.status === "VOIDED").length,
      };
    }
  },
};
