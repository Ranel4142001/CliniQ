import Link from "next/link";
import { FileQuestion, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm">
        <FileQuestion className="h-8 w-8" />
      </div>

      <span className="text-sm font-semibold uppercase tracking-wider text-primary">404 Error</span>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Page Not Found
      </h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
        The page you are looking for doesn&apos;t exist, has been moved, or is temporarily
        unavailable.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button variant="default" asChild>
          <Link href={ROUTES.DASHBOARD} className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            <span>Go to Dashboard</span>
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href={ROUTES.LOGIN} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Login</span>
          </Link>
        </Button>
      </div>

      <p className="mt-12 text-xs text-muted-foreground">CliniQ · Secure Healthcare Management</p>
    </div>
  );
}
