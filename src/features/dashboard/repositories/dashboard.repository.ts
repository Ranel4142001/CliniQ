import { prisma } from "@/shared/lib/prisma";
import type { Prisma } from "@prisma/client";

export const dashboardRepository = {
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

  async countAppointmentsToday(todayStart: Date, todayEnd: Date, clinicianId?: string) {
    return prisma.appointment.count({
      where: {
        scheduledAt: { gte: todayStart, lte: todayEnd },
        ...(clinicianId ? { clinicianId } : {}),
      },
    });
  },

  async countPendingAppointments(clinicianId?: string) {
    return prisma.appointment.count({
      where: {
        status: "PENDING",
        ...(clinicianId ? { clinicianId } : {}),
      },
    });
  },

  async countTotalPatients() {
    return prisma.patient.count({ where: { isArchived: false } });
  },

  async getMedicinesWithBatches() {
    return prisma.medicine.findMany({
      where: { isArchived: false },
      include: { batches: true },
      orderBy: { name: "asc" },
    });
  },

  async countExpiringBatches(startDate: Date, endDate: Date) {
    return prisma.medicineBatch.count({
      where: {
        quantity: { gt: 0 },
        expiryDate: { gt: startDate, lte: endDate },
      },
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
};
