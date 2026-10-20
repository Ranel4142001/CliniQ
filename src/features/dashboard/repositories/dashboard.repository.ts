import { prisma } from "@/shared/lib/prisma";
import type { Prisma } from "@prisma/client";
import { demoStore } from "@/shared/lib/demo-data";

export const dashboardRepository = {
  async getTodayAppointments(todayStart: Date, todayEnd: Date, clinicianId?: string) {
    try {
      const where: Prisma.AppointmentWhereInput = {
        scheduledAt: { gte: todayStart, lte: todayEnd },
        ...(clinicianId ? { clinicianId } : {}),
      };
      return await prisma.appointment.findMany({
        where,
        include: {
          patient: { select: { id: true, patientNo: true, firstName: true, lastName: true } },
          clinician: { select: { id: true, fullName: true, email: true } },
        },
        orderBy: { scheduledAt: "asc" },
        take: 20,
      });
    } catch {
      return demoStore.appointments
        .filter((a) => (clinicianId ? a.clinicianId === clinicianId : true))
        .slice(0, 5)
        .map((a) => ({
          id: a.id,
          patientId: a.patientId,
          clinicianId: a.clinicianId,
          scheduledAt: a.scheduledAt,
          endsAt: a.endsAt,
          type: a.type,
          status: a.status,
          reason: a.reason,
          meetingUrl: a.meetingUrl,
          cancelReason: a.cancelReason,
          createdAt: a.createdAt,
          updatedAt: a.updatedAt,
          patient: a.patient,
          clinician: a.clinician,
        }));
    }
  },

  async getPendingAppointments(clinicianId?: string) {
    try {
      const where: Prisma.AppointmentWhereInput = {
        status: "PENDING",
        ...(clinicianId ? { clinicianId } : {}),
      };
      return await prisma.appointment.findMany({
        where,
        include: {
          patient: { select: { id: true, patientNo: true, firstName: true, lastName: true } },
          clinician: { select: { id: true, fullName: true, email: true } },
        },
        orderBy: { scheduledAt: "asc" },
        take: 10,
      });
    } catch {
      return demoStore.appointments
        .filter((a) => a.status === "PENDING" && (clinicianId ? a.clinicianId === clinicianId : true))
        .map((a) => ({
          id: a.id,
          patientId: a.patientId,
          clinicianId: a.clinicianId,
          scheduledAt: a.scheduledAt,
          endsAt: a.endsAt,
          type: a.type,
          status: a.status,
          reason: a.reason,
          meetingUrl: a.meetingUrl,
          cancelReason: a.cancelReason,
          createdAt: a.createdAt,
          updatedAt: a.updatedAt,
          patient: a.patient,
          clinician: a.clinician,
        }));
    }
  },

  async countAppointmentsToday(todayStart: Date, todayEnd: Date, clinicianId?: string) {
    try {
      return await prisma.appointment.count({
        where: {
          scheduledAt: { gte: todayStart, lte: todayEnd },
          ...(clinicianId ? { clinicianId } : {}),
        },
      });
    } catch {
      return demoStore.appointments.filter((a) => (clinicianId ? a.clinicianId === clinicianId : true)).length;
    }
  },

  async countPendingAppointments(clinicianId?: string) {
    try {
      return await prisma.appointment.count({
        where: {
          status: "PENDING",
          ...(clinicianId ? { clinicianId } : {}),
        },
      });
    } catch {
      return demoStore.appointments.filter((a) => a.status === "PENDING").length;
    }
  },

  async countTotalPatients() {
    try {
      return await prisma.patient.count({ where: { isArchived: false } });
    } catch {
      return demoStore.patients.length;
    }
  },

  async getMedicinesWithBatches() {
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

  async countExpiringBatches(startDate: Date, endDate: Date) {
    try {
      return await prisma.medicineBatch.count({
        where: {
          quantity: { gt: 0 },
          expiryDate: { gt: startDate, lte: endDate },
        },
      });
    } catch {
      return demoStore.medicines.flatMap((m) => m.batches).filter((b) => b.expiryDate > startDate && b.expiryDate <= endDate).length;
    }
  },

  async getPatientByProfileId(profileId: string) {
    try {
      return await prisma.patient.findFirst({
        where: { profileId, isArchived: false },
      });
    } catch {
      return demoStore.patients[0];
    }
  },

  async getPatientUpcomingAppointments(patientId: string, fromDate: Date) {
    try {
      return await prisma.appointment.findMany({
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
    } catch {
      return demoStore.appointments
        .filter((a) => a.status === "CONFIRMED" || a.status === "PENDING")
        .slice(0, 3)
        .map((a) => ({
          id: a.id,
          scheduledAt: a.scheduledAt,
          type: a.type,
          status: a.status,
          reason: a.reason,
          meetingUrl: a.meetingUrl,
          clinician: a.clinician,
        }));
    }
  },

  async countPatientUpcomingAppointments(patientId: string, fromDate: Date) {
    try {
      return await prisma.appointment.count({
        where: {
          patientId,
          scheduledAt: { gte: fromDate },
          status: { in: ["PENDING", "CONFIRMED"] },
        },
      });
    } catch {
      return 1;
    }
  },

  async countPatientConsultations(patientId: string) {
    try {
      return await prisma.consultation.count({
        where: { patientId },
      });
    } catch {
      return 2;
    }
  },

  async getPatientPrescriptions(patientId: string) {
    try {
      return await prisma.prescription.findMany({
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
    } catch {
      return demoStore.prescriptions.map((p) => ({
        id: p.id,
        prescriptionNo: p.prescriptionNo,
        status: p.status,
        issuedAt: p.issuedAt,
        createdAt: p.createdAt,
        items: p.items,
        clinician: { fullName: p.clinician.fullName },
      }));
    }
  },

  async countPatientActivePrescriptions(patientId: string) {
    try {
      return await prisma.prescription.count({
        where: {
          patientId,
          status: "ISSUED",
        },
      });
    } catch {
      return 1;
    }
  },
};
