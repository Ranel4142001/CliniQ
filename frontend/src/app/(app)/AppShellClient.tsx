"use client";

import React, { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { LoadingState } from "@/components/feedback/LoadingState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { notify } from "@/lib/notify";
import { ApiError, apiClient } from "@/lib/api-client";
import { ROUTES } from "@/constants/routes";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { useInbox } from "@/features/consultations";

const SESSION_ENDED_STATUSES = new Set([401, 403]);

/**
 * Client boundary for the app shell: loads the signed-in user (cached by React Query,
 * so later page changes are instant) and handles logout.
 */
export function AppShellClient({ children }: { children: ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isLoading, error, refetch } = useCurrentUser();
  const { unreadCount: unreadMessages } = useInbox(user?.role);

  // Expired session or deactivated account: back to sign in.
  const sessionEnded = error instanceof ApiError && SESSION_ENDED_STATUSES.has(error.status);
  useEffect(() => {
    if (sessionEnded) router.replace(ROUTES.LOGIN);
  }, [sessionEnded, router]);

  const handleLogout = async () => {
    try {
      await apiClient.post("/api/auth/logout", {});
      notify.success("You have been logged out.");
    } catch {
      // ignore errors – still redirect
    }
    // Drop every cached response so the next person on this browser sees nothing of this session.
    queryClient.clear();
    router.push(ROUTES.LOGIN);
    router.refresh();
  };

  if (error && !sessionEnded) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <ErrorState
          title="CliniQ is temporarily unavailable"
          message="We couldn't load your account. Please try again in a moment."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  if (isLoading || sessionEnded || !user) {
    return <LoadingState message="Loading CliniQ…" className="min-h-screen" />;
  }

  return (
    <AppShell
      user={{ fullName: user.fullName, email: user.email, role: user.role }}
      onLogout={handleLogout}
      navBadges={{ [ROUTES.MESSAGES]: unreadMessages }}
    >
      {children}
    </AppShell>
  );
}
