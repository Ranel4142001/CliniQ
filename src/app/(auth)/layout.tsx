import { ReactNode } from "react";
import { Stethoscope } from "lucide-react";

/**
 * Auth layout — clean centered card, no sidebar.
 * Wraps /login, /register, and /onboarding routes.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 px-4">
      {/* Brand mark */}
      <div className="mb-6 flex flex-col items-center gap-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow">
          <Stethoscope className="h-6 w-6" />
        </div>
        <span className="text-xl font-bold tracking-tight">CliniQ</span>
      </div>

      {/* Card container */}
      <div className="w-full max-w-md has-[[data-wide='true']]:max-w-3xl rounded-2xl border bg-background p-6 sm:p-8 shadow-sm transition-all duration-200">
        {children}
      </div>

      <p className="mt-6 text-xs text-muted-foreground">
        © {new Date().getFullYear()} CliniQ · Secure Healthcare Management
      </p>
    </div>
  );
}
