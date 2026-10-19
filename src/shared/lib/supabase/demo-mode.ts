/**
 * Checks whether the application is running in local development / demo mode
 * where live Supabase or live PostgreSQL may not be configured.
 */
export function isDemoMode(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  return (
    !url ||
    url.includes("example.supabase.co") ||
    key.includes("demo-anon-key") ||
    key.includes("dummy-anon-key")
  );
}
