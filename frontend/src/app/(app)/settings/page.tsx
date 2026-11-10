"use client";

import React from "react";
import { LoadingState } from "@/components/feedback/LoadingState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { AccountSettingsForm } from "@/features/settings/components/AccountSettingsForm";

export default function SettingsPage() {
  const { user, isLoading, error, refetch } = useCurrentUser();

  if (isLoading) return <LoadingState message="Loading your account…" />;
  if (error || !user) {
    return (
      <ErrorState
        title="Settings unavailable"
        message="Your account could not be loaded."
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <AccountSettingsForm key={`${user.fullName}|${user.email}`} user={user} />
    </div>
  );
}
