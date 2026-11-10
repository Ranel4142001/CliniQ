"use client";

import { getInitials } from "@/lib/format";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, LogOut, Calendar, ShieldCheck, Settings } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Role } from "@backend/contracts";

interface TopbarProps {
  onOpenMobileMenu?: () => void;
  /** Red dot on the phone menu button when something in the menu is unread. */
  hasNavBadge?: boolean;
  user?: {
    fullName?: string | null;
    email?: string | null;
    role?: Role | null;
  } | null;
  onLogout?: () => void;
}

const ROLE_STYLES: Record<string, { bg: string; text: string; badge: string }> = {
  ADMIN: {
    bg: "bg-rose-500/10 text-rose-600 border-rose-500/30",
    text: "text-rose-600",
    badge: "Admin",
  },
  CLINICIAN: {
    bg: "bg-blue-500/10 text-blue-600 border-blue-500/30",
    text: "text-blue-600",
    badge: "Doctor / Clinician",
  },
  STAFF: {
    bg: "bg-amber-500/10 text-amber-600 border-amber-500/30",
    text: "text-amber-600",
    badge: "Clinic Staff",
  },
  PATIENT: {
    bg: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
    text: "text-emerald-600",
    badge: "Patient",
  },
};

export function Topbar({ onOpenMobileMenu, hasNavBadge = false, user, onLogout }: TopbarProps) {
  const [dateString, setDateString] = useState("");

  useEffect(() => {
    const now = new Date();
    setDateString(
      now.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    );
  }, []);

  const role = user?.role || "PATIENT";
  const roleStyle = ROLE_STYLES[role] || ROLE_STYLES.PATIENT;

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border/80 bg-card/85 px-4 backdrop-blur-md sm:px-6">
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-teal-400"
      />
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenMobileMenu}
          className="relative md:hidden"
          aria-label={hasNavBadge ? "Open menu (unread messages)" : "Open menu"}
        >
          <Menu className="h-5 w-5" />
          {hasNavBadge && (
            <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-card" />
          )}
        </Button>
        <div className="flex items-center gap-2.5">
          <span className="hidden whitespace-nowrap text-sm font-semibold text-foreground sm:inline-block">
            Clinic Operations Portal
          </span>
          {dateString && (
            <div className="hidden items-center gap-1.5 whitespace-nowrap rounded-full border border-border/60 bg-muted/30 px-2.5 py-0.5 text-[11px] text-muted-foreground lg:flex">
              <Calendar className="h-3 w-3 text-primary" />
              <span>{dateString}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2.5 px-2 transition-colors hover:bg-muted/60"
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg border text-xs font-bold ${roleStyle.bg} shadow-xs`}
                >
                  {getInitials(user.fullName)}
                </div>
                <div className="hidden text-left sm:block">
                  <div className="max-w-[140px] truncate text-xs font-semibold leading-tight text-foreground">
                    {user.fullName || "User"}
                  </div>
                  <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    {role}
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60 p-1.5 shadow-lg">
              <DropdownMenuLabel className="p-2">
                <div className="truncate text-xs font-semibold text-foreground">
                  {user.fullName}
                </div>
                <div className="truncate text-[11px] text-muted-foreground">{user.email}</div>
                <div className="mt-1.5">
                  <Badge variant="outline" className={`text-[10px] font-medium ${roleStyle.bg}`}>
                    <ShieldCheck className="mr-1 h-2.5 w-2.5" />
                    {roleStyle.badge}
                  </Badge>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                asChild
                className="cursor-pointer rounded-md p-2 text-xs font-medium"
              >
                <Link href={ROUTES.SETTINGS}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              {onLogout && (
                <DropdownMenuItem
                  onClick={onLogout}
                  className="cursor-pointer rounded-md p-2 text-xs font-medium text-destructive focus:bg-destructive/10 focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="text-xs text-muted-foreground">Guest</div>
        )}
      </div>
    </header>
  );
}
