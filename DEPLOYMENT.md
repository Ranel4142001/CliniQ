# CliniQ Production Deployment Guide

This guide covers deployment instructions for **Vercel + Supabase (Recommended)**, **Docker / Self-Hosted VPS**, and **Railway / Render**.

---

## 🚀 Option 1: Vercel + Supabase Deployment (Recommended)

### 1. Set Up Supabase Project
1. Log in to [supabase.com](https://supabase.com) and create a new project.
2. Note your database password.
3. In Supabase Dashboard -> **Project Settings** -> **Database**:
   - Copy the **Connection String (Transaction Pooler, port 6543)** -> this is your `DATABASE_URL`.
   - Copy the **Connection String (Direct connection, port 5432)** -> this is your `DIRECT_URL`.
4. In Supabase Dashboard -> **Project Settings** -> **API**:
   - Copy **Project URL** -> `NEXT_PUBLIC_SUPABASE_URL`.
   - Copy **Anon Key** -> `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
   - Copy **Service Role Key** -> `SUPABASE_SERVICE_ROLE_KEY`.

### 2. Push Schema & Seed Initial Admin
From your local terminal connected to Supabase:
```bash
# Push Prisma schema to live Supabase PostgreSQL
DATABASE_URL="your-supabase-direct-url" npx prisma db push

# (Optional) Seed standard clinic medicines and admin account
DATABASE_URL="your-supabase-direct-url" npm run db:seed
```

### 3. Deploy to Vercel
1. Push your code to GitHub.
2. Go to [vercel.com](https://vercel.com) -> **Add New Project** -> Select your CliniQ repository.
3. In **Environment Variables**, add:

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | Supabase pooled connection string (port 6543) | `postgresql://postgres.[ref]:[pwd]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true` |
| `DIRECT_URL` | Supabase direct connection string (port 5432) | `postgresql://postgres.[ref]:[pwd]@aws-0-[region].pooler.supabase.com:5432/postgres` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase API URL | `https://[project-ref].supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key | `eyJhbGci...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Private service role key | `eyJhbGci...` |
| `NEXT_PUBLIC_APP_URL` | Your custom domain or Vercel URL | `https://cliniq.vercel.app` |

4. Click **Deploy**. Vercel will run `npm run deploy:build` and deploy the application.

---

## 🐳 Option 2: Docker Container Deployment (Self-Hosted)

For running on an Ubuntu VPS, local clinic server, or cloud VM with Docker installed:

```bash
# 1. Clone repository
git clone <your-repo-url> CliniQ
cd CliniQ

# 2. Start Web & PostgreSQL containers in the background
docker compose up -d --build

# 3. Check health and logs
docker compose ps
docker compose logs -f web
```

The web application will be accessible at `http://<your-server-ip>:3000`.

---

## 🩺 System Health Monitoring

CliniQ provides an unauthenticated `/api/health` endpoint for uptime probes:
```bash
curl http://localhost:3000/api/health
```

Expected Response (`200 OK`):
```json
{
  "status": "ok",
  "timestamp": "2026-10-26T14:30:00.000Z",
  "uptimeSeconds": 1245,
  "environment": "production",
  "database": {
    "status": "healthy",
    "latencyMs": 3
  },
  "memory": {
    "rssMb": 85,
    "heapUsedMb": 42
  },
  "responseTimeMs": 4
}
```

---

## 🔐 Default Admin Account (After Seeding)

- **Email**: `admin@cliniq.local`
- **Password**: `Admin@CliniQ2025!`
- **Role**: `ADMIN`
