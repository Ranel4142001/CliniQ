import { ROLES, type Role } from "@backend/contracts";

/** Chats are private to the patient and their clinician; admins and staff have no inbox. */
export function canUseChat(role?: Role | null): boolean {
  return role === ROLES.CLINICIAN || role === ROLES.PATIENT;
}
