import { ReactNode } from "react";
import { Stethoscope } from "lucide-react";
import { AuthBrandPanel } from "@/features/auth/components/AuthBrandPanel";

/**
 * Auth layout for /login, /register and /onboarding.
 * Large screens: brand panel on the left, form on the right.
 * Wide forms (onboarding, marked with data-wide="true") use the full width instead.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="group/auth grid min-h-screen bg-background lg:grid-cols-2 lg:has-[[data-wide='true']]:grid-cols-1">
      <div className="contents lg:group-has-[[data-wide='true']]/auth:hidden">
        <AuthBrandPanel />
      </div>

      <main className="relative flex flex-col items-center justify-center overflow-hidden bg-muted/30 px-4 py-10 sm:px-6">
        {/* Background texture & glow, theme-aware */}
        <div aria-hidden className="auth-dots pointer-events-none absolute inset-0" />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[36rem] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl"
        />

        {/* Brand mark: shown when the brand panel is not */}
        <div className="relative mb-6 flex flex-col items-center gap-2 lg:hidden lg:group-has-[[data-wide='true']]/auth:flex">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
            <Stethoscope className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold tracking-tight">CliniQ</span>
        </div>

        <div className="relative w-full max-w-md rounded-2xl border bg-background/90 p-6 shadow-xl shadow-primary/5 backdrop-blur-sm transition-all duration-200 has-[[data-wide='true']]:max-w-3xl sm:p-8">
          {children}
        </div>

        <p className="relative mt-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} CliniQ · Secure Healthcare Management
        </p>
      </main>
    </div>
  );
}
