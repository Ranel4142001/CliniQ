# CliniQ Deployment Guide

CliniQ runs as **two services**:

| Service | What it is | Public? |
| --- | --- | --- |
| `frontend` | Next.js app. Serves pages and proxies `/api/*` to the backend | Yes (port 3000) |
| `backend` | Node.js (Hono) API. Talks to PostgreSQL and Supabase | No, only the frontend should reach it |

The frontend finds the backend through `BACKEND_URL`, which is read at runtime.

---

## 1. Supabase setup (both options)

1. Create a project at [supabase.com](https://supabase.com).
2. **Project Settings → Database**
   - Transaction pooler connection string (port 6543) → `DATABASE_URL`
   - Direct connection string (port 5432) → `DIRECT_URL`
3. **Project Settings → API**
   - Project URL → `SUPABASE_URL` (backend) and `NEXT_PUBLIC_SUPABASE_URL` (frontend)
   - Anon key → `SUPABASE_ANON_KEY` (backend) and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (frontend)
   - Service role key → `SUPABASE_SERVICE_ROLE_KEY` (**backend only**)

### Create tables and seed

```bash
cp backend/.env.example backend/.env    # fill in the values above + SEED_* passwords
npm install
npm run db:migrate -w backend
npm run db:seed -w backend
```

> **Existing database created with `prisma db push`?** Mark the initial migration as already
> applied before running `db:migrate`:
> `npx prisma migrate resolve --applied 20261029000000_init` (run inside `backend/`).

---

## 2. Option A: Docker Compose (self-hosted)

Create a `.env` file next to `docker-compose.yml`:

```bash
POSTGRES_PASSWORD="a-long-random-password"
SUPABASE_URL="https://<project-ref>.supabase.co"
SUPABASE_ANON_KEY="<anon key>"
SUPABASE_SERVICE_ROLE_KEY="<service role key>"
```

```bash
docker compose up -d --build
docker compose ps
```

- The app is served at `http://<server>:3000`. Put it behind HTTPS (e.g. Caddy or nginx).
- The backend is not published. Postgres is bound to `127.0.0.1` only.
- Apply migrations and seed from the host against `127.0.0.1:5432`, as in step 1.

---

## 3. Option B: Vercel (frontend) + container host (backend)

**Backend:** deploy `backend/Dockerfile` (build context = repository root) to any container host
(Railway, Render, Fly.io, a VPS…) with the backend environment variables. Expose it over HTTPS.

**Frontend on Vercel:**
1. Import the repository and set **Root Directory** to `frontend`. `frontend/vercel.json` installs from the monorepo root.
2. Environment variables: `BACKEND_URL` (the backend's HTTPS URL), `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Deploy.

If the backend is publicly reachable, restrict it to the frontend where your host allows it (private networking or an IP allowlist).

---

## 🩺 Health checks

```bash
curl http://localhost:4000/api/health      # backend directly
curl http://localhost:3000/api/health      # through the frontend proxy
```

`200 {"status":"ok","database":"healthy"}`, or `503` when the database is unreachable.
No environment or process details are exposed.

---

## 🔐 First admin account

Created by the seed script:

- **Email:** `SEED_ADMIN_EMAIL` (default `admin@cliniq.local`)
- **Password:** the `SEED_ADMIN_PASSWORD` you set (no default is shipped)

Sign in and change it, then create staff accounts from **Users**.
