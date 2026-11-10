import React, { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/** Icon tile colours; `blue` matches the primary brand colour. */
const ICON_TONES = {
  blue: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300",
  teal: "bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300",
  amber: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
  red: "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300",
  violet: "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300",
} as const;

const ALERT_TEXT: Partial<Record<keyof typeof ICON_TONES, string>> = {
  red: "text-rose-600 dark:text-rose-400",
  amber: "text-amber-700 dark:text-amber-400",
};

export type StatTone = keyof typeof ICON_TONES;

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  tone?: StatTone;
  /** Colours the description to draw the eye when the value is not zero. */
  isAlert?: boolean;
  trend?: {
    value: string | number;
    isPositive?: boolean;
    label?: string;
  };
  className?: string;
  /** Makes the whole card a shortcut to the matching page. */
  href?: string;
}

/** Title and icon on top, a large number, then one short line of context. */
export function StatCard({
  title,
  value,
  description,
  icon,
  tone = "blue",
  isAlert = false,
  trend,
  className = "",
  href,
}: StatCardProps) {
  const showAlert = isAlert && value !== 0;

  const card = (
    <Card
      className={cn(
        "h-full rounded-2xl border border-border/80 bg-card shadow-none",
        href && "transition group-hover:border-primary/40 group-hover:shadow-md",
        className
      )}
    >
      <CardContent className="flex h-full flex-col p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="truncate text-[13px] font-semibold text-foreground">{title}</p>
          {icon && (
            <span
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg [&_svg]:h-4 [&_svg]:w-4",
                ICON_TONES[tone]
              )}
            >
              {icon}
            </span>
          )}
        </div>
        <p className="mt-4 text-3xl font-bold tracking-tight text-foreground">{value}</p>
        {(description || trend) && (
          <p className="mt-1.5 truncate text-xs text-muted-foreground">
            {trend && (
              <span
                className={cn(
                  "mr-1.5 font-semibold",
                  trend.isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"
                )}
              >
                {trend.isPositive ? "+" : ""}
                {trend.value}
              </span>
            )}
            <span className={cn(showAlert && "font-semibold", showAlert && ALERT_TEXT[tone])}>
              {description || trend?.label}
            </span>
          </p>
        )}
        {href && (
          <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary opacity-80 group-hover:opacity-100">
            Open <ChevronRight className="h-3.5 w-3.5" />
          </span>
        )}
      </CardContent>
    </Card>
  );

  if (!href) return card;
  return (
    <Link
      href={href}
      aria-label={`${title}: ${value}. Open`}
      className="group block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      {card}
    </Link>
  );
}
