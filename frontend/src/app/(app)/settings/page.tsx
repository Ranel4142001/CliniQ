"use client";

import React from "react";
import { ROUTES } from "@/constants/routes";
import { PageHeader } from "@/components/layout/PageHeader";
import { LoadingState } from "@/components/feedback/LoadingState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { ProfileForm } from "@/features/settings/components/ProfileForm";
import { EmailForm } from "@/features/settings/components/EmailForm";
import { PasswordForm } from "@/features/settings/components/PasswordForm";

export default function SettingsPage() {
  const { user, isLoading, error, refetch } = useCurrentUser();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        feature={ROUTES.SETTINGS}
        title="Settings"
        description="Update your name, email, and password."
      />

      {isLoading && <LoadingState message="Loading your account…" />}
      {error && !isLoading && (
        <ErrorState
          title="Settings unavailable"
          message="Your account could not be loaded."
          onRetry={() => refetch()}
        />
      )}

      {user && (
        <>
          <ProfileForm key={user.fullName} fullName={user.fullName} />
          <EmailForm email={user.email} />
          <PasswordForm />
        </>
      )}
    </div>
  );
}
