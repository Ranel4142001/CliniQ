import type { Role } from "@prisma/client";

export interface FrontDeskMessageDTO {
  id: string;
  body: string;
  createdAt: Date | string;
  readAt: Date | string | null;
  sender: { id: string; fullName: string; role: Role };
}

/** One row of a front-desk inbox: a patient's thread with the clinic. */
export interface FrontDeskThreadDTO {
  patientId: string;
  patientName: string;
  patientNo: string;
  /** `isMine`: sent by the viewer's side (the patient, or the desk as a whole). */
  lastMessage: { body: string; createdAt: Date | string; isMine: boolean } | null;
  /** Messages from the other side not yet read by the viewer's side. */
  unreadCount: number;
}

export interface FrontDeskChatDTO {
  messages: FrontDeskMessageDTO[];
  /** False when the patient has no CliniQ account, so nobody could read a reply. */
  canSend: boolean;
  patientName: string;
  patientNo: string;
}
