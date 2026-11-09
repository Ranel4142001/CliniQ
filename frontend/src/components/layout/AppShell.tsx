"use client";

import React, { useState, ReactNode } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { MobileNavDrawer } from "@/components/layout/MobileNavDrawer";
import { Role } from "@backend/contracts";
import { cn } from "@/lib/utils";
import { useSidebarCollapsed } from "@/hooks/useSidebarCollapsed";

interface AppShellProps {
  children: ReactNode;
  user?: {
    fullName?: string | null;
    email?: string | null;
    role?: Role | null;
  } | null;
  onLogout?: () => void;
  /** Unread counts keyed by nav href, shown as sidebar badges. */
  navBadges?: Partial<Record<string, number>>;
}

export function AppShell({ children, user, onLogout, navBadges }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isCollapsed, toggle } = useSidebarCollapsed();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <div
        className={cn(
          "hidden transition-[width] duration-200 ease-out md:flex md:shrink-0",
          isCollapsed ? "md:w-[4.5rem]" : "md:w-64"
        )}
      >
        <Sidebar
          role={user?.role}
          user={user}
          className="w-full"
          isCollapsed={isCollapsed}
          badges={navBadges}
          onToggleCollapse={toggle}
        />
      </div>

      {/* Mobile drawer */}
      <MobileNavDrawer open={mobileOpen} onOpenChange={setMobileOpen}>
        <Sidebar
          role={user?.role}
          user={user}
          className="h-full w-full border-none"
          onNavigate={() => setMobileOpen(false)}
          onClose={() => setMobileOpen(false)}
          badges={navBadges}
        />
      </MobileNavDrawer>

      {/* Main app body */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar
          onOpenMobileMenu={() => setMobileOpen(true)}
          onToggleSidebar={toggle}
          isSidebarCollapsed={isCollapsed}
          hasNavBadge={Object.values(navBadges ?? {}).some((count) => (count ?? 0) > 0)}
          user={user}
          onLogout={onLogout}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
