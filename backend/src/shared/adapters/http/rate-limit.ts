import type { Context, MiddlewareHandler } from "hono";

/**
 * Fixed-window attempt limiter for sensitive endpoints (sign-in, sign-up, password checks).
 *
 * The counters live in this process's memory. On serverless hosting each instance keeps its
 * own counts, so this slows guessing rather than giving an exact global limit; move the store
 * to a shared cache (e.g. Redis) if an exact limit is ever required.
 */

const MAX_TRACKED_KEYS = 10_000;

interface Window {
  count: number;
  resetAt: number;
}

export interface AttemptLimiter {
  /** Records one attempt; returns the seconds to wait when the limit is exceeded, else null. */
  hit(key: string): number | null;
}

export function createAttemptLimiter(
  max: number,
  windowMs: number,
  now: () => number = Date.now
): AttemptLimiter {
  const windows = new Map<string, Window>();

  return {
    hit(key) {
      const time = now();
      let window = windows.get(key);
      if (!window || window.resetAt <= time) {
        if (windows.size >= MAX_TRACKED_KEYS) {
          for (const [k, w] of windows) if (w.resetAt <= time) windows.delete(k);
          if (windows.size >= MAX_TRACKED_KEYS)
            windows.delete(windows.keys().next().value as string);
        }
        window = { count: 0, resetAt: time + windowMs };
        windows.set(key, window);
      }
      window.count += 1;
      return window.count > max ? Math.ceil((window.resetAt - time) / 1000) : null;
    },
  };
}

/** The caller's address as reported by the hosting proxy (first hop of X-Forwarded-For). */
export function getClientIp(c: Context): string {
  const forwarded = c.req.header("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || c.req.header("x-real-ip") || "unknown";
}

/** Reads `email` from a JSON body without consuming it for the route handler. */
export async function getBodyEmail(c: Context): Promise<string | null> {
  try {
    const body: unknown = await c.req.raw.clone().json();
    const email = (body as { email?: unknown } | null)?.email;
    return typeof email === "string" && email.trim() ? email.trim().toLowerCase() : null;
  } catch {
    return null;
  }
}

interface RateLimitOptions {
  name: string;
  max: number;
  windowMs: number;
  /** Extra keys to limit on besides the client IP (e.g. the targeted account's email). */
  extraKeys?: (c: Context) => Promise<Array<string | null>>;
}

/** Hono middleware: rejects with 429 once any of the request's keys exceeds the limit. */
export function rateLimit({ name, max, windowMs, extraKeys }: RateLimitOptions): MiddlewareHandler {
  const limiter = createAttemptLimiter(max, windowMs);

  return async (c, next) => {
    const keys = [`ip:${getClientIp(c)}`, ...((await extraKeys?.(c)) ?? [])].filter(
      (key): key is string => Boolean(key)
    );
    const waits = keys.map((key) => limiter.hit(`${name}:${key}`)).filter((s) => s !== null);

    if (waits.length > 0) {
      const retryAfter = Math.max(...waits);
      c.header("Retry-After", String(retryAfter));
      c.header("Cache-Control", "private, no-store");
      return c.json(
        {
          error: {
            code: "RATE_LIMITED",
            message: `Too many attempts. Please wait ${Math.ceil(retryAfter / 60)} minute(s) and try again.`,
          },
        },
        429
      );
    }
    await next();
  };
}
