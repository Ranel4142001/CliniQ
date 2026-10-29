import { AsyncLocalStorage } from "node:async_hooks";
import type { Context } from "hono";

interface RequestContext {
  c: Context;
  /** Request-scoped memo slots (e.g. the authenticated profile). */
  cache: Map<string, Promise<unknown>>;
}

const storage = new AsyncLocalStorage<RequestContext>();

/** Hono middleware: makes the current request available to code deep in the call stack. */
export async function requestContextMiddleware(c: Context, next: () => Promise<void>) {
  await storage.run({ c, cache: new Map() }, next);
}

export function getRequestContext(): RequestContext {
  const ctx = storage.getStore();
  if (!ctx) throw new Error("No request context: call from within an HTTP request");
  return ctx;
}

/** Computes a value once per request. */
export function memoizePerRequest<T>(key: string, compute: () => Promise<T>): Promise<T> {
  const { cache } = getRequestContext();
  if (!cache.has(key)) cache.set(key, compute());
  return cache.get(key) as Promise<T>;
}
