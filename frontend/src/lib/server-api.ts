import "server-only";
import { cookies } from "next/headers";
import { getServerEnv } from "@/config/env";
import type { ApiResponse, UserProfile } from "@backend/contracts";

/** Resolves the signed-in user for server components by asking the backend. Null when signed out. */
export async function getCurrentUser(): Promise<UserProfile | null> {
  const cookieStore = await cookies();
  const res = await fetch(new URL("/api/me", getServerEnv().BACKEND_URL), {
    headers: { cookie: cookieStore.toString() },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const body = (await res.json()) as ApiResponse<UserProfile>;
  return body.data;
}
