import React, { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface DashboardPanelProps {
  title: string;
  linkLabel: string;
  href: string;
  children: ReactNode;
}

/** White card with a title and a "see more" link, used for each dashboard list. */
export function DashboardPanel({ title, linkLabel, href, children }: DashboardPanelProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border/80 bg-card">
      <div className="flex items-center justify-between gap-2 border-b border-border/60 px-5 py-3.5">
        <h2 className="text-base font-semibold text-foreground sm:text-lg">{title}</h2>
        <Link
          href={href}
          className="inline-flex min-h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {linkLabel} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}

interface PanelEmptyProps {
  icon: ReactNode;
  title: string;
  description?: string;
  /** e.g. "bg-blue-50 text-blue-600" */
  tone: string;
  action?: ReactNode;
}

/** Friendly empty state inside a dashboard panel. */
export function PanelEmpty({ icon, title, description, tone, action }: PanelEmptyProps) {
  return (
    <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
      <span className={`mb-1 flex h-14 w-14 items-center justify-center rounded-full ${tone}`}>
        {icon}
      </span>
      <p className="text-[15px] font-semibold text-foreground">{title}</p>
      {description && <p className="max-w-xs text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
