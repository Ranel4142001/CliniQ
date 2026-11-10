"use client";

import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/form/TextField";
import { SectionCard } from "@/components/layout/SectionCard";
import { useChangePassword } from "@/features/settings/hooks/use-account-settings";
import { changePasswordSchema, type ChangePasswordInput } from "@backend/contracts";

const EMPTY: ChangePasswordInput = { currentPassword: "", newPassword: "", confirmPassword: "" };

export function PasswordForm() {
  const mutation = useChangePassword();
  const form = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: EMPTY,
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const ok = await mutation.mutateAsync(values).catch(() => null);
    form.reset(ok ? EMPTY : { ...values, currentPassword: "" });
  });

  return (
    <SectionCard
      title="Password"
      subtitle="Use at least 8 characters with an uppercase letter and a number."
      icon={<KeyRound className="h-5 w-5" />}
      tone="amber"
    >
      <FormProvider {...form}>
        <form onSubmit={onSubmit} className="space-y-4 p-5" noValidate>
          <TextField<ChangePasswordInput>
            name="currentPassword"
            label="Current password"
            type="password"
            autoComplete="current-password"
            required
            className="sm:max-w-sm"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField<ChangePasswordInput>
              name="newPassword"
              label="New password"
              type="password"
              autoComplete="new-password"
              required
            />
            <TextField<ChangePasswordInput>
              name="confirmPassword"
              label="Confirm new password"
              type="password"
              autoComplete="new-password"
              required
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving…" : "Change password"}
            </Button>
          </div>
        </form>
      </FormProvider>
    </SectionCard>
  );
}
