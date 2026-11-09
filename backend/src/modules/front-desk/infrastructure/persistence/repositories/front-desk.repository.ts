import { prisma } from "@backend/shared/infrastructure/persistence/prisma";
import type {
  FrontDeskRepositoryPort,
  FrontDeskThreadRecord,
} from "@backend/modules/front-desk/application/ports/outbound/front-desk-repository.port";
import type { Prisma } from "@prisma/client";

const PATIENT_SELECT = {
  id: true,
  profileId: true,
  patientNo: true,
  firstName: true,
  middleName: true,
  lastName: true,
} satisfies Prisma.PatientSelect;

const MESSAGE_SELECT = {
  id: true,
  body: true,
  createdAt: true,
  readAt: true,
  sender: { select: { id: true, fullName: true, role: true } },
} satisfies Prisma.FrontDeskMessageSelect;

export const frontDeskRepository = {
  async findPatient(patientId: string) {
    return prisma.patient.findUnique({ where: { id: patientId }, select: PATIENT_SELECT });
  },

  async findPatientByProfileId(profileId: string) {
    return prisma.patient.findUnique({ where: { profileId }, select: PATIENT_SELECT });
  },

  async listActivePatientIds(limit: number) {
    const latest = await prisma.frontDeskMessage.groupBy({
      by: ["patientId"],
      _max: { createdAt: true },
      orderBy: { _max: { createdAt: "desc" } },
      take: limit,
    });
    return latest.map((row) => row.patientId);
  },

  async summarizeThreads(patientIds: string[], unreadFromPatient: boolean): Promise<FrontDeskThreadRecord[]> {
    if (patientIds.length === 0) return [];
    const rows = await prisma.patient.findMany({
      where: { id: { in: patientIds } },
      select: {
        ...PATIENT_SELECT,
        frontDeskMessages: {
          select: { body: true, createdAt: true, isFromPatient: true },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        _count: {
          select: { frontDeskMessages: { where: { readAt: null, isFromPatient: unreadFromPatient } } },
        },
      },
    });
    const byId = new Map(rows.map((row) => [row.id, row]));
    return patientIds.flatMap((id) => {
      const row = byId.get(id);
      if (!row) return [];
      const { frontDeskMessages, _count, ...patient } = row;
      return [{ patient, lastMessage: frontDeskMessages[0] ?? null, unreadCount: _count.frontDeskMessages }];
    });
  },

  async listRecent(patientId: string, limit: number) {
    const newestFirst = await prisma.frontDeskMessage.findMany({
      where: { patientId },
      select: MESSAGE_SELECT,
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return newestFirst.reverse();
  },

  async create(data: { patientId: string; senderId: string; isFromPatient: boolean; body: string }) {
    return prisma.frontDeskMessage.create({ data, select: MESSAGE_SELECT });
  },

  async markRead(patientId: string, readerIsPatient: boolean) {
    const { count } = await prisma.frontDeskMessage.updateMany({
      where: { patientId, isFromPatient: !readerIsPatient, readAt: null },
      data: { readAt: new Date() },
    });
    return count;
  },
} satisfies FrontDeskRepositoryPort;
