"use client";

import React, { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { notify } from "@/lib/notify";
import { apiClient } from "@/lib/api-client";
import { ROUTES } from "@/constants/routes";
import { Role } from "@backend/contracts";

interface AppShellClientProps {
  children: ReactNode;
  user: {
    fullName: string;
    email: string;
    role: Role;
  };
}

/**
 * Client boundary for the app shell.
 * Handles logout (calls API then redirects to /login).
 */
export function AppShellClient({ children, user }: AppShellClientProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await apiClient.post("/api/auth/logout", {});
      notify.success("You have been logged out.");
    } catch {
      // ignore errors – still redirect
    }
    router.push(ROUTES.LOGIN);
    router.refresh();
  };

  return (
    <AppShell user={user} onLogout={handleLogout}>
      {children}
    </AppShell>
  );
}
