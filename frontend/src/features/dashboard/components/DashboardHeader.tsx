"use client";

import React, { ReactNode } from "react";
import { greetingForHour, greetingName } from "@/features/dashboard/utils/greeting";

interface DashboardHeaderProps {
  fullName?: string | null;
  summary: string;
  /** Buttons on the right; use HEADER_BUTTON styles. */
  actions?: ReactNode;
}

/** Solid and outlined button styles for the dashboard header. */
export const HEADER_BUTTON = {
  primary:
    "inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm shadow-primary/20 transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  secondary:
    "inline-flex h-11 items-center gap-2 rounded-xl border border-border/80 bg-card px-4 text-sm font-semibold text-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
} as const;

/** Page title row: greeting and today's summary on the left, main actions on the right. */
export function DashboardHeader({ fullName, summary, actions }: DashboardHeaderProps) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0 space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {greetingForHour(new Date().getHours())}, {greetingName(fullName)}
        </h1>
        <p className="text-sm text-muted-foreground sm:text-[15px]">{summary}</p>
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-3">{actions}</div>}
    </header>
  );
}
