import type { AppointmentStatus, AppointmentType } from "@prisma/client";
import type { ConsultationMessageDTO } from "@backend/modules/consultations/application/dto/consultation-message.types";
import type { ChatPresence } from "@backend/modules/consultations/domain/services/chat-presence";

/** Minimal appointment data needed to authorize chat access. */
export interface ChatContext {
  id: string;
  type: AppointmentType;
  status: AppointmentStatus;
  clinicianId: string;
  patient: { profileId: string | null };
}

/** An online appointment the user takes part in, with its latest message and unread count. */
export interface ConversationRecord {
  appointmentId: string;
  scheduledAt: Date;
  status: AppointmentStatus;
  clinicianId: string;
  clinicianName: string;
  patient: { firstName: string; middleName: string | null; lastName: string };
  lastMessage: { body: string; createdAt: Date; senderId: string } | null;
  unreadCount: number;
}

export interface ConsultationMessageRepositoryPort {
  /** Online appointments where the user is the clinician or the patient, newest first. */
  listConversations(userId: string, limit: number): Promise<ConversationRecord[]>;
  findChatContext(appointmentId: string): Promise<ChatContext | null>;
  /** Most recent messages, returned oldest-first for display. */
  listRecent(appointmentId: string, limit: number): Promise<ConsultationMessageDTO[]>;
  create(data: {
    appointmentId: string;
    senderId: string;
    body: string;
  }): Promise<ConsultationMessageDTO>;
  /** Marks the other participant's unread messages as read; returns how many changed. */
  markReadFor(appointmentId: string, readerId: string): Promise<number>;
  findPresence(appointmentId: string, userId: string): Promise<ChatPresence | null>;
  /** Creates or updates a participant's presence row. */
  savePresence(
    appointmentId: string,
    userId: string,
    data: { lastSeenAt: Date; typingAt?: Date }
  ): Promise<void>;
}
