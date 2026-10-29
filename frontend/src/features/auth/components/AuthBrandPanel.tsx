import { CalendarCheck, ClipboardList, Pill, ShieldCheck, Stethoscope } from "lucide-react";

const HIGHLIGHTS = [
  {
    icon: ClipboardList,
    title: "Patient records",
    text: "Complete histories, vitals and consultation notes.",
  },
  {
    icon: CalendarCheck,
    title: "Smart scheduling",
    text: "In-person and online visits without double booking.",
  },
  {
    icon: Pill,
    title: "Prescriptions & stock",
    text: "Digital Rx with first-expiry-first-out dispensing.",
  },
] as const;

/** Decorative brand side of the auth screens (large screens only). */
export function AuthBrandPanel() {
  return (
    <aside className="relative hidden overflow-hidden bg-gradient-to-br from-primary via-primary to-blue-900 text-white lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
      {/* Texture & light */}
      <div aria-hidden className="auth-grid absolute inset-0" />
      <div
        aria-hidden
        className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-white/15 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute -bottom-32 right-0 h-[28rem] w-[28rem] rounded-full bg-sky-300/20 blur-3xl"
      />

      <div className="relative flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25 backdrop-blur">
          <Stethoscope className="h-6 w-6" />
        </div>
        <div>
          <p className="text-lg font-bold tracking-tight">CliniQ</p>
          <p className="text-xs font-medium uppercase tracking-widest text-white/70">
            Healthcare OS
          </p>
        </div>
      </div>

      <div className="relative max-w-md">
        <h2 className="text-4xl font-bold leading-tight tracking-tight xl:text-5xl">
          Care, coordinated
          <span className="block text-blue-100/90">from check-in to prescription.</span>
        </h2>
        <ul className="mt-10 space-y-5">
          {HIGHLIGHTS.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/20">
                <Icon className="h-5 w-5" />
              </span>
              <span>
                <span className="block font-semibold">{title}</span>
                <span className="block text-sm text-white/75">{text}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <p className="relative flex items-center gap-2 text-sm text-white/70">
        <ShieldCheck className="h-4 w-4" />
        Role-based access for clinicians, staff and patients
      </p>
    </aside>
  );
}
