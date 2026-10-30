"use client";

import React from "react";
import { useFormContext, Controller, Control, FieldValues, Path } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TextFieldProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>;
  label: string;
  control?: Control<TFieldValues>;
  type?: string;
  placeholder?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export function TextField<TFieldValues extends FieldValues>({
  name,
  label,
  control,
  type = "text",
  placeholder,
  description,
  required,
  disabled,
  className = "",
}: TextFieldProps<TFieldValues>) {
  const formContext = useFormContext<TFieldValues>();
  const effectiveControl = control || formContext?.control;

  if (!effectiveControl) {
    throw new Error(
      `TextField for "${name}" must be used within a FormProvider or passed a control prop.`
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
          <Input
            {...field}
            id={name}
            type={type}
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
