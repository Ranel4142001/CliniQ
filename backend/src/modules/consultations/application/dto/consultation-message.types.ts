import type { Role } from "@prisma/client";

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

export interface ConsultationChatDTO {
  messages: ConsultationMessageDTO[];
  /** False once the appointment is no longer CONFIRMED; the thread becomes read-only. */
  canSend: boolean;
}
