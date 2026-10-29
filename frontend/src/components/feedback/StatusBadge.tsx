import React from "react";
import { Badge } from "@/components/ui/badge";

export interface StatusConfig {
  label: string;
  variant?: "default" | "secondary" | "destructive" | "outline";
  className?: string;
}

export type StatusMap<T extends string> = Record<T, StatusConfig>;

interface StatusBadgeProps<T extends string> {
  status: T;
  statusMap: StatusMap<T>;
  className?: string;
}

export function StatusBadge<T extends string>({
  status,
  statusMap,
  className = "",
}: StatusBadgeProps<T>) {
  const config = statusMap[status] || {
    label: status,
    variant: "secondary" as const,
  };

  return (
    <Badge
      variant={config.variant ?? "secondary"}
      className={`font-medium ${config.className ?? ""} ${className}`}
    >
      {config.label}
    </Badge>
  );
}
