"use client";

import React from "react";
import { useFormContext, Controller, Control, FieldValues, Path } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface TextareaFieldProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>;
  label: string;
  control?: Control<TFieldValues>;
  placeholder?: string;
  rows?: number;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export function TextareaField<TFieldValues extends FieldValues>({
  name,
  label,
  control,
  placeholder,
  rows = 3,
  description,
  required,
  disabled,
  className = "",
}: TextareaFieldProps<TFieldValues>) {
  const formContext = useFormContext<TFieldValues>();
  const effectiveControl = control || formContext?.control;

  if (!effectiveControl) {
    throw new Error(
      `TextareaField for "${name}" must be used within a FormProvider or passed a control prop.`
    );
  }

  return (
    <Controller
      name={name}
      control={effectiveControl}
      render={({ field, fieldState: { error } }) => (
        <div className={`space-y-1.5 ${className}`}>
          <Label htmlFor={name} className="text-sm font-medium">
            {label}
            {required && <span className="ml-1 text-destructive">*</span>}
          </Label>
          <Textarea
            {...field}
            id={name}
            rows={rows}
            placeholder={placeholder}
            disabled={disabled}
            value={field.value ?? ""}
            aria-invalid={!!error}
            className={error ? "border-destructive focus-visible:ring-destructive" : ""}
          />
          {description && !error && <p className="text-xs text-muted-foreground">{description}</p>}
          {error && <p className="text-xs font-medium text-destructive">{error.message}</p>}
        </div>
      )}
    />
  );
}
