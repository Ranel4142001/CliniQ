"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Stethoscope } from "lucide-react";
import { Role } from "@/shared/constants/roles";
import { getNavigationForRole } from "@/config/navigation";

interface SidebarProps {
  role?: Role | null;
  className?: string;
  onNavigate?: () => void;
}

export function Sidebar({ role, className = "", onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const navItems = getNavigationForRole(role);

  return (
    <aside className={`flex h-full flex-col border-r bg-card text-card-foreground ${className}`}>
      <div className="flex h-16 items-center gap-2.5 border-b px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
          <Stethoscope className="h-5 w-5" />
        </div>
        <div>
          <span className="text-lg font-bold tracking-tight text-foreground">CliniQ</span>
          <span className="ml-1.5 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
            v1.0
          </span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4">
        <div className="rounded-md bg-muted/60 p-3 text-center">
          <p className="text-[11px] font-medium text-muted-foreground">CliniQ Management</p>
          <p className="text-[10px] text-muted-foreground/80 mt-0.5">Clinic Management System</p>
        </div>
      </div>
    </aside>
  );
}
