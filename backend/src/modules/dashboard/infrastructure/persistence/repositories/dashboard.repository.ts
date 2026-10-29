import { prisma } from "@backend/shared/infrastructure/persistence/prisma";
import type { DashboardQueryPort } from "@backend/modules/dashboard/application/ports/outbound/dashboard-query.port";
import type { Prisma } from "@prisma/client";

export const dashboardRepository = {
  async getStaffCounts({ todayStart, todayEnd, expiringUntil, clinicianId }) {
    const clinician = clinicianId ?? null;
    const [row] = await prisma.$queryRaw<
      { today: bigint; pending: bigint; patients: bigint; expiring: bigint }[]
    >`
      SELECT
        (SELECT count(*) FROM "Appointment"
          WHERE "scheduledAt" BETWEEN ${todayStart} AND ${todayEnd}
            AND (${clinician}::text IS NULL OR "clinicianId" = ${clinician})) AS today,
        (SELECT count(*) FROM "Appointment"
          WHERE status = 'PENDING'::"AppointmentStatus"
            AND (${clinician}::text IS NULL OR "clinicianId" = ${clinician})) AS pending,
        (SELECT count(*) FROM "Patient" WHERE "isArchived" = false) AS patients,
        (SELECT count(*) FROM "MedicineBatch"
          WHERE quantity > 0 AND "expiryDate" > ${todayStart} AND "expiryDate" <= ${expiringUntil}) AS expiring
    `;
    return {
      todayAppointments: Number(row.today),
      pendingAppointments: Number(row.pending),
      activePatients: Number(row.patients),
      expiringBatches: Number(row.expiring),
    };
  },

  async getTodayAppointments(todayStart: Date, todayEnd: Date, clinicianId?: string) {
    const where: Prisma.AppointmentWhereInput = {
      scheduledAt: { gte: todayStart, lte: todayEnd },
      ...(clinicianId ? { clinicianId } : {}),
    };
    return prisma.appointment.findMany({
      where,
      include: {
        patient: { select: { id: true, patientNo: true, firstName: true, lastName: true } },
        clinician: { select: { id: true, fullName: true, email: true } },
      },
      orderBy: { scheduledAt: "asc" },
      take: 20,
    });
  },

  async getPendingAppointments(clinicianId?: string) {
    const where: Prisma.AppointmentWhereInput = {
      status: "PENDING",
      ...(clinicianId ? { clinicianId } : {}),
    };
    return prisma.appointment.findMany({
      where,
      include: {
        patient: { select: { id: true, patientNo: true, firstName: true, lastName: true } },
        clinician: { select: { id: true, fullName: true, email: true } },
      },
      orderBy: { scheduledAt: "asc" },
      take: 10,
    });
  },

  async getMedicinesWithBatches() {
    return prisma.medicine.findMany({
      where: { isArchived: false },
      include: { batches: true },
      orderBy: { name: "asc" },
    });
  },

  async getPatientByProfileId(profileId: string) {
    return prisma.patient.findFirst({
      where: { profileId, isArchived: false },
    });
  },

  async getPatientUpcomingAppointments(patientId: string, fromDate: Date) {
    return prisma.appointment.findMany({
      where: {
        patientId,
        scheduledAt: { gte: fromDate },
        status: { in: ["PENDING", "CONFIRMED"] },
      },
      include: {
        clinician: { select: { id: true, fullName: true, email: true } },
      },
      orderBy: { scheduledAt: "asc" },
      take: 5,
    });
  },

  async countPatientUpcomingAppointments(patientId: string, fromDate: Date) {
    return prisma.appointment.count({
      where: {
        patientId,
        scheduledAt: { gte: fromDate },
        status: { in: ["PENDING", "CONFIRMED"] },
      },
    });
  },

  async countPatientConsultations(patientId: string) {
    return prisma.consultation.count({
      where: { patientId },
    });
  },

  async getPatientPrescriptions(patientId: string) {
    return prisma.prescription.findMany({
      where: {
        patientId,
        status: { in: ["ISSUED", "DISPENSED"] },
      },
      include: {
        clinician: { select: { fullName: true } },
        items: true,
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });
  },

  async countPatientActivePrescriptions(patientId: string) {
    return prisma.prescription.count({
      where: {
        patientId,
        status: "ISSUED",
      },
    });
  },
} satisfies DashboardQueryPort;
