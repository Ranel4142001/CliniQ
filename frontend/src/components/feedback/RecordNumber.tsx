import React from "react";
import { cn } from "@/lib/utils";

const VARIANTS = {
  /** Highlighted chip, for a record's own number column. */
  chip: "rounded-lg bg-blue-50 px-2 py-1 text-xs font-medium text-blue-900 dark:bg-blue-500/10 dark:text-blue-200",
  /** Small grey line under a name. */
  subtle: "text-[11px] text-muted-foreground",
  /** Coloured text beside a heading. */
  accent: "text-xs font-semibold text-primary",
} as const;

/**
 * A patient or prescription number such as PT-261110-147. Never wraps, so the
 * number stays readable in narrow columns and at any zoom level.
 */
export function RecordNumber({
  value,
  variant = "subtle",
  className,
}: {
  value?: string | null;
  variant?: keyof typeof VARIANTS;
  className?: string;
}) {
  if (!value) return null;
  return (
    <span className={cn("whitespace-nowrap font-mono", VARIANTS[variant], className)}>{value}</span>
  );
}
