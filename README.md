# CliniQ — Healthcare & Clinic Management System

A web-based clinic management system designed for community and institutional health clinics.

- **Frontend:** Next.js 15 (App Router) + React 19, TypeScript strict, Tailwind CSS + shadcn/ui, TanStack Query, React Hook Form.
- **Backend:** Node.js + Hono, hexagonal modular monolith (ports & adapters), Prisma ORM, PostgreSQL (Supabase), Supabase Auth, Zod.

---

## 🌟 Key Features

1. **Role-Based Authentication & Access Control**
   - 4 distinct roles: `ADMIN`, `CLINICIAN`, `STAFF`, and `PATIENT`.
   - Supabase Auth sessions (HTTP-only cookies) with server-side role checks on every endpoint.
   - Granular permission matrix (`can(role, action)`) enforced in API controllers and services.

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
   - Messenger-style private chat between patient and clinician for online consultations.

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

## 📁 Project Structure

CliniQ is split into two applications that live in one repository (npm workspaces):

```text
CliniQ/
├── frontend/                     # Everything the user sees (Next.js)
│   ├── public/
│   ├── src/
│   │   ├── app/                  # Pages (App Router) + /api proxy to the backend
│   │   ├── features/<feature>/   # components/, hooks/, utils/ per feature
│   │   ├── components/           # Shared UI: ui/, data-table/, form/, feedback/, layout/, pdf/
│   │   ├── hooks/  lib/  config/  constants/
│   │   └── middleware.ts         # Page-level auth redirects
│   └── tests/unit/
│
├── backend/                      # Everything on the server (Node.js API)
│   ├── src/
│   │   ├── modules/<module>/     # auth, patients, appointments, consultations,
│   │   │   ├── domain/           #   medicines, prescriptions, dashboard, reports
│   │   │   ├── application/
│   │   │   ├── adapters/inbound/http/
│   │   │   ├── infrastructure/persistence/
│   │   │   └── index.ts          # Module public API
│   │   ├── shared/               # Shared kernel
│   │   ├── contracts/            # The only backend code the frontend may import
│   │   ├── bootstrap/            # Composition root
│   │   └── main.ts               # Server entry point
│   ├── database/                 # schema.prisma, migrations/, seeds/
│   ├── tests/                    # unit/, architecture/
│   └── docs/                     # architecture/, api/
│
├── docker-compose.yml
└── package.json                  # Workspace root
```

The browser only ever talks to the frontend. The frontend forwards `/api/*` to the backend
from the server, so cookies stay first-party and no CORS is needed.

- Backend layering and dependency rules: [backend/docs/architecture/system-overview.md](backend/docs/architecture/system-overview.md)
- Every endpoint and who can call it: [backend/docs/api/endpoints.md](backend/docs/api/endpoints.md)
- Engineering rules: [CLINIQ_RULES.md](CLINIQ_RULES.md)

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** 20+ and npm
- A **Supabase** project (Auth) and a **PostgreSQL** database (Supabase or `docker compose up db`)

### 2. Install
```bash
npm install          # installs both workspaces and generates the Prisma client
```

### 3. Configure environment
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```
Fill in the database URL and Supabase keys. The service-role key goes **only** in `backend/.env`.

### 4. Create the database and seed it
```bash
npm run db:migrate -w backend     # applies backend/database/migrations
npm run db:seed -w backend        # needs SEED_ADMIN_PASSWORD and SEED_STAFF_PASSWORD
```

### 5. Run
```bash
npm run dev
```
- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend: [http://localhost:4000/api/health](http://localhost:4000/api/health)

---

## 🛠️ Scripts (run from the repository root)

| Command | What it does |
| --- | --- |
| `npm run dev` | Starts backend (`:4000`) and frontend (`:3000`) together |
| `npm run build` | Builds the backend bundle and the frontend |
| `npm test` | Runs unit + architecture tests in both workspaces |
| `npm run lint` | Lints both workspaces (including layer-boundary rules) |
| `npm run typecheck` | Type-checks both workspaces |
| `npm run db:migrate -w backend` | Applies database migrations |
| `npm run db:seed -w backend` | Seeds sample data |

---

## 🧩 How to Add a New Feature

Example: a `laboratory` module.

**Backend** (`backend/src/modules/laboratory/`)
1. `domain/`: pure rules and constants (no Prisma, no HTTP).
2. `application/dto/laboratory.schema.ts` and `laboratory.types.ts`: Zod input schemas and response types.
3. `infrastructure/persistence/repositories/laboratory.repository.ts`: Prisma queries only.
4. `application/services/laboratory.service.ts`: use cases, ownership checks, `AppError` subclasses.
5. `adapters/inbound/http/laboratory.controller.ts`: routes with `withApiHandler` + `requireAuth([...])`.
6. `index.ts`: export the controller and anything other modules need, then register the controller in `bootstrap/register-modules.ts`.
7. Re-export the DTOs the UI needs from `src/contracts/index.ts`.

**Frontend** (`frontend/src/features/laboratory/`)
1. `hooks/`: TanStack Query hooks calling `/api/laboratory`.
2. `components/`: UI built from the shared `DataTable`, form fields and feedback states.
3. A page under `src/app/(app)/laboratory/`.

`npm test` will fail if a layer rule is broken.

---

## 🚢 Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md).
