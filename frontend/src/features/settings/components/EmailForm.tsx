"use client";

import React, { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/form/TextField";
import { SectionCard } from "@/components/layout/SectionCard";
import { useChangeEmail } from "@/features/settings/hooks/use-account-settings";
import { changeEmailSchema, type ChangeEmailInput } from "@backend/contracts";

/** Starts an email change; the new address takes effect once its confirmation link is opened. */
export function EmailForm({ email }: { email: string }) {
  const mutation = useChangeEmail();
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const form = useForm<ChangeEmailInput>({
    resolver: zodResolver(changeEmailSchema),
    defaultValues: { newEmail: "", currentPassword: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const result = await mutation.mutateAsync(values).catch(() => null);
    if (!result) return form.resetField("currentPassword");
    setPendingEmail(result.pendingEmail);
    form.reset();
  });

  return (
    <SectionCard
      title="Email"
      subtitle={`You sign in with ${email}.`}
      icon={<Mail className="h-5 w-5" />}
      tone="teal"
    >
      <FormProvider {...form}>
        <form onSubmit={onSubmit} className="space-y-4 p-5" noValidate>
          {pendingEmail && (
            <p className="flex items-start gap-2 rounded-xl bg-teal-50 p-3 text-sm text-teal-800 dark:bg-teal-500/10 dark:text-teal-200">
              <MailCheck className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                Open the link we sent to <strong>{pendingEmail}</strong> to finish. Your email stays
                the same until then.
              </span>
            </p>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField<ChangeEmailInput>
              name="newEmail"
              label="New email"
              type="email"
              autoComplete="email"
              required
            />
            <TextField<ChangeEmailInput>
              name="currentPassword"
              label="Current password"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Sending…" : "Change email"}
            </Button>
          </div>
        </form>
      </FormProvider>
    </SectionCard>
  );
}
