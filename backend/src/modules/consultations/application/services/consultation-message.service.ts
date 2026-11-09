import type {
  ChatContext,
  ConsultationMessageRepositoryPort,
  ConversationRecord,
} from "@backend/modules/consultations/application/ports/outbound/consultation-message-repository.port";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "@backend/shared/domain/errors/app-error";
import { formatFullName } from "@backend/shared/domain/person-name";
import { CHAT_CONFIG } from "@backend/modules/consultations/domain/constants/consultation.constants";
import { getCounterpartStatus } from "@backend/modules/consultations/domain/services/chat-presence";
import type { SendMessageInput } from "@backend/modules/consultations/application/dto/consultation-message.schema";
import type {
  ChatConversationDTO,
  ConsultationChatDTO,
  ConsultationMessageDTO,
} from "@backend/modules/consultations/application/dto/consultation-message.types";

/**
 * Only the two participants may access a chat. Admins and staff are deliberately
 * excluded: these are private clinical conversations (least privilege).
 */
function isParticipant(context: ChatContext, userId: string): boolean {
  return context.clinicianId === userId || context.patient.profileId === userId;
}

function canSendIn(context: Pick<ChatContext, "status">): boolean {
  return context.status === "CONFIRMED";
}

function toConversation(row: ConversationRecord, userId: string): ChatConversationDTO {
  const { patient, lastMessage } = row;
  return {
    appointmentId: row.appointmentId,
    counterpartName:
      row.clinicianId === userId
        ? formatFullName(patient.firstName, patient.middleName, patient.lastName)
        : row.clinicianName,
    scheduledAt: row.scheduledAt,
    status: row.status,
    canSend: canSendIn(row),
    lastMessage: lastMessage && {
      body: lastMessage.body,
      createdAt: lastMessage.createdAt,
      isMine: lastMessage.senderId === userId,
    },
    unreadCount: row.unreadCount,
  };
}

/** Like Messenger: most recent message first; chats with no messages yet follow, newest visit first. */
function byLatestActivity(a: ChatConversationDTO, b: ChatConversationDTO): number {
  const aAt = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : null;
  const bAt = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : null;
  if (aAt !== null && bAt !== null) return bAt - aAt;
  if (aAt !== null || bAt !== null) return aAt !== null ? -1 : 1;
  return new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime();
}

function getCounterpartId(context: ChatContext, userId: string): string | null {
  return context.clinicianId === userId ? context.patient.profileId : context.clinicianId;
}

function getLastMessageAt(messages: ConsultationMessageDTO[], senderId: string | null): Date | null {
  const last = messages.findLast((message) => message.sender.id === senderId);
  return last ? new Date(last.createdAt) : null;
}

export interface ConsultationMessageServiceDeps {
  consultationMessageRepository: ConsultationMessageRepositoryPort;
}

export type ConsultationMessageService = ReturnType<typeof createConsultationMessageService>;

export function createConsultationMessageService({
  consultationMessageRepository,
}: ConsultationMessageServiceDeps) {
  async function getAuthorizedContext(userId: string, appointmentId: string): Promise<ChatContext> {
    const context = await consultationMessageRepository.findChatContext(appointmentId);
    if (!context) throw new NotFoundError("Appointment not found.");
    if (!isParticipant(context, userId)) {
      throw new ForbiddenError("Only the patient and assigned clinician can access this chat.");
    }
    if (context.type !== "ONLINE") {
      throw new ConflictError("Chat is only available for online consultations.");
    }
    return context;
  }

  return {
    /** The Messages inbox. Scoped to the caller in the query, so no per-row ownership check is needed. */
    async listConversations(user: { id: string }): Promise<ChatConversationDTO[]> {
      const rows = await consultationMessageRepository.listConversations(user.id, CHAT_CONFIG.INBOX_LIMIT);
      return rows.map((row) => toConversation(row, user.id)).sort(byLatestActivity);
    },

    /** Also serves as the presence heartbeat: every poll marks the caller as seen. */
    async getChat(user: { id: string }, appointmentId: string): Promise<ConsultationChatDTO> {
      const context = await getAuthorizedContext(user.id, appointmentId);
      const counterpartId = getCounterpartId(context, user.id);
      const now = new Date();
      const [messages, presence] = await Promise.all([
        consultationMessageRepository.listRecent(appointmentId, CHAT_CONFIG.HISTORY_LIMIT),
        counterpartId ? consultationMessageRepository.findPresence(appointmentId, counterpartId) : null,
        consultationMessageRepository.savePresence(appointmentId, user.id, { lastSeenAt: now }),
      ]);
      const lastMessageAt = getLastMessageAt(messages, counterpartId);
      return {
        messages,
        canSend: canSendIn(context),
        counterpart: getCounterpartStatus(presence, lastMessageAt, now),
      };
    },

    async sendMessage(
      user: { id: string },
      appointmentId: string,
      input: SendMessageInput
    ): Promise<ConsultationMessageDTO> {
      const context = await getAuthorizedContext(user.id, appointmentId);
      if (!canSendIn(context)) {
        throw new ConflictError(
          "This consultation chat is closed. Messages can only be sent for confirmed appointments."
        );
      }
      return consultationMessageRepository.create({
        appointmentId,
        senderId: user.id,
        body: input.body,
      });
    },

    async markTyping(user: { id: string }, appointmentId: string): Promise<void> {
      const context = await getAuthorizedContext(user.id, appointmentId);
      if (!canSendIn(context)) {
        throw new ConflictError("This consultation chat is closed.");
      }
      const now = new Date();
      await consultationMessageRepository.savePresence(appointmentId, user.id, {
        lastSeenAt: now,
        typingAt: now,
      });
    },

    async markAsRead(user: { id: string }, appointmentId: string): Promise<{ updated: number }> {
      await getAuthorizedContext(user.id, appointmentId);
      const updated = await consultationMessageRepository.markReadFor(appointmentId, user.id);
      return { updated };
    },
  };
}
