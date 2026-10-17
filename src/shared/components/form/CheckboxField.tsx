"use client";

import React from "react";
import { useFormContext, Controller, Control, FieldValues, Path } from "react-hook-form";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Label } from "@/shared/components/ui/label";

interface CheckboxFieldProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>;
  label: string;
  control?: Control<TFieldValues>;
  description?: string;
  disabled?: boolean;
  className?: string;
}

export function CheckboxField<TFieldValues extends FieldValues>({
  name,
  label,
  control,
  description,
  disabled,
  className = "",
}: CheckboxFieldProps<TFieldValues>) {
  const formContext = useFormContext<TFieldValues>();
  const effectiveControl = control || formContext?.control;

  if (!effectiveControl) {
    throw new Error(`CheckboxField for "${name}" must be used within a FormProvider or passed a control prop.`);
  }

  return (
    <Controller
      name={name}
      control={effectiveControl}
      render={({ field, fieldState: { error } }) => (
        <div className={`space-y-1.5 ${className}`}>
          <div className="flex items-start space-x-2">
            <Checkbox
              id={name}
              checked={field.value ?? false}
              onCheckedChange={field.onChange}
              disabled={disabled}
            />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor={name} className="cursor-pointer text-sm font-medium">
                {label}
              </Label>
              {description && (
                <p className="text-xs text-muted-foreground">{description}</p>
              )}
            </div>
          </div>
          {error && <p className="text-xs font-medium text-destructive">{error.message}</p>}
        </div>
      )}
    />
  );
}
