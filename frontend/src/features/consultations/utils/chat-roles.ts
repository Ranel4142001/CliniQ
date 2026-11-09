import { ROLES, type Role } from "@backend/contracts";

/** Private patient–clinician chats for online appointments. */
export function hasConsultationChats(role?: Role | null): boolean {
  return role === ROLES.CLINICIAN || role === ROLES.PATIENT;
}

/** The patient ↔ clinic front-desk thread (answered by admins and staff). */
export function hasFrontDeskChat(role?: Role | null): boolean {
  return role === ROLES.ADMIN || role === ROLES.STAFF || role === ROLES.PATIENT;
}
