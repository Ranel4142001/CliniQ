import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/** Soft colour families for status pills; each pairs a tinted pill with a solid dot. */
export const STATUS_TONES = {
  blue: {
    pill: "bg-blue-50 text-blue-700 ring-blue-600/15 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-400/20",
    dot: "bg-blue-500",
  },
  green: {
    pill: "bg-emerald-50 text-emerald-700 ring-emerald-600/15 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/20",
    dot: "bg-emerald-500",
  },
  amber: {
    pill: "bg-amber-50 text-amber-800 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/20",
    dot: "bg-amber-500",
  },
  red: {
    pill: "bg-rose-50 text-rose-700 ring-rose-600/15 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-400/20",
    dot: "bg-rose-500",
  },
  violet: {
    pill: "bg-violet-50 text-violet-700 ring-violet-600/15 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-400/20",
    dot: "bg-violet-500",
  },
  neutral: {
    pill: "bg-slate-100 text-slate-700 ring-slate-500/15 dark:bg-slate-500/10 dark:text-slate-300 dark:ring-slate-400/20",
    dot: "bg-slate-400",
  },
} as const;

export type StatusTone = keyof typeof STATUS_TONES;

/** A soft tinted pill with a dot, for statuses that have no status map. */
export function TonePill({
  tone,
  label,
  className,
}: {
  tone: StatusTone;
  label: string;
  className?: string;
}) {
  const colors = STATUS_TONES[tone];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        colors.pill,
        className
      )}
    >
      <span aria-hidden="true" className={cn("h-1.5 w-1.5 rounded-full", colors.dot)} />
      {label}
    </span>
  );
}

export interface StatusConfig {
  label: string;
  /** Preferred: a soft pill with a dot. */
  tone?: StatusTone;
  variant?: "default" | "secondary" | "destructive" | "outline";
  className?: string;
}

export type StatusMap<T extends string> = Record<T, StatusConfig>;

interface StatusBadgeProps<T extends string> {
  status: T;
  statusMap: StatusMap<T>;
  className?: string;
}

export function StatusBadge<T extends string>({
  status,
  statusMap,
  className = "",
}: StatusBadgeProps<T>) {
  const config: StatusConfig = statusMap[status] || { label: status, tone: "neutral" };

  if (config.tone) {
    return <TonePill tone={config.tone} label={config.label} className={className} />;
  }

  return (
    <Badge
      variant={config.variant ?? "secondary"}
      className={`font-medium ${config.className ?? ""} ${className}`}
    >
      {config.label}
    </Badge>
  );
}
