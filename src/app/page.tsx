import Link from "next/link";
import { Stethoscope, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

export default function Home() {
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
        <Button asChild size="lg" className="gap-2">
          <Link href="/sample">
            Explore Foundation Demo <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="mt-12 grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-2 text-left">
        <div className="flex items-start gap-2.5 rounded-lg border bg-card p-3 text-sm">
          <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <span className="text-muted-foreground">Feature-based architecture & strict typing</span>
        </div>
        <div className="flex items-start gap-2.5 rounded-lg border bg-card p-3 text-sm">
          <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <span className="text-muted-foreground">Reusable building blocks: DataTable & FormDialog</span>
        </div>
        <div className="flex items-start gap-2.5 rounded-lg border bg-card p-3 text-sm">
          <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <span className="text-muted-foreground">Integrated feedback states & error mapping</span>
        </div>
        <div className="flex items-start gap-2.5 rounded-lg border bg-card p-3 text-sm">
          <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <span className="text-muted-foreground">Role-based navigation & permissions</span>
        </div>
      </div>
    </div>
  );
}
