import React from "react";
import Link from "next/link";
import { BarChart3, CalendarPlus, Pill, UserPlus, type LucideIcon } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

interface QuickAction {
  title: string;
  href: string;
  icon: LucideIcon;
  tile: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    title: "Register patient",
    href: ROUTES.PATIENTS,
    icon: UserPlus,
    tile: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300",
  },
  {
    title: "Book appointment",
    href: ROUTES.APPOINTMENTS,
    icon: CalendarPlus,
    tile: "bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300",
  },
  {
    title: "Manage stock",
    href: ROUTES.MEDICINES,
    icon: Pill,
    tile: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
  },
  {
    title: "View reports",
    href: ROUTES.REPORTS,
    icon: BarChart3,
    tile: "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300",
  },
];

/** One compact row of shortcuts to the most common tasks. */
export function QuickActionTiles() {
  return (
    <nav aria-label="Quick actions" className="flex flex-wrap gap-2.5">
      {QUICK_ACTIONS.map(({ title, href, icon: Icon, tile }) => (
        <Link
          key={title}
          href={href}
          className="inline-flex h-11 items-center gap-2.5 rounded-xl border border-border/80 bg-card pl-1.5 pr-4 text-sm font-semibold text-foreground transition hover:border-primary/30 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className={cn("flex h-8 w-8 items-center justify-center rounded-lg", tile)}>
            <Icon className="h-4 w-4" />
          </span>
          {title}
        </Link>
      ))}
    </nav>
  );
}
