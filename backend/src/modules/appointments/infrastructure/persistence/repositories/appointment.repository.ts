import { prisma } from "@backend/shared/infrastructure/persistence/prisma";
import type { Prisma } from "@prisma/client";
import { dbClient } from "@backend/shared/infrastructure/persistence/prisma-transaction";
import type { TransactionContext } from "@backend/shared/application/ports/transaction.port";
import type {
  AppointmentChanges,
  AppointmentFilter,
  AppointmentRepositoryPort,
  NewAppointment,
} from "@backend/modules/appointments/application/ports/outbound/appointment-repository.port";

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

function buildWhere({
  patientId,
  clinicianId,
  status,
  type,
  startDate,
  endDate,
}: AppointmentFilter): Prisma.AppointmentWhereInput {
  return {
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
}

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
    tx?: TransactionContext
  ) {
    const client = dbClient(tx);
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

  async findByClinicianAndDate(clinicianId: string, dayStart: Date, dayEnd: Date) {
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

  async list({ skip, take, ...filter }: AppointmentFilter & { skip: number; take: number }) {
    return prisma.appointment.findMany({
      where: buildWhere(filter),
      skip,
      take,
      select: DETAIL_SELECT,
      orderBy: { scheduledAt: "desc" },
    });
  },

  async count(filter: AppointmentFilter) {
    return prisma.appointment.count({ where: buildWhere(filter) });
  },

  async create(data: NewAppointment, tx?: TransactionContext) {
    const client = dbClient(tx);
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

  async update(id: string, data: AppointmentChanges, tx?: TransactionContext) {
    const client = dbClient(tx);
    return client.appointment.update({
      where: { id },
      data,
      select: DETAIL_SELECT,
    });
  },
} satisfies AppointmentRepositoryPort;
