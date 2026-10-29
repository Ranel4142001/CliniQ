"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function RootError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log unexpected runtime error for diagnostics
    console.error("CliniQ Root Application Error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mb-6 shadow-sm">
        <AlertTriangle className="h-8 w-8" />
      </div>

      <span className="text-sm font-semibold tracking-wider text-destructive uppercase">
        System Error
      </span>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Something Went Wrong
      </h1>
      <p className="mt-4 max-w-md text-sm text-muted-foreground leading-relaxed">
        An unexpected application error occurred. You can retry the current
        action or return safely to the dashboard.
      </p>

      {error.message && process.env.NODE_ENV === "development" && (
        <div className="mt-4 max-w-lg rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-left font-mono text-xs text-destructive overflow-x-auto">
          {error.message}
        </div>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button onClick={() => reset()} variant="default" className="flex items-center gap-2">
          <RotateCcw className="h-4 w-4" />
          <span>Try Again</span>
        </Button>
        <Button variant="outline" asChild>
          <Link href={ROUTES.DASHBOARD} className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>
        </Button>
      </div>

      <p className="mt-12 text-xs text-muted-foreground">
        CliniQ · Secure Healthcare Management System
      </p>
    </div>
  );
}
