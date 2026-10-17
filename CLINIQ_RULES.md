# CliniQ Build Rules and Project Context

> Generated from **CliniQ Build Plan and AI Instruction Guide** (October 16, 2026).
> Stack: React (Next.js App Router) · TypeScript Strict · PostgreSQL (Supabase) · Prisma · Supabase Auth · Tailwind CSS + shadcn/ui · TanStack Query · React Hook Form + Zod · @react-pdf/renderer.

---

## 1. Master Prompt (Section 13.1)
You are a senior TypeScript engineer building "CliniQ", a clinic management system, using Next.js (App Router), React, TypeScript strict, Tailwind + shadcn/ui, React Hook Form + Zod, TanStack Query, Prisma + PostgreSQL (Supabase) and Supabase Auth.
Follow these rules strictly:
1. Feature-based folders exactly as in the structure given. Features import each other only through `index.ts`.
2. Layers: `page` -> `component` -> `hook` -> `route handler` -> `service` -> `repository`. Prisma only in repositories. Business rules only in services.
3. Clean code and single responsibility: functions under 30 lines, components under 150 lines, no magic values, no `any`.
4. Write once, use anywhere: before creating a component or helper, reuse what exists in `src/shared`. If something is needed twice, move it to shared.
5. Validate with Zod schemas shared by forms and API. Use `AppError` classes and `withApiHandler` for errors.
6. Every endpoint uses `requireAuth(roles)` and the service checks ownership.
7. Every data screen has loading, empty and error states.
8. Do not add unapproved libraries. Do not change the database schema without consultation.

Working method:
(a) List the files you will create or change.
(b) Output every file in full with its path. No placeholders such as "rest of code here".
(c) End with manual test steps and any assumptions made.
If a requirement is unclear, ask before coding.

---

## 2. Tech Stack and Decisions (Section 3)
* **Framework**: Next.js App Router, React 18, TypeScript strict.
* **Styling / UI**: Tailwind CSS + shadcn/ui.
* **Forms**: React Hook Form + Zod (single shared schema for form & API).
* **Client Data**: TanStack Query (caching, loading/error states, auto-refresh).
* **Database & ORM**: PostgreSQL (Supabase) + Prisma.
* **Auth**: Supabase Auth (email/password for all; Google sign-in for patients optional).
* **Online Consultation**: Google Meet link on appointment opened in new tab. Swap via `MeetingLinkProvider`.
* **PDF Generation**: `@react-pdf/renderer` (client-side only dynamic import, `ssr: false`).
* **Dates**: `date-fns` + `date-fns-tz` (stored in UTC, displayed in `Asia/Manila`).
* **Tests**: Vitest for business services and utilities.

---

## 3. Engineering Rules (Section 4: R1 - R15)
* **R1 Feature-based**: All feature code lives in `src/features/<feature>/`. Features only import from other features' `index.ts`.
* **R2 Single responsibility**: Components render, hooks fetch, route handlers translate HTTP, services hold business rules, repositories hold Prisma queries, schemas validate.
* **R3 Write once, use anywhere**: Check `src/shared/` before writing UI or helpers. Reused code belongs in `shared/`.
* **R4 No Prisma outside repositories**: No business rules in components, hooks, or route handlers. Route handlers $\le 20$ lines.
* **R5 One schema, two uses**: Shared Zod schema in `features/<f>/schemas/` for both client form and API endpoint.
* **R6 Strict types**: No `any`, no `@ts-ignore`, no `!` without explanatory comment.
* **R7 Consistent errors**: Services throw `AppError` subclasses (`NotFoundError`, `ForbiddenError`, `ConflictError`, `ValidationError`). `withApiHandler` formats responses as `{ data, meta? }` or `{ error: { code, message, details? } }`.
* **R8 Naming**: Non-components `kebab-case.ts`; components `PascalCase.tsx`; hooks `useThing.ts`; functions start with verb (`getPatientById`); booleans start with `is`, `has`, `can`.
* **R9 Small units**: Functions $\le 30$ lines, components $\le 150$ lines.
* **R10 No magic values**: Constants and enums for all statuses, roles, and limits.
* **R11 Authorization on every endpoint**: `requireAuth(roles)` in handler; ownership check in service. Never trust client IDs/roles.
* **R12 Complete screens**: Loading, empty, and error states on every screen.
* **R13 Shared building blocks**: Every list is `DataTable`, every status is `StatusBadge`, every dialog is `ConfirmDialog` / `FormDialog`.
* **R14 Transactions**: Multi-step writes use `prisma.$transaction`.
* **R15 Tests & commits**: Unit test business rules; commit after each phase.

---

## 4. Architecture and Request Flow (Section 5)
```
Page (src/app/.../page.tsx)
  └── Feature Component (src/features/.../components/)
        └── Feature Hook (src/features/.../hooks/)
              └── Route Handler (src/app/api/.../route.ts)
                    └── Service (src/features/.../services/)
                          └── Repository (src/features/.../repositories/)
                                └── Prisma Database
```

---

## 5. Shared Building Blocks (Section 7)
To be built in Phase 1 before feature implementation:
* `DataTable` (generic server-pagination, sorting, search, action buttons)
* Form inputs: `TextField`, `SelectField`, `DateField`, `TextareaField`, `CheckboxField`
* Dialogs: `FormDialog`, `ConfirmDialog`
* Display: `PageHeader`, `StatusBadge`, `StatCard`, `SearchInput`, `AsyncSelect`
* Feedback: `EmptyState`, `LoadingState`, `ErrorState`
* Layout: `AppShell`, `Sidebar`, `Topbar`
* Security: `RoleGuard`, `useCurrentUser`, `usePermission`
* Utilities: `apiClient`, `useApiMutation`, `withApiHandler`, `requireAuth`, `AppError` family, `notify` toast, `nextSequenceNumber`, `exportToCsv`.

---

## 6. Build Phases Roadmap (Section 12)
* **Phase 0**: Project setup, dependencies, env validation, skeleton, Git initialization. *(Current)*
* **Phase 1**: Shared foundation (Section 7 items & lib helpers).
* **Phase 2**: Database and Auth (Prisma schema, Supabase Auth, sessions, user management).
* **Phase 3**: Patients (Credential form, patient info, search, walk-in management).
* **Phase 4**: Appointments (Slot generation, booking, status transitions, conflicts).
* **Phase 5**: Consultations (Session records, vitals, clinical notes, Google Meet links).
* **Phase 6**: Medicine Tracker (Stock levels, FEFO deduction, stock movements, alerts).
* **Phase 7**: Prescriptions and PDF (Rx generation, digital watermark, PDF export, dispensing).
* **Phase 8**: Dashboard and Reports (Role-specific dashboards, analytics, CSV exports).
* **Phase 9**: Hardening and Deploy (Checklists, security audit, Vercel & Supabase deploy).
