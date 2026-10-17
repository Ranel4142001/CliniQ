"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { ROUTES } from "@/shared/constants/routes";

/**
 * Post-registration onboarding page.
 * Shown after account creation to orient new users.
 */
export default function OnboardingPage() {
  const router = useRouter();

  return (
    <>
      <div className="mb-6 flex flex-col items-center text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">You&apos;re all set!</h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-xs">
          Your CliniQ account has been created. An administrator will assign your
          role before you can access clinical features.
        </p>
      </div>

      <ul className="mb-8 space-y-2 rounded-lg border bg-muted/40 p-4 text-sm">
        {[
          "Your account is pending role assignment.",
          "You will receive access once approved.",
          "Contact your clinic admin if urgent.",
        ].map((item) => (
          <li key={item} className="flex items-start gap-2 text-muted-foreground">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            {item}
          </li>
        ))}
      </ul>

      <Button className="w-full" onClick={() => router.push(ROUTES.DASHBOARD)}>
        Go to Dashboard
      </Button>
    </>
  );
}
