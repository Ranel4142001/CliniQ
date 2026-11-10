import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { TONE_TILES, type Tone } from "@/lib/tones";

interface SectionCardProps {
  title: string;
  subtitle?: string;
  icon: ReactNode;
  tone?: Tone;
  /** Shown as a small count chip next to the title. */
  count?: number;
  children: ReactNode;
  className?: string;
}

/** White card with an icon-tile header, used for lists of alerts and similar sections. */
export function SectionCard({
  title,
  subtitle,
  icon,
  tone = "blue",
  count,
  children,
  className,
}: SectionCardProps) {
  return (
    <section
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-card",
        className
      )}
    >
      <div className="flex items-center gap-3 border-b border-border/60 px-5 py-4">
        <span
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
            TONE_TILES[tone]
          )}
        >
          {icon}
        </span>
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
            {title}
            {count !== undefined && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700 dark:bg-muted dark:text-slate-300">
                {count}
              </span>
            )}
          </h2>
          {subtitle && <p className="text-[13px] text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

/** Scrollable, divided list body for a SectionCard, so long lists don't stretch the page. */
export function SectionList({ children }: { children: ReactNode }) {
  return (
    <ul className="max-h-80 flex-1 divide-y divide-border/60 overflow-y-auto px-5">{children}</ul>
  );
}

/** Friendly one-line empty state for a SectionCard. */
export function SectionEmpty({ children }: { children: ReactNode }) {
  return <p className="px-5 py-8 text-center text-sm text-muted-foreground">{children}</p>;
}
