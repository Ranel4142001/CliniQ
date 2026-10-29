# CliniQ Backend — System Overview

The backend is a standalone Node.js API (Hono) organised as a **modular monolith with
hexagonal (ports & adapters) layering**. Each business capability is a module; inside a
module, code is split by how close it is to the business rules.

## Request flow

```text
Browser ──▶ frontend (Next.js) ──/api/* proxy──▶ backend (Hono)
                                                   │
             adapters/inbound/http  (controller: auth check, parse & validate input)
                                                   ▼
             application/services   (use cases: orchestration, ownership checks)
                │                                  ▼
                │ depends on         domain        (pure business rules & constants)
                ▼
             application/ports/outbound  (interfaces: repositories, identity, transactions…)
                ▲
                │ implements
             infrastructure         (Prisma repositories, Supabase, meeting links)
```

## Folder layout

```text
backend/
├── src/
│   ├── modules/<module>/          # auth, patients, appointments, consultations,
│   │   │                          # medicines, prescriptions, dashboard, reports
│   │   ├── domain/
│   │   │   ├── constants/         # Business limits, statuses, labels
│   │   │   └── services/          # Pure rules (status transitions, FEFO, slots…)
│   │   ├── application/
│   │   │   ├── dto/               # Zod request schemas + response DTO types
│   │   │   ├── ports/outbound/    # Interfaces the services need (repositories, identity…)
│   │   │   └── services/          # Use cases, created with their ports injected
│   │   ├── adapters/inbound/http/ # Hono controllers (+ requireAuth in auth)
│   │   ├── infrastructure/
│   │   │   └── persistence/repositories/   # Prisma queries only
│   │   ├── <module>.module.ts     # Composition: binds ports to concrete adapters
│   │   └── index.ts               # The module's public API
│   ├── shared/                    # Shared kernel: domain errors, pagination,
│   │                              # shared ports (TransactionRunner, AuditLogPort,
│   │                              # SequenceGeneratorPort) and their Prisma adapters,
│   │                              # HTTP plumbing, env
│   ├── contracts/index.ts         # The ONLY backend entry point the frontend may import
│   ├── bootstrap/                 # Composition root: builds the app, mounts modules
│   └── main.ts                    # Process entry point (HTTP server + graceful shutdown)
├── database/
│   ├── schema.prisma
│   ├── migrations/
│   └── seeds/
├── tests/
│   ├── unit/<module>/
│   └── architecture/              # Enforces the dependency rules below
└── docs/
```

## Dependency rules

Enforced by `tests/architecture/dependency-rules.test.ts`. CI fails if any rule is broken.

1. **domain** imports only other domain code. No HTTP, no database.
2. **application** depends only on port interfaces: never on infrastructure (Prisma,
   Supabase, repositories), inbound adapters or Hono.
3. **infrastructure** never imports inbound adapters.
4. **Modules talk to each other only through `modules/<m>/index.ts`.**
5. **shared** never imports from feature modules.
6. **contracts** (and everything it pulls in at runtime) must be browser-safe: no services,
   repositories, Prisma client, Hono or Supabase.

The frontend's ESLint config separately blocks any `@backend/*` import other than
`@backend/contracts`.

## Security model

- Every endpoint except login/register/logout/health calls `requireAuth(roles)`. Services then
  check ownership (e.g. a patient can only read their own records).
- Identity comes from the Supabase session cookie. Profiles created by self-registration are
  always `PATIENT`; elevated roles are granted only by an admin.
- All input is validated with Zod; route IDs must be UUIDs.
- Responses are `Cache-Control: private, no-store` (unless a GET opts into short private
  caching). JSON-only security headers (`default-src 'none'`), 1 MB body limit, JSON 404/500.
- The API is not exposed publicly in Docker: only the frontend container can reach it.

## Ports and composition

Each service is created with its dependencies, e.g.
`createPatientService({ patientRepository, transactions, sequences, auditRepository })`.
Every repository declares `satisfies <Name>RepositoryPort`, so the compiler proves the adapter
matches the interface. `<module>.module.ts` wires the real adapters; unit tests pass in-memory
fakes instead (see `tests/support/fakes.ts`). Cross-module needs are ports too: appointments
asks for a `PatientLookupPort`, prescriptions for a `StockDispenserPort`. Only the composition
files know which module provides them.

## Concurrency guarantees

- Stock deductions are a single conditional `UPDATE … WHERE quantity >= n`, so concurrent
  dispenses can never oversell or lose an update.
- Stock-in uses an atomic upsert on `(medicineId, batchNo)`.
- Prescription status changes are compare-and-set (`issue`, `dispense`, `void`): when two
  requests race, exactly one wins and the other gets a 409 before any stock moves.
- Audit entries written inside a transaction commit or roll back together with the change.
