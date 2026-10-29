"use client";

import { useEffect } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AppErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AppError({ error, reset }: AppErrorProps) {
  useEffect(() => {
    console.error("CliniQ In-App Error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed border-destructive/30 bg-destructive/5 p-8 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-4">
        <AlertCircle className="h-6 w-6" />
      </div>

      <h2 className="text-xl font-semibold tracking-tight text-foreground">
        Unable to Load Section
      </h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        There was a problem loading this part of the application. Please try
        refreshing the view.
      </p>

      {error.message && process.env.NODE_ENV === "development" && (
        <div className="mt-4 max-w-md rounded-md bg-destructive/10 p-2.5 font-mono text-xs text-destructive text-left overflow-x-auto">
          {error.message}
        </div>
      )}

      <div className="mt-6">
        <Button onClick={() => reset()} variant="default" className="flex items-center gap-2">
          <RotateCcw className="h-4 w-4" />
          <span>Reload View</span>
        </Button>
      </div>
    </div>
  );
}
