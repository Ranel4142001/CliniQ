import { Stethoscope, CheckCircle2 } from "lucide-react";
import { LandingActions } from "@/app/LandingActions";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12 text-center sm:px-6 lg:px-8">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
        <Stethoscope className="h-8 w-8" />
      </div>

      <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
        Welcome to <span className="text-primary">CliniQ</span>
      </h1>
      <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
        Modern Clinic Management System designed for community and institutional healthcare.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <LandingActions />
      </div>

      <div className="mt-12 grid max-w-xl grid-cols-1 gap-3 text-left sm:grid-cols-2">
        <div className="flex items-start gap-2.5 rounded-lg border bg-card p-3 text-sm">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <span className="text-muted-foreground">
            Comprehensive patient records & consultation history
          </span>
        </div>
        <div className="flex items-start gap-2.5 rounded-lg border bg-card p-3 text-sm">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <span className="text-muted-foreground">In-person & online appointment scheduling</span>
        </div>
        <div className="flex items-start gap-2.5 rounded-lg border bg-card p-3 text-sm">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <span className="text-muted-foreground">
            FEFO medicine stock tracking & reorder alerts
          </span>
        </div>
        <div className="flex items-start gap-2.5 rounded-lg border bg-card p-3 text-sm">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <span className="text-muted-foreground">
            Role-based security for doctors, staff & patients
          </span>
        </div>
      </div>
    </div>
  );
}
