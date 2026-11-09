import { prisma } from "@backend/shared/infrastructure/persistence/prisma";
import type {
  ConsultationMessageRepositoryPort,
  ConversationRecord,
} from "@backend/modules/consultations/application/ports/outbound/consultation-message-repository.port";
import type { Prisma } from "@prisma/client";

const MESSAGE_SELECT = {
  id: true,
  body: true,
  createdAt: true,
  readAt: true,
  sender: { select: { id: true, fullName: true, role: true } },
} satisfies Prisma.ConsultationMessageSelect;

/** Cancelled or missed visits only stay in the inbox if something was said in them. */
const CLOSED_STATUSES = ["CANCELLED", "NO_SHOW"] as const;

export const consultationMessageRepository = {
  async listConversations(userId: string, limit: number): Promise<ConversationRecord[]> {
    const rows = await prisma.appointment.findMany({
      where: {
        type: "ONLINE",
        OR: [{ clinicianId: userId }, { patient: { profileId: userId } }],
        NOT: { status: { in: [...CLOSED_STATUSES] }, messages: { none: {} } },
      },
      select: {
        id: true,
        scheduledAt: true,
        status: true,
        clinicianId: true,
        clinician: { select: { fullName: true } },
        patient: { select: { firstName: true, middleName: true, lastName: true } },
        messages: {
          select: { body: true, createdAt: true, senderId: true },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        _count: {
          select: { messages: { where: { readAt: null, senderId: { not: userId } } } },
        },
      },
      orderBy: { scheduledAt: "desc" },
      take: limit,
    });
    return rows.map((row) => ({
      appointmentId: row.id,
      scheduledAt: row.scheduledAt,
      status: row.status,
      clinicianId: row.clinicianId,
      clinicianName: row.clinician.fullName,
      patient: row.patient,
      lastMessage: row.messages[0] ?? null,
      unreadCount: row._count.messages,
    }));
  },

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

  async findPresence(appointmentId: string, userId: string) {
    return prisma.consultationChatPresence.findUnique({
      where: { appointmentId_userId: { appointmentId, userId } },
      select: { lastSeenAt: true, typingAt: true },
    });
  },

  async savePresence(
    appointmentId: string,
    userId: string,
    data: { lastSeenAt: Date; typingAt?: Date }
  ) {
    await prisma.consultationChatPresence.upsert({
      where: { appointmentId_userId: { appointmentId, userId } },
      create: { appointmentId, userId, ...data },
      update: data,
    });
  },
} satisfies ConsultationMessageRepositoryPort;
