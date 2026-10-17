"use client";

import React, { ReactNode } from "react";
import { Role } from "@/shared/constants/roles";

interface RoleGuardProps {
  allowedRoles: Role[];
  currentRole?: Role | null;
  children: ReactNode;
  fallback?: ReactNode;
}

export function RoleGuard({
  allowedRoles,
  currentRole,
  children,
  fallback = null,
}: RoleGuardProps) {
  if (!currentRole || !allowedRoles.includes(currentRole)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
