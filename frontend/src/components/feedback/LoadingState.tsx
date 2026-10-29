import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({ message = "Loading data...", className = "" }: LoadingStateProps) {
  return (
    <div
      className={`flex min-h-[160px] flex-col items-center justify-center gap-3 p-6 text-muted-foreground ${className}`}
      role="status"
      aria-live="polite"
    >
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
}
