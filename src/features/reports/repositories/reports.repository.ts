import { prisma } from "@/shared/lib/prisma";
import type { Prisma, AppointmentStatus, PrescriptionStatus } from "@prisma/client";
import { demoStore } from "@/shared/lib/demo-data";

export const reportsRepository = {
  async getAppointments(from?: Date, to?: Date, status?: string) {
    try {
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

      return await prisma.appointment.findMany({
        where,
        include: {
          patient: { select: { id: true, patientNo: true, firstName: true, lastName: true } },
          clinician: { select: { id: true, fullName: true, email: true } },
        },
        orderBy: { scheduledAt: "desc" },
      });
    } catch {
      let list = [...demoStore.appointments];
      if (status) list = list.filter((a) => a.status === status);
      return list.map((a) => ({
        id: a.id,
        scheduledAt: a.scheduledAt,
        type: a.type,
        status: a.status,
        reason: a.reason,
        patient: { id: a.patient.id, patientNo: a.patient.patientNo, firstName: a.patient.firstName, lastName: a.patient.lastName },
        clinician: a.clinician,
      }));
    }
  },

  async getConsultations(from?: Date, to?: Date) {
    try {
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

      return await prisma.consultation.findMany({
        where,
        include: {
          patient: { select: { id: true, patientNo: true, firstName: true, lastName: true } },
          clinician: { select: { id: true, fullName: true, email: true } },
        },
        orderBy: { startedAt: "desc" },
      });
    } catch {
      return [
        {
          id: "demo-cons-1",
          startedAt: new Date(),
          endedAt: new Date(),
          chiefComplaint: "Routine hypertension follow up",
          diagnosis: "Controlled Essential Hypertension",
          patient: { id: demoStore.patients[0].id, patientNo: demoStore.patients[0].patientNo, firstName: demoStore.patients[0].firstName, lastName: demoStore.patients[0].lastName },
          clinician: { id: "demo-doc-1", fullName: "Dr. Alberto Cruz", email: "dr.cruz@cliniq.local" },
        },
      ];
    }
  },

  async getInventory() {
    try {
      return await prisma.medicine.findMany({
        where: { isArchived: false },
        include: { batches: true },
        orderBy: { name: "asc" },
      });
    } catch {
      return demoStore.medicines.filter((m) => !m.isArchived);
    }
  },

  async getMovements(from?: Date, to?: Date) {
    try {
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

      return await prisma.stockMovement.findMany({
        where,
        include: {
          medicine: { select: { name: true, strength: true } },
          batch: { select: { batchNo: true } },
          performedBy: { select: { fullName: true } },
        },
        orderBy: { createdAt: "desc" },
      });
    } catch {
      return [
        {
          id: "demo-mov-1",
          createdAt: new Date(),
          type: "STOCK_IN" as const,
          quantity: 500,
          reason: "Initial Clinic Supply Intake",
          medicine: { name: "Amoxicillin", strength: "500mg" },
          batch: { batchNo: "B26-AMX01" },
          performedBy: { fullName: "System Administrator" },
        },
      ];
    }
  },

  async getPrescriptions(from?: Date, to?: Date, status?: string) {
    try {
      const where: Prisma.PrescriptionWhereInput = {
        ...(from || to
          ? {
              issuedAt: {
                ...(from ? { gte: from } : {}),
                ...(to ? { lte: to } : {}),
              },
            }
          : {}),
        ...(status ? { status: status as PrescriptionStatus } : {}),
      };

      return await prisma.prescription.findMany({
        where,
        include: {
          patient: { select: { id: true, patientNo: true, firstName: true, lastName: true } },
          clinician: { select: { id: true, fullName: true, email: true } },
          items: true,
        },
        orderBy: { createdAt: "desc" },
      });
    } catch {
      return demoStore.prescriptions.map((p) => ({
        id: p.id,
        prescriptionNo: p.prescriptionNo,
        status: p.status,
        issuedAt: p.issuedAt,
        dispensedAt: p.dispensedAt,
        patient: { id: p.patient.id, patientNo: p.patient.patientNo, firstName: p.patient.firstName, lastName: p.patient.lastName },
        clinician: p.clinician,
        items: p.items,
      }));
    }
  },
};
