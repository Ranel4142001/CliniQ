# CliniQ — Healthcare & Clinic Management System

A web-based clinic management system designed for community and institutional health clinics. Built with Next.js 14 (App Router), TypeScript Strict, Tailwind CSS + shadcn/ui, Prisma ORM, PostgreSQL (Supabase), and TanStack Query.

---

## 🌟 Key Features

1. **Role-Based Authentication & Access Control**
   - 4 distinct roles: `ADMIN`, `CLINICIAN`, `STAFF`, and `PATIENT`.
   - Cookie-based session tokens with automatic demo fallback and Supabase Auth integration.
   - Granular permission matrix (`can(role, action)`) enforced at route handlers and services.

2. **Patient Records Management**
   - Full demographic, emergency, and clinical information tracking with PhilHealth compliance.
   - Sequential, collision-proof ID generation (`PT-YYYY-NNNN`).
   - Audit logging on patient creation, edits, and archive operations.

3. **Appointment Scheduling**
   - In-person and online teleconsultation scheduling.
   - Real-time conflict prevention, business hour validation, and Google Meet integration.
   - State-machine status transitions: `PENDING` → `CONFIRMED` → `COMPLETED` / `CANCELLED` / `NO_SHOW`.

4. **Clinical Consultations (SOAP Workflow)**
   - Vitals recording (BP, Heart Rate, Respiratory Rate, Temp, Weight, SpO2) with BMI calculation.
   - Chief complaint, objective findings, diagnosis, and treatment plan.

5. **Medicine Inventory & FEFO Stock Management**
   - First-Expired, First-Out (FEFO) automated dispensing and deduction.
   - Reorder level alerts (`IN_STOCK`, `LOW_STOCK`, `OUT_OF_STOCK`, `EXPIRED`, `EXPIRING_SOON`).
   - Complete audit trail of all stock-in, stock-out, and adjustment movements.

6. **Digital Prescriptions**
   - Sequential prescription numbering (`RX-YYYY-NNNN`).
   - Direct integration with medicine inventory and dosage validation.
   - Status transitions (`DRAFT` → `ISSUED` → `DISPENSED` / `VOIDED`).
   - High-fidelity PDF generation with watermark and clinic branding.

7. **Analytics Dashboard & Reporting**
   - Role-specific KPI metrics and action queues.
   - 5 comprehensive reports: Appointments, Patient Visits, Stock Movements, Current Inventory, and Prescriptions.
   - One-click CSV and PDF report exports with date and status filters.

---

## 📐 Architecture & Layering Rules

CliniQ adheres strictly to a 6-layer decoupled architecture:

```
Page (App Router)
   │
   ▼
Component (UI Presentation & RHF)
   │
   ▼
Hook (TanStack Query / Mutation)
   │
   ▼
Route Handler (/api/* with withApiHandler + requireAuth)
   │
   ▼
Service (Pure Business Rules, Calculations, & Validation)
   │
   ▼
Repository (Data Access & Prisma Client Transactions)
```

- **Feature-Based Folders**: Features live in `src/features/<feature-name>/`.
- **Public API Contract**: Features only expose exports via their `index.ts`. No internal deep imports across features.
- **Prisma Isolation**: Prisma Client is strictly confined to `repositories/`. No direct Prisma calls in pages or components.
- **Single Responsibility**: Functions under 30 lines, components under 150 lines, zero `any` types.

---

## 📁 Folder Structure Map

```text
src/
├── app/                              # Next.js App Router
│   ├── (app)/                        # Authenticated app shell layout & pages
│   │   ├── appointments/             # Appointments list & booking
│   │   ├── consultations/            # Clinical consultation workflow
│   │   ├── dashboard/                # Role-based dashboard
│   │   ├── medicines/                # FEFO inventory management
│   │   ├── patients/                 # Patient directory & charts
│   │   ├── prescriptions/            # Digital prescriptions & dispensing
│   │   ├── reports/                  # Analytics & PDF/CSV reporting
│   │   └── users/                    # Admin staff user management
│   ├── (auth)/                       # Public auth routes (login, register)
│   ├── api/                          # Route handlers with requireAuth & Zod
│   ├── error.tsx                     # Root error boundary
│   ├── not-found.tsx                 # Root 404 page
│   └── layout.tsx                    # Root layout with fonts & providers
├── features/                         # Modular business domains
│   ├── appointments/                 # Schedulers, slots, status state-machine
│   ├── auth/                         # Sessions, guards, login/register hooks
│   ├── consultations/                # SOAP forms, vitals, summary views
│   ├── dashboard/                    # Role KPIs, counters, pending tasks
│   ├── medicines/                    # FEFO deduction, batches, stock status
│   ├── patients/                     # Patient records, forms, sequence numbers
│   ├── prescriptions/                # Rx issuance, dispensing, PDF generator
│   └── reports/                      # 5 analytics reports, CSV/PDF configs
├── shared/                           # Reusable code across all features
│   ├── components/                   # DataTable, FormField, Dialogs, PDF layout
│   ├── constants/                    # Roles, permissions, routes, config
│   ├── hooks/                        # useDebounce, useMediaQuery
│   └── lib/                          # Api client, errors, notifications, date utils
├── config/                           # Environment variable schema validation
prisma/                               # Database schema, migrations, seed script
tests/                                # Vitest unit and integration test suite
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18.17+ or v20+
- **npm** or **pnpm**
- **PostgreSQL** instance (Supabase recommended)

### 2. Installation
```bash
git clone <repository-url>
cd CliniQ
npm install
```

### 3. Environment Setup
Copy the template and fill in your Supabase project credentials:
```bash
cp .env.example .env
```

Key variables:
- `DATABASE_URL`: Supabase Transaction Pooler URL (port 6543)
- `DIRECT_URL`: Supabase Direct Session URL (port 5432)
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon public key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role secret

### 4. Database Migration & Seed
```bash
# Push schema to database
npx prisma db push

# Seed initial admin, clinicians, staff, fictional patients, and medicines
npm run db:seed
```

### 5. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

> **💡 Demo Mode**: When running without an active PostgreSQL instance, CliniQ operates in **Demo Mode**. You can log in using `admin@gmail.com` (Admin), `doctor@gmail.com` (Doctor), `staff@gmail.com` (Staff), or `raneldahil@gmail.com` (Patient) to explore the system with fictional sample data.

---

## 🛠️ Available Scripts

| Script | Command | Purpose |
|---|---|---|
| `npm run dev` | `next dev` | Start development server on port 3000 |
| `npm run build` | `next build` | Create optimized production build |
| `npm run start` | `next start` | Run production build |
| `npm run lint` | `next lint` | Run ESLint strict checks |
| `npm test` | `vitest run` | Execute entire Vitest unit & integration test suite |
| `npm run format` | `prettier --write .` | Format all source files with Prettier |
| `npm run db:seed` | `ts-node prisma/seed.ts` | Seed database with sample fictional data |

---

## 🧩 How to Add a New Feature

When adding a new feature (e.g., `laboratory`), follow the strict 6-layer convention:

1. **Define Types & Zod Schemas**:
   - Create `src/features/<feature>/types/<feature>.types.ts`
   - Create `src/features/<feature>/validations/<feature>.schema.ts`

2. **Implement Repository (Prisma only)**:
   - Create `src/features/<feature>/repositories/<feature>.repository.ts`
   - Handle database queries, pagination, and relations.

3. **Implement Service (Business Logic)**:
   - Create `src/features/<feature>/services/<feature>.service.ts`
   - Enforce business invariants, sequence generation, ownership checks, and throw `AppError` subclasses.

4. **Create API Route Handlers**:
   - Create `src/app/api/<feature>/route.ts` and `src/app/api/<feature>/[id]/route.ts`
   - Wrap with `withApiHandler(...)` and protect with `await requireAuth([Role.ADMIN, ...])`.

5. **Create TanStack Query Hooks**:
   - Create `src/features/<feature>/hooks/use-<feature>.ts` for fetching and mutating data.

6. **Build UI Components & Page**:
   - Place components in `src/features/<feature>/components/` using shared UI components (`DataTable`, `FormField`, etc.).
   - Create the page in `src/app/(app)/<feature>/page.tsx`.

7. **Export via Public API**:
   - Expose only necessary types, hooks, and components in `src/features/<feature>/index.ts`.

8. **Write Unit Tests**:
   - Add tests in `tests/<feature>-service.test.ts` covering validation, permissions, and edge cases.

---

## 🚢 Deployment to Vercel

1. **Push repository** to GitHub or GitLab.
2. **Import project** into [Vercel](https://vercel.com).
3. **Configure Environment Variables** in Vercel Project Settings matching `.env.example`.
4. Set **Supabase Auth Redirect URLs** in Supabase Dashboard:
   - Site URL: `https://your-domain.vercel.app`
   - Redirect URL: `https://your-domain.vercel.app/api/auth/callback`
5. Deploy!
