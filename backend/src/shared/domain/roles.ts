export const ROLES = {
  ADMIN: "ADMIN",
  CLINICIAN: "CLINICIAN",
  STAFF: "STAFF",
  PATIENT: "PATIENT",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ALL_ROLES: Role[] = [ROLES.ADMIN, ROLES.CLINICIAN, ROLES.STAFF, ROLES.PATIENT];
