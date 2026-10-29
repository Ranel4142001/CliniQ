import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getEnv } from "@backend/shared/infrastructure/config/env";

/** Service-role client. Bypasses RLS — server-side use only. */
export function createAdminClient() {
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = getEnv();

  return createSupabaseClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
