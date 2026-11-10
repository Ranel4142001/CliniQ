"use client";

import React, { ReactNode } from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { AccountFormValues } from "@/features/settings/utils/account-form";

/** One settings row: label on the left, control and helper text on the right. */
export function SettingsRow({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-2 py-3 sm:grid-cols-[200px_minmax(0,1fr)] sm:items-start sm:gap-6">
      <label htmlFor={htmlFor} className="pt-2.5 text-sm text-foreground">
        {label}
      </label>
      <div className="max-w-md">{children}</div>
    </div>
  );
}

interface SettingsFieldProps {
  name: keyof AccountFormValues;
  label: string;
  type?: "text" | "email" | "password";
  autoComplete?: string;
  placeholder?: string;
  hint?: string;
}

export function SettingsField({
  name,
  label,
  type = "text",
  autoComplete,
  placeholder,
  hint,
}: SettingsFieldProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext<AccountFormValues>();
  const error = errors[name]?.message;
  const describedBy = error || hint ? `${name}-help` : undefined;

  return (
    <SettingsRow label={label} htmlFor={name}>
      <Input
        id={name}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className={cn(
          "h-10 rounded-lg bg-card",
          error && "border-destructive focus-visible:ring-destructive"
        )}
        {...register(name)}
      />
      {(error || hint) && (
        <p
          id={describedBy}
          className={cn(
            "mt-1.5 text-xs",
            error ? "font-medium text-destructive" : "text-muted-foreground"
          )}
        >
          {error ?? hint}
        </p>
      )}
    </SettingsRow>
  );
}

/** Section title and one-line description, separated from the next section by a rule. */
export function SettingsSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="border-b border-border/80 py-6 last:border-b-0">
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
      <div className="mt-3">{children}</div>
    </section>
  );
}
