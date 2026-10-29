import type { AppointmentStatus, AppointmentType } from "@prisma/client";
import type { ConsultationMessageDTO } from "@backend/modules/consultations/application/dto/consultation-message.types";

/** Minimal appointment data needed to authorize chat access. */
export interface ChatContext {
  id: string;
  type: AppointmentType;
  status: AppointmentStatus;
  clinicianId: string;
  patient: { profileId: string | null };
}

export interface ConsultationMessageRepositoryPort {
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
}
