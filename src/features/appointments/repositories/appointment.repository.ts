import { prisma } from "@/shared/lib/prisma";
import type { Prisma, AppointmentStatus, AppointmentType } from "@prisma/client";

const DETAIL_SELECT = {
  id: true,
  patientId: true,
  clinicianId: true,
  scheduledAt: true,
  endsAt: true,
  type: true,
  status: true,
  reason: true,
  meetingUrl: true,
  cancelReason: true,
  createdAt: true,
  updatedAt: true,
  patient: {
    select: {
      id: true,
      patientNo: true,
      firstName: true,
      middleName: true,
      lastName: true,
      contactNumber: true,
      profileId: true,
    },
  },
  clinician: {
    select: {
      id: true,
      fullName: true,
      email: true,
    },
  },
  consultation: {
    select: {
      id: true,
    },
  },
} as const;

export const appointmentRepository = {
  async findById(id: string) {
    return prisma.appointment.findUnique({
      where: { id },
      select: DETAIL_SELECT,
    });
  },

  async findOverlapping(
    clinicianId: string,
    patientId: string,
    start: Date,
    end: Date,
    excludeAppointmentId?: string,
    tx?: Prisma.TransactionClient
  ) {
    const client = tx ?? prisma;
    return client.appointment.findMany({
      where: {
        AND: [
          excludeAppointmentId ? { id: { not: excludeAppointmentId } } : {},
          { status: { not: "CANCELLED" } },
          {
            OR: [{ clinicianId }, { patientId }],
          },
          // Interval overlap: scheduledAt < end AND endsAt > start
          { scheduledAt: { lt: end } },
          { endsAt: { gt: start } },
        ],
      },
      select: {
        id: true,
        clinicianId: true,
        patientId: true,
        scheduledAt: true,
        endsAt: true,
        status: true,
      },
    });
  },

  async findByClinicianAndDate(
    clinicianId: string,
    dayStart: Date,
    dayEnd: Date
  ) {
    return prisma.appointment.findMany({
      where: {
        clinicianId,
        status: { not: "CANCELLED" },
        scheduledAt: { gte: dayStart, lt: dayEnd },
      },
      select: {
        id: true,
        scheduledAt: true,
        endsAt: true,
        status: true,
      },
      orderBy: { scheduledAt: "asc" },
    });
  },

  async list(params: {
    skip: number;
    take: number;
    patientId?: string;
    clinicianId?: string;
    status?: AppointmentStatus;
    type?: AppointmentType;
    startDate?: Date;
    endDate?: Date;
  }) {
    const { skip, take, patientId, clinicianId, status, type, startDate, endDate } = params;

    const where: Prisma.AppointmentWhereInput = {
      ...(patientId ? { patientId } : {}),
      ...(clinicianId ? { clinicianId } : {}),
      ...(status ? { status } : {}),
      ...(type ? { type } : {}),
      ...(startDate || endDate
        ? {
            scheduledAt: {
              ...(startDate ? { gte: startDate } : {}),
              ...(endDate ? { lte: endDate } : {}),
            },
          }
        : {}),
    };

    return prisma.appointment.findMany({
      where,
      skip,
      take,
      select: DETAIL_SELECT,
      orderBy: { scheduledAt: "desc" },
    });
  },

  async count(params: {
    patientId?: string;
    clinicianId?: string;
    status?: AppointmentStatus;
    type?: AppointmentType;
    startDate?: Date;
    endDate?: Date;
  }) {
    const { patientId, clinicianId, status, type, startDate, endDate } = params;

    const where: Prisma.AppointmentWhereInput = {
      ...(patientId ? { patientId } : {}),
      ...(clinicianId ? { clinicianId } : {}),
      ...(status ? { status } : {}),
      ...(type ? { type } : {}),
      ...(startDate || endDate
        ? {
            scheduledAt: {
              ...(startDate ? { gte: startDate } : {}),
              ...(endDate ? { lte: endDate } : {}),
            },
          }
        : {}),
    };

    return prisma.appointment.count({ where });
  },

  async create(
    data: {
      patientId: string;
      clinicianId: string;
      scheduledAt: Date;
      endsAt: Date;
      type: AppointmentType;
      reason: string;
      meetingUrl?: string | null;
    },
    tx?: Prisma.TransactionClient
  ) {
    const client = tx ?? prisma;
    return client.appointment.create({
      data: {
        patientId: data.patientId,
        clinicianId: data.clinicianId,
        scheduledAt: data.scheduledAt,
        endsAt: data.endsAt,
        type: data.type,
        reason: data.reason,
        meetingUrl: data.meetingUrl ?? null,
        status: "PENDING",
      },
      select: DETAIL_SELECT,
    });
  },

  async update(
    id: string,
    data: {
      scheduledAt?: Date;
      endsAt?: Date;
      meetingUrl?: string | null;
      status?: AppointmentStatus;
      cancelReason?: string | null;
    },
    tx?: Prisma.TransactionClient
  ) {
    const client = tx ?? prisma;
    return client.appointment.update({
      where: { id },
      data,
      select: DETAIL_SELECT,
    });
  },
};
