"use client";

import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/form/TextField";
import { SectionCard } from "@/components/layout/SectionCard";
import { useUpdateOwnProfile } from "@/features/settings/hooks/use-account-settings";
import { updateOwnProfileSchema, type UpdateOwnProfileInput } from "@backend/contracts";

/** The name shown across CliniQ: sidebar, chats, prescriptions and reports. */
export function ProfileForm({ fullName }: { fullName: string }) {
  const mutation = useUpdateOwnProfile();
  const form = useForm<UpdateOwnProfileInput>({
    resolver: zodResolver(updateOwnProfileSchema),
    defaultValues: { fullName },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const updated = await mutation.mutateAsync(values).catch(() => null);
    if (updated) form.reset({ fullName: updated.fullName });
  });

  return (
    <SectionCard
      title="Name"
      subtitle="How your name appears in CliniQ."
      icon={<UserRound className="h-5 w-5" />}
    >
      <FormProvider {...form}>
        <form onSubmit={onSubmit} className="space-y-4 p-5" noValidate>
          <TextField<UpdateOwnProfileInput>
            name="fullName"
            label="Full name"
            autoComplete="name"
            required
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={!form.formState.isDirty || mutation.isPending}>
              {mutation.isPending ? "Saving…" : "Save name"}
            </Button>
          </div>
        </form>
      </FormProvider>
    </SectionCard>
  );
}
