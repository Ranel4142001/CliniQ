"use client";

import React, { useState, ReactNode } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { Role } from "@backend/contracts";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface AppShellProps {
  children: ReactNode;
  user?: {
    fullName?: string | null;
    email?: string | null;
    role?: Role | null;
  } | null;
  onLogout?: () => void;
}

export function AppShell({ children, user, onLogout }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-64 md:shrink-0">
        <Sidebar role={user?.role} user={user} className="w-full" />
      </div>

      {/* Mobile drawer */}
      <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
        <DialogContent className="p-0 sm:max-w-xs h-full top-0 left-0 translate-x-0 translate-y-0 rounded-none border-r">
          <Sidebar
            role={user?.role}
            user={user}
            className="w-full h-full border-none"
            onNavigate={() => setMobileOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Main app body */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar
          onOpenMobileMenu={() => setMobileOpen(true)}
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
