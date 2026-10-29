"use client";

import { getInitials } from "@/lib/format";
import React, { useState, useEffect } from "react";
import { Menu, LogOut, Calendar, ShieldCheck } from "lucide-react";
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
  user?: {
    fullName?: string | null;
    email?: string | null;
    role?: Role | null;
  } | null;
  onLogout?: () => void;
}

const ROLE_STYLES: Record<string, { bg: string; text: string; badge: string }> = {
  ADMIN: { bg: "bg-rose-500/10 text-rose-600 border-rose-500/30", text: "text-rose-600", badge: "Admin" },
  CLINICIAN: { bg: "bg-blue-500/10 text-blue-600 border-blue-500/30", text: "text-blue-600", badge: "Doctor / Clinician" },
  STAFF: { bg: "bg-amber-500/10 text-amber-600 border-amber-500/30", text: "text-amber-600", badge: "Clinic Staff" },
  PATIENT: { bg: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30", text: "text-emerald-600", badge: "Patient" },
};

export function Topbar({ onOpenMobileMenu, user, onLogout }: TopbarProps) {
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
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenMobileMenu}
          className="md:hidden"
          aria-label="Open mobile navigation"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2.5">
          <span className="hidden sm:inline-block font-semibold text-sm text-foreground">
            Clinic Operations Portal
          </span>
          {dateString && (
            <div className="hidden md:flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/30 px-2.5 py-0.5 text-[11px] text-muted-foreground">
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
              <Button variant="ghost" className="flex items-center gap-2.5 px-2 hover:bg-muted/60 transition-colors">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg border text-xs font-bold ${roleStyle.bg} shadow-xs`}>
                  {getInitials(user.fullName)}
                </div>
                <div className="hidden text-left sm:block">
                  <div className="text-xs font-semibold leading-tight text-foreground truncate max-w-[140px]">
                    {user.fullName || "User"}
                  </div>
                  <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                    {role}
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60 p-1.5 shadow-lg">
              <DropdownMenuLabel className="p-2">
                <div className="font-semibold text-xs text-foreground truncate">{user.fullName}</div>
                <div className="text-[11px] text-muted-foreground truncate">{user.email}</div>
                <div className="mt-1.5">
                  <Badge variant="outline" className={`text-[10px] font-medium ${roleStyle.bg}`}>
                    <ShieldCheck className="h-2.5 w-2.5 mr-1" />
                    {roleStyle.badge}
                  </Badge>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {onLogout && (
                <DropdownMenuItem
                  onClick={onLogout}
                  className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 rounded-md p-2 text-xs font-medium"
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
