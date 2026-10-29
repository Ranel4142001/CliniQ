"use client";

import React from "react";
import { useFormContext, Controller, Control, FieldValues, Path } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectFieldProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>;
  label: string;
  options: SelectOption[];
  control?: Control<TFieldValues>;
  placeholder?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export function SelectField<TFieldValues extends FieldValues>({
  name,
  label,
  options,
  control,
  placeholder = "Select an option",
  description,
  required,
  disabled,
  className = "",
}: SelectFieldProps<TFieldValues>) {
  const formContext = useFormContext<TFieldValues>();
  const effectiveControl = control || formContext?.control;

  if (!effectiveControl) {
    throw new Error(`SelectField for "${name}" must be used within a FormProvider or passed a control prop.`);
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
          <Select
            disabled={disabled}
            onValueChange={field.onChange}
            value={field.value ?? ""}
          >
            <SelectTrigger
              id={name}
              className={error ? "border-destructive focus:ring-destructive" : ""}
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} disabled={opt.disabled}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {description && !error && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
          {error && <p className="text-xs font-medium text-destructive">{error.message}</p>}
        </div>
      )}
    />
  );
}
