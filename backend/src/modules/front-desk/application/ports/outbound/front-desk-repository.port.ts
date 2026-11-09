import type { FrontDeskMessageDTO } from "@backend/modules/front-desk/application/dto/front-desk.types";

export interface FrontDeskPatient {
  id: string;
  profileId: string | null;
  patientNo: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
}

export interface FrontDeskThreadRecord {
  patient: FrontDeskPatient;
  lastMessage: { body: string; createdAt: Date; isFromPatient: boolean } | null;
  unreadCount: number;
}

export interface FrontDeskRepositoryPort {
  findPatient(patientId: string): Promise<FrontDeskPatient | null>;
  findPatientByProfileId(profileId: string): Promise<FrontDeskPatient | null>;
  /** Patients with at least one message, most recent activity first. */
  listActivePatientIds(limit: number): Promise<string[]>;
  /**
   * Thread summaries in the order of `patientIds`. `unreadFromPatient` picks whose unread
   * messages are counted: the patient's (for the desk) or the desk's (for the patient).
   */
  summarizeThreads(patientIds: string[], unreadFromPatient: boolean): Promise<FrontDeskThreadRecord[]>;
  /** Most recent messages, returned oldest-first for display. */
  listRecent(patientId: string, limit: number): Promise<FrontDeskMessageDTO[]>;
  create(data: {
    patientId: string;
    senderId: string;
    isFromPatient: boolean;
    body: string;
  }): Promise<FrontDeskMessageDTO>;
  /** Marks the other side's unread messages as read; returns how many changed. */
  markRead(patientId: string, readerIsPatient: boolean): Promise<number>;
}
