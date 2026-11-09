"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Stethoscope, X } from "lucide-react";
import { Role } from "@backend/contracts";
import { cn } from "@/lib/utils";
import { getNavigationForRole } from "@/config/navigation";
import { ROUTES } from "@/constants/routes";
import { SidebarNavLink } from "@/components/layout/SidebarNavLink";
import { SidebarUserCard } from "@/components/layout/SidebarUserCard";
import { SidebarCollapseButton } from "@/components/layout/SidebarCollapseButton";

interface SidebarProps {
  role?: Role | null;
  user?: {
    fullName?: string | null;
    email?: string | null;
    role?: Role | null;
  } | null;
  className?: string;
  onNavigate?: () => void;
  /** Icons only (desktop). */
  isCollapsed?: boolean;
  /** Shows a close button in the header (mobile drawer). */
  onClose?: () => void;
  /** Unread counts keyed by nav href, e.g. { "/messages": 3 }. */
  badges?: Partial<Record<string, number>>;
  /** Shows the Collapse / Expand control (desktop). */
  onToggleCollapse?: () => void;
}

function isActiveHref(pathname: string, href: string): boolean {
  return pathname === href || (href !== ROUTES.DASHBOARD && pathname.startsWith(href));
}

export function Sidebar({
  role,
  user,
  className = "",
  onNavigate,
  isCollapsed = false,
  onClose,
  badges,
  onToggleCollapse,
}: SidebarProps) {
  const pathname = usePathname();
  const navItems = getNavigationForRole(role);
  const userRole = user?.role || role || "PATIENT";

  return (
    <aside
      className={cn("flex h-full flex-col border-r border-border/80 bg-card text-card-foreground", className)}
    >
      {/* Brand Header */}
      <div
        className={cn(
          "flex h-16 shrink-0 items-center gap-3 border-b border-border/80",
          isCollapsed ? "justify-center px-2" : "px-5"
        )}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-blue-700 text-primary-foreground shadow-sm">
          <Stethoscope className="h-5 w-5" />
        </div>
        {!isCollapsed && (
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold tracking-tight text-foreground">CliniQ</span>
              <span className="py-0.2 rounded-full bg-primary/10 px-1.5 text-[9px] font-semibold text-primary">
                Pro
              </span>
            </div>
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Healthcare OS
            </span>
          </div>
        )}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className={cn("flex-1 space-y-1 overflow-y-auto py-4", isCollapsed ? "px-2" : "px-3")}>
        {!isCollapsed && (
          <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
            Navigation
          </p>
        )}
        {navItems.map((item) => (
          <SidebarNavLink
            key={item.href}
            item={item}
            isActive={isActiveHref(pathname, item.href)}
            isCollapsed={isCollapsed}
            badgeCount={badges?.[item.href]}
            onNavigate={onNavigate}
          />
        ))}
      </nav>

      {/* User Info & Portal Card */}
      <div className={cn("space-y-2 border-t border-border/80", isCollapsed ? "p-2" : "p-3")}>
        {onToggleCollapse && (
          <SidebarCollapseButton isCollapsed={isCollapsed} onToggle={onToggleCollapse} />
        )}
        {user ? (
          <SidebarUserCard fullName={user.fullName} role={userRole} isCollapsed={isCollapsed} />
        ) : (
          !isCollapsed && (
            <div className="rounded-lg bg-muted/40 p-2.5 text-center">
              <p className="text-[11px] font-medium text-muted-foreground">Community Clinic</p>
              <p className="text-[10px] text-muted-foreground/70">Secure Health System</p>
            </div>
          )
        )}
      </div>
    </aside>
  );
}
