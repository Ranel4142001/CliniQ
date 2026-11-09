import React from "react";
import Link from "next/link";
import { BarChart3, CalendarPlus, Pill, UserPlus, type LucideIcon } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

interface QuickAction {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  tile: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    title: "Register patient",
    description: "Add a new patient record",
    href: ROUTES.PATIENTS,
    icon: UserPlus,
    tile: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300",
  },
  {
    title: "Book appointment",
    description: "In-person or online visit",
    href: ROUTES.APPOINTMENTS,
    icon: CalendarPlus,
    tile: "bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300",
  },
  {
    title: "Manage stock",
    description: "Medicines and batches",
    href: ROUTES.MEDICINES,
    icon: Pill,
    tile: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
  },
  {
    title: "View reports",
    description: "Visits, prescriptions, stock",
    href: ROUTES.REPORTS,
    icon: BarChart3,
    tile: "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300",
  },
];

/** Large, tappable shortcuts to the most common front-desk tasks. */
export function QuickActionTiles() {
  return (
    <section aria-labelledby="quick-actions" className="space-y-3">
      <h2 id="quick-actions" className="text-lg font-semibold tracking-tight text-foreground">
        Quick actions
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {QUICK_ACTIONS.map(({ title, description, href, icon: Icon, tile }) => (
          <Link
            key={title}
            href={href}
            className="group flex items-center gap-4 rounded-2xl border border-border/80 bg-card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span
              className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", tile)}
            >
              <Icon className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className="block text-[15px] font-semibold text-foreground group-hover:text-primary">
                {title}
              </span>
              <span className="block truncate text-[13px] text-muted-foreground">
                {description}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
