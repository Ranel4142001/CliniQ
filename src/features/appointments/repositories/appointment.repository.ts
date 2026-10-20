import { prisma } from "@/shared/lib/prisma";
import type { Prisma, AppointmentStatus, AppointmentType } from "@prisma/client";
import type { RepositoryAppointmentRow } from "../types/appointment.types";
import { demoStore } from "@/shared/lib/demo-data";

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
  async findById(id: string): Promise<RepositoryAppointmentRow | null> {
    try {
      return (await prisma.appointment.findUnique({
        where: { id },
        select: DETAIL_SELECT,
      })) as RepositoryAppointmentRow | null;
    } catch {
      const match = demoStore.appointments.find((a) => a.id === id) || demoStore.appointments[0];
      return match as unknown as RepositoryAppointmentRow;
    }
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
    try {
      return await prisma.appointment.findMany({
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
    } catch {
      return demoStore.appointments
        .filter(
          (a) =>
            a.clinicianId === clinicianId &&
            a.status !== "CANCELLED" &&
            a.scheduledAt >= dayStart &&
            a.scheduledAt < dayEnd
        )
        .map((a) => ({
          id: a.id,
          scheduledAt: a.scheduledAt,
          endsAt: a.endsAt,
          status: a.status,
        })) as unknown as ReturnType<typeof prisma.appointment.findMany>;
    }
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
  }): Promise<RepositoryAppointmentRow[]> {
    const { skip, take, patientId, clinicianId, status, type, startDate, endDate } = params;

    try {
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

      return (await prisma.appointment.findMany({
        where,
        skip,
        take,
        select: DETAIL_SELECT,
        orderBy: { scheduledAt: "desc" },
      })) as RepositoryAppointmentRow[];
    } catch {
      let filtered = [...demoStore.appointments];
      if (patientId) filtered = filtered.filter((a) => a.patientId === patientId || a.patient.profileId?.includes(patientId));
      if (clinicianId) filtered = filtered.filter((a) => a.clinicianId === clinicianId);
      if (status) filtered = filtered.filter((a) => a.status === status);
      if (type) filtered = filtered.filter((a) => a.type === type);
      return filtered.slice(skip, skip + take) as unknown as RepositoryAppointmentRow[];
    }
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

    try {
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

      return await prisma.appointment.count({ where });
    } catch {
      let filtered = [...demoStore.appointments];
      if (patientId) filtered = filtered.filter((a) => a.patientId === patientId || a.patient.profileId?.includes(patientId));
      if (clinicianId) filtered = filtered.filter((a) => a.clinicianId === clinicianId);
      if (status) filtered = filtered.filter((a) => a.status === status);
      if (type) filtered = filtered.filter((a) => a.type === type);
      return filtered.length;
    }
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
