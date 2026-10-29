"use client";

import { getInitials } from "@/lib/format";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Stethoscope } from "lucide-react";
import { Role } from "@backend/contracts";
import { getNavigationForRole } from "@/config/navigation";

interface SidebarProps {
  role?: Role | null;
  user?: {
    fullName?: string | null;
    email?: string | null;
    role?: Role | null;
  } | null;
  className?: string;
  onNavigate?: () => void;
}

const ROLE_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  ADMIN: { bg: "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400", text: "text-rose-600", dot: "bg-rose-500" },
  CLINICIAN: { bg: "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400", text: "text-blue-600", dot: "bg-blue-500" },
  STAFF: { bg: "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400", text: "text-amber-600", dot: "bg-amber-500" },
  PATIENT: { bg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400", text: "text-emerald-600", dot: "bg-emerald-500" },
};

export function Sidebar({ role, user, className = "", onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const navItems = getNavigationForRole(role);
  const userRole = user?.role || role || "PATIENT";
  const roleStyle = ROLE_COLORS[userRole] || ROLE_COLORS.PATIENT;

  return (
    <aside className={`flex h-full flex-col border-r border-border/80 bg-card text-card-foreground ${className}`}>
      {/* Brand Header */}
      <div className="flex h-16 items-center gap-3 border-b border-border/80 px-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-blue-700 text-primary-foreground shadow-sm">
          <Stethoscope className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-base font-bold tracking-tight text-foreground">CliniQ</span>
            <span className="rounded-full bg-primary/10 px-1.5 py-0.2 text-[9px] font-semibold text-primary">
              Pro
            </span>
          </div>
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            Healthcare OS
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
          Navigation
        </p>
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-150 ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
              }`}
            >
              <Icon className={`h-4 w-4 shrink-0 transition-transform duration-150 ${isActive ? "scale-110" : "group-hover:scale-105"}`} />
              <span className="truncate">{item.title}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Info & Portal Card */}
      <div className="border-t border-border/80 p-3">
        {user ? (
          <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/40 p-2.5">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-semibold text-xs border ${roleStyle.bg} shadow-xs`}>
              {getInitials(user.fullName)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-xs font-semibold text-foreground leading-tight">
                {user.fullName || "User"}
              </p>
              <div className="mt-0.5 flex items-center gap-1.5">
                <span className={`h-1.5 w-1.5 rounded-full ${roleStyle.dot} animate-pulse`} />
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                  {userRole}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-lg bg-muted/40 p-2.5 text-center">
            <p className="text-[11px] font-medium text-muted-foreground">Community Clinic</p>
            <p className="text-[10px] text-muted-foreground/70">Secure Health System</p>
          </div>
        )}
      </div>
    </aside>
  );
}
