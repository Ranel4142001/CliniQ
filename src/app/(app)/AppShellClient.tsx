"use client";

import React, { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/shared/components/layout/AppShell";
import { notify } from "@/shared/lib/notify";
import { apiClient } from "@/shared/lib/api-client";
import { ROUTES } from "@/shared/constants/routes";
import { Role } from "@/shared/constants/roles";

interface AppShellClientProps {
  children: ReactNode;
  user: {
    fullName: string;
    email: string;
    role: string;
  } | null;
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

  const shellUser = user
    ? { fullName: user.fullName, email: user.email, role: user.role as Role }
    : null;

  return (
    <AppShell user={shellUser} onLogout={handleLogout}>
      {children}
    </AppShell>
  );
}
