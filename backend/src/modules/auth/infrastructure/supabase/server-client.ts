import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { getCookie, setCookie } from "hono/cookie";
import type { CookieOptions as HonoCookieOptions } from "hono/utils/cookie";
import { getEnv } from "@backend/shared/infrastructure/config/env";
import { getRequestContext } from "@backend/shared/adapters/http/request-context";

type SameSite = HonoCookieOptions["sameSite"];

function toHonoCookieOptions(options: CookieOptions): HonoCookieOptions {
  const sameSite =
    typeof options.sameSite === "string" ? (options.sameSite as SameSite) : undefined;
  return {
    path: options.path ?? "/",
    domain: options.domain,
    maxAge: options.maxAge,
    expires: options.expires,
    httpOnly: options.httpOnly,
    secure: options.secure,
    sameSite,
  };
}

/** Supabase client bound to the current HTTP request's cookies (reads session, writes refreshed tokens). */
export function createClient() {
  const { c } = getRequestContext();
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = getEnv();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return Object.entries(getCookie(c)).map(([name, value]) => ({ name, value }));
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          setCookie(c, name, value, toHonoCookieOptions(options));
        }
      },
    },
  });
}
