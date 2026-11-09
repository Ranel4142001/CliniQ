import type { AppointmentStatus, Role } from "@prisma/client";

export interface ChatParticipant {
  id: string;
  fullName: string;
  role: Role;
}

export interface ConsultationMessageDTO {
  id: string;
  body: string;
  createdAt: Date | string;
  readAt: Date | string | null;
  sender: ChatParticipant;
}

/** One row of the Messages inbox: a chat for one online appointment. */
export interface ChatConversationDTO {
  appointmentId: string;
  counterpartName: string;
  scheduledAt: Date | string;
  status: AppointmentStatus;
  canSend: boolean;
  lastMessage: { body: string; createdAt: Date | string; isMine: boolean } | null;
  /** Messages from the other participant not yet read by the current user. */
  unreadCount: number;
}

export interface ChatCounterpartStatusDTO {
  /** Null until the other participant has opened the chat at least once. */
  lastSeenAt: Date | string | null;
  isActive: boolean;
  isTyping: boolean;
}

export interface ConsultationChatDTO {
  messages: ConsultationMessageDTO[];
  /** False once the appointment is no longer CONFIRMED; the thread becomes read-only. */
  canSend: boolean;
  counterpart: ChatCounterpartStatusDTO;
}
