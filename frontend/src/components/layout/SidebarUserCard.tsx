import React from "react";
import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/format";
import type { Role } from "@backend/contracts";

interface SidebarUserCardProps {
  fullName?: string | null;
  role: Role;
  isCollapsed: boolean;
}

const ROLE_COLORS: Record<Role, { bg: string; dot: string }> = {
  ADMIN: { bg: "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400", dot: "bg-rose-500" },
  CLINICIAN: { bg: "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400", dot: "bg-blue-500" },
  STAFF: { bg: "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400", dot: "bg-amber-500" },
  PATIENT: {
    bg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
};

export function SidebarUserCard({ fullName, role, isCollapsed }: SidebarUserCardProps) {
  const roleStyle = ROLE_COLORS[role] ?? ROLE_COLORS.PATIENT;

  return (
    <div
      title={isCollapsed ? `${fullName || "User"} · ${role}` : undefined}
      className={cn(
        "flex items-center gap-3 rounded-xl",
        isCollapsed ? "justify-center" : "border border-border/60 bg-muted/40 p-2.5"
      )}
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-xs font-semibold ${roleStyle.bg} shadow-xs`}
      >
        {getInitials(fullName)}
      </div>
      {!isCollapsed && (
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold leading-tight text-foreground">
            {fullName || "User"}
          </p>
          <div className="mt-0.5 flex items-center gap-1.5">
            <span className={`h-1.5 w-1.5 rounded-full ${roleStyle.dot} animate-pulse`} />
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              {role}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
