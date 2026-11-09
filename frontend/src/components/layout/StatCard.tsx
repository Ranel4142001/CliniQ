import React, { ReactNode } from "react";
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

export type StatTone = keyof typeof ICON_TONES;

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  tone?: StatTone;
  /** Colours the description to draw the eye, e.g. "Needs restocking". */
  isAlert?: boolean;
  trend?: {
    value: string | number;
    isPositive?: boolean;
    label?: string;
  };
  className?: string;
}

export function StatCard({
  title,
  value,
  description,
  icon,
  tone = "blue",
  isAlert = false,
  trend,
  className = "",
}: StatCardProps) {
  return (
    <Card
      className={cn(
        "overflow-hidden rounded-2xl border border-border/80 bg-card shadow-none transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
        className
      )}
    >
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{title}</p>
          {icon && (
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                ICON_TONES[tone]
              )}
            >
              {icon}
            </div>
          )}
        </div>
        <div className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {value}
        </div>
        {(description || trend) && (
          <div className="mt-2 flex items-center text-[13px] text-muted-foreground">
            {trend && (
              <span
                className={`mr-1.5 font-semibold ${
                  trend.isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"
                }`}
              >
                {trend.isPositive ? "+" : ""}
                {trend.value}
              </span>
            )}
            <span
              className={cn(
                "truncate",
                isAlert && value !== 0 && "font-semibold",
                isAlert && value !== 0 && tone === "red" && "text-rose-600 dark:text-rose-400",
                isAlert && value !== 0 && tone === "amber" && "text-amber-700 dark:text-amber-400"
              )}
            >
              {description || trend?.label}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
