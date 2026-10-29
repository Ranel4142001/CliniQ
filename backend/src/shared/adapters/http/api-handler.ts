import type { Context } from "hono";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { AppError } from "@backend/shared/domain/errors/app-error";
import type { ApiResponse } from "@backend/shared/application/dto/api.types";

export type RouteContext = { params: Record<string, string> };

type ApiHandler<T> = (req: Request, context: RouteContext) => Promise<ApiResponse<T>>;

interface ApiHandlerOptions {
  /** Seconds to cache successful GET responses (adds Cache-Control: private, max-age=N) */
  cacheSeconds?: number;
}

function errorBody(code: string, message: string, details?: unknown) {
  return { error: { code, message, ...(details ? { details } : {}) } };
}

/** Prisma failures that mean "cannot reach the database" (down, wrong host, bad credentials). */
const DB_CONNECTION_ERROR_CODES = new Set(["P1000", "P1001", "P1002", "P1017"]);

function isDatabaseUnavailable(err: unknown): boolean {
  return (
    err instanceof Prisma.PrismaClientInitializationError ||
    (err instanceof Prisma.PrismaClientKnownRequestError && DB_CONNECTION_ERROR_CODES.has(err.code))
  );
}

/** Maps any thrown error to the `{ error: { code, message, details? } }` envelope. */
export function toErrorResponse(c: Context, err: unknown): Response {
  c.header("Cache-Control", "private, no-store");
  if (err instanceof AppError) {
    return c.json(errorBody(err.code, err.message, err.details), err.statusCode as 400);
  }
  if (err instanceof ZodError) {
    return c.json(errorBody("VALIDATION_ERROR", "Validation failed", err.flatten()), 400);
  }
  // c.req.json() throws SyntaxError on a malformed request body.
  if (err instanceof SyntaxError) {
    return c.json(errorBody("INVALID_JSON", "Request body must be valid JSON"), 400);
  }
  if (isDatabaseUnavailable(err)) {
    console.error("[Database unavailable]:", err instanceof Error ? err.message : err);
    return c.json(
      errorBody(
        "SERVICE_UNAVAILABLE",
        "The service is temporarily unavailable. Please try again shortly."
      ),
      503
    );
  }
  console.error("[Unhandled API Error]:", err);
  return c.json(errorBody("INTERNAL_SERVER_ERROR", "An unexpected error occurred"), 500);
}

/** Adapts a `(req, { params }) => { data, meta? }` handler to a Hono route handler. */
export function withApiHandler<T>(handler: ApiHandler<T>, options: ApiHandlerOptions = {}) {
  return async (c: Context): Promise<Response> => {
    try {
      const result = await handler(c.req.raw, { params: c.req.param() });
      // Responses are user-specific: never store them in shared caches.
      const cacheControl =
        options.cacheSeconds && c.req.method === "GET"
          ? `private, max-age=${options.cacheSeconds}, stale-while-revalidate=${options.cacheSeconds * 2}`
          : "private, no-store";
      c.header("Cache-Control", cacheControl);
      return c.json(result);
    } catch (err: unknown) {
      return toErrorResponse(c, err);
    }
  };
}
