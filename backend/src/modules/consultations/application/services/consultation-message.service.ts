import type {
  ChatContext,
  ConsultationMessageRepositoryPort,
} from "@backend/modules/consultations/application/ports/outbound/consultation-message-repository.port";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "@backend/shared/domain/errors/app-error";
import { CHAT_CONFIG } from "@backend/modules/consultations/domain/constants/consultation.constants";
import type { SendMessageInput } from "@backend/modules/consultations/application/dto/consultation-message.schema";
import type {
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

function canSendIn(context: ChatContext): boolean {
  return context.status === "CONFIRMED";
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
    async getChat(user: { id: string }, appointmentId: string): Promise<ConsultationChatDTO> {
      const context = await getAuthorizedContext(user.id, appointmentId);
      const messages = await consultationMessageRepository.listRecent(
        appointmentId,
        CHAT_CONFIG.HISTORY_LIMIT
      );
      return { messages, canSend: canSendIn(context) };
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

    async markAsRead(user: { id: string }, appointmentId: string): Promise<{ updated: number }> {
      await getAuthorizedContext(user.id, appointmentId);
      const updated = await consultationMessageRepository.markReadFor(appointmentId, user.id);
      return { updated };
    },
  };
}
