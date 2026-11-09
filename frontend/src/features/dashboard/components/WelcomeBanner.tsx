"use client";

import React, { ReactNode } from "react";
import { format } from "date-fns";
import { greetingForHour, greetingName } from "@/features/dashboard/utils/greeting";

interface WelcomeBannerProps {
  fullName?: string | null;
  summary: string;
  /** Buttons on the right; use the `bannerButton` styles below. */
  actions?: ReactNode;
}

/** White pill and outlined variants for buttons placed on the blue banner. */
export const BANNER_BUTTON = {
  primary:
    "inline-flex h-11 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-blue-700 shadow-sm transition hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
  secondary:
    "inline-flex h-11 items-center gap-2 rounded-xl border border-white/40 bg-white/10 px-4 text-sm font-semibold text-white transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
} as const;

/** Blue greeting card at the top of the dashboard: who you are, what needs attention, what to do next. */
export function WelcomeBanner({ fullName, summary, actions }: WelcomeBannerProps) {
  const now = new Date();

  return (
    <section className="relative overflow-hidden rounded-2xl bg-primary p-6 text-primary-foreground shadow-sm sm:p-8">
      <svg
        aria-hidden="true"
        viewBox="0 0 360 360"
        fill="none"
        className="pointer-events-none absolute -right-24 -top-28 h-[360px] w-[360px] opacity-20"
      >
        <circle cx="180" cy="180" r="70" stroke="currentColor" strokeWidth="2" />
        <circle cx="180" cy="180" r="120" stroke="currentColor" strokeWidth="2" />
        <circle cx="180" cy="180" r="170" stroke="currentColor" strokeWidth="2" />
      </svg>
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl space-y-2">
          <p className="text-sm font-medium text-blue-100">{format(now, "EEEE, MMMM d")}</p>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {greetingForHour(now.getHours())}, {greetingName(fullName)}
          </h1>
          <p className="text-[15px] leading-relaxed text-blue-50">{summary}</p>
        </div>
        {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
      </div>
    </section>
  );
}
