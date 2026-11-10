import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatBadgeCount } from "@/lib/format";
import type { NavItem } from "@/config/navigation";

interface SidebarNavLinkProps {
  item: NavItem;
  isActive: boolean;
  isCollapsed: boolean;
  badgeCount?: number;
  onNavigate?: () => void;
}

export function SidebarNavLink({
  item,
  isActive,
  isCollapsed,
  badgeCount = 0,
  onNavigate,
}: SidebarNavLinkProps) {
  const Icon = item.icon;
  const hasBadge = badgeCount > 0;
  const label = hasBadge ? `${item.title} (${badgeCount} unread)` : item.title;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      title={isCollapsed ? label : undefined}
      aria-label={isCollapsed ? label : undefined}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "group relative flex min-h-11 items-center gap-3 rounded-xl py-2.5 text-[15px] font-medium transition-all duration-150",
        isCollapsed ? "justify-center px-0" : "px-3.5",
        isActive
          ? "bg-gradient-to-r from-blue-600 to-indigo-500 font-semibold text-white shadow-md shadow-blue-600/20"
          : "text-slate-600 hover:bg-muted/70 hover:text-foreground dark:text-slate-300"
      )}
    >
      <span className="relative">
        <Icon
          className={cn(
            "h-5 w-5 shrink-0 transition-transform duration-150",
            isActive ? "scale-105" : "group-hover:scale-105"
          )}
        />
        {isCollapsed && hasBadge && (
          <span className="absolute -right-1.5 -top-1.5 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-card" />
        )}
      </span>
      {!isCollapsed && <span className="truncate">{item.title}</span>}
      {!isCollapsed && hasBadge && (
        <span
          className={cn(
            "ml-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold",
            isActive ? "bg-white text-blue-700" : "bg-rose-500 text-white"
          )}
        >
          {formatBadgeCount(badgeCount)}
        </span>
      )}
    </Link>
  );
}
