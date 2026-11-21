import Link from "next/link";
import {
  BarChart3,
  Calendar,
  ClipboardList,
  FileText,
  History,
  Lock,
  MonitorSmartphone,
  Pill,
  ShieldCheck,
  Stethoscope,
  Users,
  type LucideIcon,
} from "lucide-react";
import { LandingActions } from "@/app/LandingActions";
import { Button } from "@/components/ui/button";
import { InitialsAvatar } from "@/components/feedback/InitialsAvatar";
import { TonePill, type StatusTone } from "@/components/feedback/StatusBadge";
import { ROUTES } from "@/constants/routes";
import { TONE_TILES, type Tone } from "@/lib/tones";
import { cn } from "@/lib/utils";

const FEATURES: Array<{ icon: LucideIcon; tone: Tone; title: string; text: string }> = [
  {
    icon: Users,
    tone: "teal",
    title: "Patient records",
    text: "One profile per patient with demographics, allergies, conditions and consent.",
  },
  {
    icon: Calendar,
    tone: "violet",
    title: "Appointments",
    text: "In-person and online visits with clinician schedules and no double booking.",
  },
  {
    icon: ClipboardList,
    tone: "blue",
    title: "Consultations",
    text: "Vitals, findings, diagnosis and treatment plan, written by the assigned clinician.",
  },
  {
    icon: FileText,
    tone: "red",
    title: "Prescriptions",
    text: "Digital prescriptions issued by clinicians and dispensed at the front desk.",
  },
  {
    icon: Pill,
    tone: "amber",
    title: "Medicine inventory",
    text: "Batch tracking with first-expiry-first-out dispensing and low-stock alerts.",
  },
  {
    icon: BarChart3,
    tone: "indigo",
    title: "Reports",
    text: "Filter by date and export appointments, stock and prescriptions to CSV or PDF.",
  },
];

/** The standard path of a clinic visit, each step owned by one role. */
const VISIT_FLOW = [
  { step: "Register", who: "Front desk or patient", text: "Patient record and consent" },
  { step: "Book", who: "Front desk or patient", text: "Pick a clinician and time slot" },
  { step: "Consult", who: "Clinician", text: "Notes, diagnosis and treatment" },
  { step: "Dispense", who: "Front desk", text: "Prescription filled from stock" },
] as const;

const TRUST_POINTS = [
  { icon: Lock, label: "Need-to-know access by role" },
  { icon: History, label: "Audit trail on patient records" },
  { icon: MonitorSmartphone, label: "Works on phone, tablet and desktop" },
] as const;

/** Illustrative rows for the product preview (decorative, not real data). */
const PREVIEW_VISITS: Array<{
  name: string;
  time: string;
  type: string;
  tone: StatusTone;
  status: string;
}> = [
  { name: "Ana Reyes", time: "9:00 AM", type: "In-person", tone: "green", status: "Confirmed" },
  { name: "Marco Lim", time: "9:30 AM", type: "Online", tone: "blue", status: "In consult" },
  { name: "Liza Santos", time: "10:00 AM", type: "In-person", tone: "amber", status: "Pending" },
];

const PREVIEW_STATS = [
  { label: "Today", value: "12" },
  { label: "Pending", value: "4" },
  { label: "Low stock", value: "2" },
] as const;

function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm",
        className
      )}
    >
      <Stethoscope className="h-5 w-5" aria-hidden="true" />
    </span>
  );
}

/** A small, static picture of the dashboard. Hidden from assistive tech: it is decoration. */
function ProductPreview() {
  return (
    <div aria-hidden="true" className="relative">
      <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-br from-primary/15 via-primary/5 to-transparent blur-2xl" />
      <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-card-hover">
        <div className="flex items-center gap-1.5 border-b border-border/70 bg-muted/50 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
          <span className="ml-3 text-xs font-medium text-muted-foreground">Dashboard</span>
        </div>
        <div className="space-y-4 p-5">
          <div className="grid grid-cols-3 gap-3">
            {PREVIEW_STATS.map((stat) => (
              <div key={stat.label} className="rounded-xl border border-border/70 p-3">
                <p className="text-[11px] font-medium text-muted-foreground">{stat.label}</p>
                <p className="mt-1 text-2xl font-bold tracking-tight">{stat.value}</p>
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-border/70">
            <p className="border-b border-border/70 px-4 py-2.5 text-xs font-semibold">
              Today&apos;s appointments
            </p>
            <ul className="divide-y divide-border/70">
              {PREVIEW_VISITS.map((visit) => (
                <li key={visit.name} className="flex items-center gap-3 px-4 py-3">
                  <InitialsAvatar name={visit.name} className="h-8 w-8 text-xs" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{visit.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {visit.time} · {visit.type}
                    </p>
                  </div>
                  <TonePill tone={visit.tone} label={visit.status} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href={ROUTES.HOME} className="flex items-center gap-2.5 rounded-lg">
            <BrandMark />
            <span className="text-lg font-bold tracking-tight">ClinicBase</span>
          </Link>
          <Button asChild variant="ghost" size="sm">
            <Link href={ROUTES.LOGIN}>Sign in</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-canvas">
          <div aria-hidden="true" className="auth-dots absolute inset-0" />
          <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                Clinic management system
              </p>
              <h1 className="mt-5 text-balance text-4xl font-extrabold leading-[1.1] tracking-tight text-foreground sm:text-5xl">
                Every visit, from check-in to <span className="text-primary">prescription</span>.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                ClinicBase keeps patient records, appointments, consultations, prescriptions and
                medicine stock in one place, so your clinic team works from the same record.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <LandingActions />
              </div>
              <ul className="mt-8 flex flex-col gap-2.5 text-sm text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-x-6">
                {TRUST_POINTS.map(({ icon: Icon, label }) => (
                  <li key={label} className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
                    {label}
                  </li>
                ))}
              </ul>
            </div>
            <ProductPreview />
          </div>
        </section>

        {/* Features */}
        <section
          aria-labelledby="features-heading"
          className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-20"
        >
          <div className="max-w-2xl">
            <h2 id="features-heading" className="text-balance text-3xl font-bold tracking-tight">
              Everything the clinic runs on
            </h2>
            <p className="mt-3 text-muted-foreground">
              Each part is built for the people who use it: front desk, clinicians, administrators
              and patients.
            </p>
          </div>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, tone, title, text }) => (
              <li
                key={title}
                className="rounded-2xl border border-border/80 bg-card p-6 shadow-card transition duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-card-hover"
              >
                <span
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-xl",
                    TONE_TILES[tone]
                  )}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 font-semibold">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{text}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Visit flow */}
        <section aria-labelledby="flow-heading" className="border-y border-border/70 bg-canvas">
          <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
            <h2 id="flow-heading" className="text-balance text-3xl font-bold tracking-tight">
              How a visit flows
            </h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Every step has a clear owner, and each role sees only what that step needs.
            </p>
            <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {VISIT_FLOW.map(({ step, who, text }, index) => (
                <li
                  key={step}
                  className="relative rounded-2xl border border-border/80 bg-card p-5 shadow-card"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {index + 1}
                  </span>
                  <h3 className="mt-4 font-semibold">{step}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{text}</p>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-primary">
                    {who}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </main>

      <footer className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:px-6">
        <span className="flex items-center gap-2">
          <BrandMark className="h-7 w-7 rounded-lg [&_svg]:h-4 [&_svg]:w-4" />
          <span className="font-semibold text-foreground">ClinicBase</span>
        </span>
        <span>© {new Date().getFullYear()} ClinicBase · Secure healthcare management</span>
      </footer>
    </div>
  );
}
