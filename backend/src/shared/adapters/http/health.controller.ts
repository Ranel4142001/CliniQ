import { Hono } from "hono";
import { prisma } from "@backend/shared/infrastructure/persistence/prisma";

/** Liveness/readiness probe. Deliberately exposes no environment or process details. */
export const healthController = new Hono();

healthController.get("/api/health", async (c) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return c.json({ status: "ok", database: "healthy" });
  } catch {
    return c.json({ status: "degraded", database: "unreachable" }, 503);
  }
});
