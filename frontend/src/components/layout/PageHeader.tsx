import React, { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { FEATURE_STYLES } from "@/config/feature-colors";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  /** Detail pages only: a small link back to the list they came from. */
  back?: { label: string; href: string };
  actions?: ReactNode;
  className?: string;
  /** Route of the feature, e.g. ROUTES.MEDICINES; shows its coloured icon beside the title. */
  feature?: string;
}

export function PageHeader({
  title,
  description,
  back,
  actions,
  className = "",
  feature,
}: PageHeaderProps) {
  const style = feature ? FEATURE_STYLES[feature] : undefined;
  const FeatureIcon = style?.icon;

  return (
    <div className={`mb-6 space-y-2 ${className}`}>
      {back && (
        <Link
          href={back.href}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-lg text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {back.label}
        </Link>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          {FeatureIcon && (
            <span
              className={cn(
                "hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl sm:flex",
                style?.tile
              )}
            >
              <FeatureIcon className="h-6 w-6" />
            </span>
          )}
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {title}
            </h1>
            {description && (
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 sm:text-[15px]">
                {description}
              </p>
            )}
          </div>
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
