import React, { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
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
  trend,
  className = "",
}: StatCardProps) {
  return (
    <Card className={`overflow-hidden rounded-xl border border-border/80 bg-card/90 shadow-xs hover:shadow-md transition-all duration-200 ${className}`}>
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground tracking-wide uppercase">{title}</p>
            <div className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{value}</div>
          </div>
          {icon && (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-xs">
              {icon}
            </div>
          )}
        </div>
        {(description || trend) && (
          <div className="mt-2.5 flex items-center text-xs text-muted-foreground border-t border-border/40 pt-2">
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
            <span className="truncate">{description || trend?.label}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
