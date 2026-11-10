import React from "react";
import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/format";
import type { Role } from "@backend/contracts";

interface SidebarUserCardProps {
  fullName?: string | null;
  role: Role;
  isCollapsed: boolean;
}

const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Administrator",
  CLINICIAN: "Clinician",
  STAFF: "Front desk staff",
  PATIENT: "Patient",
};

/** The signed-in person, at the foot of the sidebar. */
export function SidebarUserCard({ fullName, role, isCollapsed }: SidebarUserCardProps) {
  const name = fullName || "User";
  const roleLabel = ROLE_LABELS[role] ?? role;

  return (
    <div
      title={isCollapsed ? `${name} · ${roleLabel}` : undefined}
      className={cn("flex items-center gap-3", isCollapsed ? "justify-center" : "px-2 py-1")}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
        {getInitials(fullName)}
      </div>
      {!isCollapsed && (
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">{name}</p>
          <p className="truncate text-xs text-muted-foreground">{roleLabel}</p>
        </div>
      )}
    </div>
  );
}
