import React, { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { FEATURE_STYLES } from "@/config/feature-colors";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
  className?: string;
  /** Route of the feature, e.g. ROUTES.MEDICINES; shows its coloured icon beside the title. */
  feature?: string;
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  className = "",
  feature,
}: PageHeaderProps) {
  const style = feature ? FEATURE_STYLES[feature] : undefined;
  const FeatureIcon = style?.icon;

  return (
    <div className={`mb-6 space-y-2 ${className}`}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav
          aria-label="Breadcrumbs"
          className="flex items-center space-x-1.5 text-xs text-muted-foreground"
        >
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={idx}>
                {idx > 0 && <ChevronRight className="h-3 w-3 text-muted-foreground/60" />}
                {crumb.href && !isLast ? (
                  <Link href={crumb.href} className="transition-colors hover:text-foreground">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className={isLast ? "font-medium text-foreground" : ""}>{crumb.label}</span>
                )}
              </React.Fragment>
            );
          })}
        </nav>
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
