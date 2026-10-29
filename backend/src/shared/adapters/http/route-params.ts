import { z } from "zod";
import type { RouteContext } from "@backend/shared/adapters/http/api-handler";

const uuidParamSchema = z.string().uuid("Invalid ID");

/** Reads and validates a UUID dynamic route segment (e.g. `[id]`). Throws ZodError → 400. */
export function getIdParam(context: RouteContext | undefined, name = "id"): string {
  return uuidParamSchema.parse(context?.params?.[name]);
}
