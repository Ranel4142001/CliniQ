import { prisma } from "@backend/shared/infrastructure/persistence/prisma";
import type { ConsultationMessageRepositoryPort } from "@backend/modules/consultations/application/ports/outbound/consultation-message-repository.port";
import type { Prisma } from "@prisma/client";

const MESSAGE_SELECT = {
  id: true,
  body: true,
  createdAt: true,
  readAt: true,
  sender: { select: { id: true, fullName: true, role: true } },
} satisfies Prisma.ConsultationMessageSelect;

export const consultationMessageRepository = {
  /** Minimal appointment data needed to authorize chat access. */
  async findChatContext(appointmentId: string) {
    return prisma.appointment.findUnique({
      where: { id: appointmentId },
      select: {
        id: true,
        type: true,
        status: true,
        clinicianId: true,
        patient: { select: { profileId: true } },
      },
    });
  },

  /** Most recent messages, returned oldest-first for display. */
  async listRecent(appointmentId: string, limit: number) {
    const newestFirst = await prisma.consultationMessage.findMany({
      where: { appointmentId },
      select: MESSAGE_SELECT,
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return newestFirst.reverse();
  },

  async create(data: { appointmentId: string; senderId: string; body: string }) {
    return prisma.consultationMessage.create({ data, select: MESSAGE_SELECT });
  },

  async markReadFor(appointmentId: string, readerId: string) {
    const { count } = await prisma.consultationMessage.updateMany({
      where: { appointmentId, senderId: { not: readerId }, readAt: null },
      data: { readAt: new Date() },
    });
    return count;
  },
} satisfies ConsultationMessageRepositoryPort;
