import Link from "next/link";
import { Stethoscope, CheckCircle2, LogIn, UserPlus, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { getCurrentUser } from "@/lib/server-api";

export default async function Home() {
  // The landing page must render even if the API is briefly unavailable.
  const isLoggedIn = await getCurrentUser().then(
    (user) => user !== null,
    () => false
  );

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12 text-center sm:px-6 lg:px-8">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg mb-6">
        <Stethoscope className="h-8 w-8" />
      </div>

      <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
        Welcome to <span className="text-primary">CliniQ</span>
      </h1>
      <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
        Modern Clinic Management System designed for community and institutional healthcare.
      </p>

      <div className="mt-8 flex flex-col sm:flex-row gap-3">
        {isLoggedIn ? (
          <Button asChild size="lg" className="gap-2">
            <Link href={ROUTES.DASHBOARD}>
              <LayoutDashboard className="h-4 w-4" />
              Go to Dashboard
            </Link>
          </Button>
        ) : (
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
        )}
      </div>

      <div className="mt-12 grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-2 text-left">
        <div className="flex items-start gap-2.5 rounded-lg border bg-card p-3 text-sm">
          <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <span className="text-muted-foreground">Comprehensive patient records & consultation history</span>
        </div>
        <div className="flex items-start gap-2.5 rounded-lg border bg-card p-3 text-sm">
          <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <span className="text-muted-foreground">In-person & online appointment scheduling</span>
        </div>
        <div className="flex items-start gap-2.5 rounded-lg border bg-card p-3 text-sm">
          <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <span className="text-muted-foreground">FEFO medicine stock tracking & reorder alerts</span>
        </div>
        <div className="flex items-start gap-2.5 rounded-lg border bg-card p-3 text-sm">
          <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <span className="text-muted-foreground">Role-based security for doctors, staff & patients</span>
        </div>
      </div>
    </div>
  );
}
