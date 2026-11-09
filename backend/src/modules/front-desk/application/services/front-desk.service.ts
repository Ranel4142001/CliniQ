import type { Role } from "@prisma/client";
import type {
  FrontDeskPatient,
  FrontDeskRepositoryPort,
  FrontDeskThreadRecord,
} from "@backend/modules/front-desk/application/ports/outbound/front-desk-repository.port";
import type { SendFrontDeskMessageInput } from "@backend/modules/front-desk/application/dto/front-desk.schema";
import type {
  FrontDeskChatDTO,
  FrontDeskMessageDTO,
  FrontDeskThreadDTO,
} from "@backend/modules/front-desk/application/dto/front-desk.types";
import { FRONT_DESK_CONFIG } from "@backend/modules/front-desk/domain/constants/front-desk.constants";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "@backend/shared/domain/errors/app-error";
import { formatFullName } from "@backend/shared/domain/person-name";
import { ROLES } from "@backend/shared/domain/roles";

type Viewer = { id: string; role: Role };

/** Admins and staff share the clinic side of every front-desk thread. */
function isDesk(role: Role): boolean {
  return role === ROLES.ADMIN || role === ROLES.STAFF;
}

function getPatientName(patient: FrontDeskPatient): string {
  return formatFullName(patient.firstName, patient.middleName, patient.lastName);
}

function toThread(record: FrontDeskThreadRecord, viewerIsPatient: boolean): FrontDeskThreadDTO {
  const { patient, lastMessage } = record;
  return {
    patientId: patient.id,
    patientName: getPatientName(patient),
    patientNo: patient.patientNo,
    lastMessage: lastMessage && {
      body: lastMessage.body,
      createdAt: lastMessage.createdAt,
      isMine: lastMessage.isFromPatient === viewerIsPatient,
    },
    unreadCount: record.unreadCount,
  };
}

export interface FrontDeskServiceDeps {
  frontDeskRepository: FrontDeskRepositoryPort;
}

export type FrontDeskService = ReturnType<typeof createFrontDeskService>;

export function createFrontDeskService({ frontDeskRepository }: FrontDeskServiceDeps) {
  /** Desk members may open any patient's thread; a patient only their own. Clinicians never. */
  async function getAuthorizedPatient(viewer: Viewer, patientId: string): Promise<FrontDeskPatient> {
    if (!isDesk(viewer.role) && viewer.role !== ROLES.PATIENT) {
      throw new ForbiddenError("Front-desk chats are for patients and clinic staff.");
    }
    const patient = await frontDeskRepository.findPatient(patientId);
    if (!patient) throw new NotFoundError("Patient not found.");
    if (viewer.role === ROLES.PATIENT && patient.profileId !== viewer.id) {
      throw new ForbiddenError("You can only open your own conversation with the clinic.");
    }
    return patient;
  }

  async function listOwnThread(viewer: Viewer): Promise<FrontDeskThreadDTO[]> {
    const patient = await frontDeskRepository.findPatientByProfileId(viewer.id);
    if (!patient) return [];
    const records = await frontDeskRepository.summarizeThreads([patient.id], false);
    return records.map((record) => toThread(record, true));
  }

  return {
    /** Patients: their one thread (even before any message). Desk: active threads, newest first. */
    async listThreads(viewer: Viewer): Promise<FrontDeskThreadDTO[]> {
      if (viewer.role === ROLES.PATIENT) return listOwnThread(viewer);
      if (!isDesk(viewer.role)) throw new ForbiddenError("Front-desk chats are for patients and clinic staff.");
      const ids = await frontDeskRepository.listActivePatientIds(FRONT_DESK_CONFIG.INBOX_LIMIT);
      const records = await frontDeskRepository.summarizeThreads(ids, true);
      return records.map((record) => toThread(record, false));
    },

    async getChat(viewer: Viewer, patientId: string): Promise<FrontDeskChatDTO> {
      const patient = await getAuthorizedPatient(viewer, patientId);
      const messages = await frontDeskRepository.listRecent(patient.id, FRONT_DESK_CONFIG.HISTORY_LIMIT);
      return {
        messages,
        canSend: patient.profileId !== null,
        patientName: getPatientName(patient),
        patientNo: patient.patientNo,
      };
    },

    async sendMessage(
      viewer: Viewer,
      patientId: string,
      input: SendFrontDeskMessageInput
    ): Promise<FrontDeskMessageDTO> {
      const patient = await getAuthorizedPatient(viewer, patientId);
      if (patient.profileId === null) {
        throw new ConflictError("This patient has no CliniQ account yet, so they can't receive messages.");
      }
      return frontDeskRepository.create({
        patientId: patient.id,
        senderId: viewer.id,
        isFromPatient: viewer.role === ROLES.PATIENT,
        body: input.body,
      });
    },

    async markAsRead(viewer: Viewer, patientId: string): Promise<{ updated: number }> {
      const patient = await getAuthorizedPatient(viewer, patientId);
      const updated = await frontDeskRepository.markRead(patient.id, viewer.role === ROLES.PATIENT);
      return { updated };
    },
  };
}
