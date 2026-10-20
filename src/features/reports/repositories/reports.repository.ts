import { prisma } from "@/shared/lib/prisma";
import type { Prisma, AppointmentStatus, PrescriptionStatus } from "@prisma/client";

export const reportsRepository = {
  async getAppointments(from?: Date, to?: Date, status?: string) {
    const where: Prisma.AppointmentWhereInput = {
      ...(from || to
        ? {
            scheduledAt: {
              ...(from ? { gte: from } : {}),
              ...(to ? { lte: to } : {}),
            },
          }
        : {}),
      ...(status ? { status: status as AppointmentStatus } : {}),
    };

    return prisma.appointment.findMany({
      where,
      include: {
        patient: { select: { id: true, patientNo: true, firstName: true, lastName: true } },
        clinician: { select: { id: true, fullName: true, email: true } },
      },
      orderBy: { scheduledAt: "desc" },
    });
  },

  async getConsultations(from?: Date, to?: Date) {
    const where: Prisma.ConsultationWhereInput = {
      endedAt: { not: null },
      ...(from || to
        ? {
            startedAt: {
              ...(from ? { gte: from } : {}),
              ...(to ? { lte: to } : {}),
            },
          }
        : {}),
    };

    return prisma.consultation.findMany({
      where,
      include: {
        patient: { select: { id: true, patientNo: true, firstName: true, lastName: true } },
        clinician: { select: { id: true, fullName: true, email: true } },
      },
      orderBy: { startedAt: "desc" },
    });
  },

  async getInventory() {
    return prisma.medicine.findMany({
      where: { isArchived: false },
      include: { batches: true },
      orderBy: { name: "asc" },
    });
  },

  async getMovements(from?: Date, to?: Date) {
    const where: Prisma.StockMovementWhereInput = {
      ...(from || to
        ? {
            createdAt: {
              ...(from ? { gte: from } : {}),
              ...(to ? { lte: to } : {}),
            },
          }
        : {}),
    };

    return prisma.stockMovement.findMany({
      where,
      include: {
        medicine: { select: { id: true, name: true, strength: true, dosageForm: true } },
        batch: { select: { id: true, batchNo: true } },
        performedBy: { select: { id: true, fullName: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async getPrescriptions(from?: Date, to?: Date, status?: string) {
    const where: Prisma.PrescriptionWhereInput = {
      ...(status
        ? { status: status as PrescriptionStatus }
        : { status: { in: ["ISSUED", "DISPENSED"] } }),
      ...(from || to
        ? {
            createdAt: {
              ...(from ? { gte: from } : {}),
              ...(to ? { lte: to } : {}),
            },
          }
        : {}),
    };

    return prisma.prescription.findMany({
      where,
      include: {
        patient: { select: { id: true, patientNo: true, firstName: true, lastName: true } },
        clinician: { select: { id: true, fullName: true, email: true } },
        items: true,
      },
      orderBy: { createdAt: "desc" },
    });
  },
};
