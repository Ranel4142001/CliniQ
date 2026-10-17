/**
 * prisma/seed.ts
 * Creates the first ADMIN user in CliniQ.
 *
 * Usage:
 *   npx ts-node --project tsconfig.json prisma/seed.ts
 *   OR add to package.json:  "prisma": { "seed": "ts-node prisma/seed.ts" }
 *   then run: npx prisma db seed
 *
 * Required env vars:
 *   DATABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   NEXT_PUBLIC_SUPABASE_URL
 */

import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";

const prisma = new PrismaClient();

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? "admin@cliniq.local";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? "Admin@CliniQ2025!";
const ADMIN_FULL_NAME = process.env.SEED_ADMIN_NAME ?? "System Administrator";

async function main() {
  console.log("🌱  Starting CliniQ seed…");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars."
    );
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // 1. Check if profile already exists in DB
  const existing = await prisma.profile.findFirst({
    where: { email: ADMIN_EMAIL },
  });

  if (existing) {
    console.log(`✅  Admin profile already exists (id=${existing.id}). Skipping.`);
    return;
  }

  // 2. Create Supabase auth user
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: ADMIN_FULL_NAME },
  });

  if (error || !data.user) {
    throw new Error(`Supabase user creation failed: ${error?.message}`);
  }

  const authId = data.user.id;
  console.log(`🔑  Supabase auth user created (id=${authId})`);

  // 3. Create Prisma Profile with ADMIN role
  const profile = await prisma.profile.create({
    data: {
      authId,
      email: ADMIN_EMAIL,
      fullName: ADMIN_FULL_NAME,
      role: "ADMIN",
      isActive: true,
    },
  });

  console.log(`👤  Admin profile created (id=${profile.id})`);
  console.log(`\n✅  Seed complete!`);
  console.log(`    Email   : ${ADMIN_EMAIL}`);
  console.log(`    Password: ${ADMIN_PASSWORD}`);
  console.log(`    Role    : ADMIN\n`);
}

main()
  .catch((e) => {
    console.error("❌  Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
