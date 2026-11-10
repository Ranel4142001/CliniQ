"use client";

import React, { useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { InitialsAvatar } from "@/components/feedback/InitialsAvatar";
import { ROLE_LABELS } from "@/components/layout/SidebarUserCard";
import {
  SettingsField,
  SettingsRow,
  SettingsSection,
} from "@/features/settings/components/SettingsField";
import { useSaveAccountSettings } from "@/features/settings/hooks/use-account-settings";
import {
  accountFormSchema,
  hasChanges,
  planAccountChanges,
  type AccountFormValues,
} from "@/features/settings/utils/account-form";
import type { Role } from "@backend/contracts";

interface AccountSettingsFormProps {
  user: { fullName: string; email: string; role: Role };
}

/** Name, email and password in one form with a single Save Changes button. */
export function AccountSettingsForm({ user }: AccountSettingsFormProps) {
  const mutation = useSaveAccountSettings();
  const defaults = useMemo<AccountFormValues>(
    () => ({
      fullName: user.fullName,
      email: user.email,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    }),
    [user.fullName, user.email]
  );
  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema({ email: user.email })),
    defaultValues: defaults,
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const changes = planAccountChanges(values, user);
    if (!hasChanges(changes)) return;
    const saved = await mutation.mutateAsync(changes).catch(() => null);
    // The email only changes after confirmation, so show the saved one again.
    form.reset(
      saved ? { ...defaults, fullName: values.fullName.trim() } : { ...values, currentPassword: "" }
    );
  });

  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit} noValidate>
        <div className="flex flex-col gap-4 border-b border-border/80 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Settings
            </h1>
            <p className="mt-1 text-sm text-muted-foreground sm:text-[15px]">
              Update your name, email, and password.
            </p>
          </div>
          <Button
            type="submit"
            className="h-11 rounded-full px-6"
            disabled={!form.formState.isDirty || mutation.isPending}
          >
            {mutation.isPending ? "Saving…" : "Save Changes"}
          </Button>
        </div>

        <SettingsSection
          title="Profile information"
          description="Your name and the email you sign in with."
        >
          <SettingsRow label="Profile">
            <div className="flex items-center gap-3">
              <InitialsAvatar name={user.fullName} className="h-12 w-12 text-base" />
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                {ROLE_LABELS[user.role] ?? user.role}
              </span>
            </div>
          </SettingsRow>
          <SettingsField name="fullName" label="Name" autoComplete="name" />
          <SettingsField
            name="email"
            label="Email"
            type="email"
            autoComplete="email"
            hint="Changing it sends a confirmation link to the new address."
          />
        </SettingsSection>

        <SettingsSection
          title="Password"
          description="Leave the new password empty to keep your current one."
        >
          <SettingsField
            name="currentPassword"
            label="Current password"
            type="password"
            autoComplete="current-password"
            hint="Needed to change your email or password."
          />
          <SettingsField
            name="newPassword"
            label="New password"
            type="password"
            autoComplete="new-password"
            hint="At least 8 characters, with an uppercase letter and a number."
          />
          <SettingsField
            name="confirmPassword"
            label="Confirm new password"
            type="password"
            autoComplete="new-password"
          />
        </SettingsSection>
      </form>
    </FormProvider>
  );
}
