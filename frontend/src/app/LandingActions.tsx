"use client";

import Link from "next/link";
import { LayoutDashboard, LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";

/** Landing-page buttons: "Go to Dashboard" when signed in, otherwise sign in / register. */
export function LandingActions() {
  const { isAuthenticated } = useCurrentUser();

  if (isAuthenticated) {
    return (
      <Button asChild size="lg" className="gap-2">
        <Link href={ROUTES.DASHBOARD}>
          <LayoutDashboard className="h-4 w-4" />
          Go to Dashboard
        </Link>
      </Button>
    );
  }

  return (
    <>
      <Button asChild size="lg" className="gap-2">
        <Link href={ROUTES.LOGIN}>
          <LogIn className="h-4 w-4" />
          Sign In to CliniQ
        </Link>
      </Button>
      <Button asChild size="lg" variant="outline" className="gap-2">
        <Link href={ROUTES.REGISTER}>
          <UserPlus className="h-4 w-4" />
          Register as Patient
        </Link>
      </Button>
    </>
  );
}
