"use client";

import { useCurrentUser } from "./useCurrentUser";
import { Role, ROLES } from "@/shared/constants/roles";

export type PermissionAction = "create" | "read" | "update" | "delete" | "manage" | "dispense" | "prescribe";
export type PermissionResource = "patient" | "appointment" | "consultation" | "medicine" | "prescription" | "report" | "user";

export function checkPermission(
  role: Role | null | undefined,
  action: PermissionAction,
  resource: PermissionResource
): boolean {
  if (!role) return false;
  if (role === ROLES.ADMIN) return true;

  switch (resource) {
    case "patient":
      return true; // All roles can read/view patients (clinicians, staff, admins, patient own)
    case "appointment":
      return true;
    case "consultation":
      return role === ROLES.CLINICIAN;
    case "prescription":
      if (action === "prescribe") return role === ROLES.CLINICIAN;
      if (action === "dispense") return role === ROLES.STAFF;
      return true;
    case "medicine":
      return role === ROLES.STAFF || role === ROLES.CLINICIAN;
    case "report":
      return role === ROLES.STAFF;
    case "user":
      return false; // only admin
    default:
      return false;
  }
}

export function usePermission() {
  const { user } = useCurrentUser();

  const can = (action: PermissionAction, resource: PermissionResource): boolean => {
    return checkPermission(user?.role, action, resource);
  };

  return { can, role: user?.role };
}
