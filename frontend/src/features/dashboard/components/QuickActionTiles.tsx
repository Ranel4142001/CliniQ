import React from "react";
import Link from "next/link";
import { BarChart3, CalendarPlus, Pill, UserPlus, type LucideIcon } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import { TONE_TILES, type Tone } from "@/lib/tones";

interface QuickAction {
  title: string;
  href: string;
  icon: LucideIcon;
  tone: Tone;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    title: "Register patient",
    href: ROUTES.PATIENTS,
    icon: UserPlus,
    tone: "blue",
  },
  {
    title: "Book appointment",
    href: ROUTES.APPOINTMENTS,
    icon: CalendarPlus,
    tone: "teal",
  },
  {
    title: "Manage stock",
    href: ROUTES.MEDICINES,
    icon: Pill,
    tone: "amber",
  },
  {
    title: "View reports",
    href: ROUTES.REPORTS,
    icon: BarChart3,
    tone: "violet",
  },
];

/** One compact row of shortcuts to the most common tasks. */
export function QuickActionTiles() {
  return (
    <nav aria-label="Quick actions" className="flex flex-wrap gap-2.5">
      {QUICK_ACTIONS.map(({ title, href, icon: Icon, tone }) => (
        <Link
          key={title}
          href={href}
          className="inline-flex h-11 items-center gap-2.5 rounded-xl border border-border/80 bg-card pl-1.5 pr-4 text-sm font-semibold text-foreground transition hover:border-primary/30 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span
            className={cn("flex h-8 w-8 items-center justify-center rounded-lg", TONE_TILES[tone])}
          >
            <Icon className="h-4 w-4" />
          </span>
          {title}
        </Link>
      ))}
    </nav>
  );
}
