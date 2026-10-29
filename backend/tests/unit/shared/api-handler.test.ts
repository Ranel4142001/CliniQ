import { describe, it, expect, vi } from "vitest";
import { Hono } from "hono";
import { Prisma } from "@prisma/client";
import { withApiHandler } from "@backend/shared/adapters/http/api-handler";
import { NotFoundError } from "@backend/shared/domain/errors/app-error";

function appThrowing(err: unknown) {
  const app = new Hono();
  app.get(
    "/x",
    withApiHandler(async () => {
      throw err;
    })
  );
  return app;
}

describe("withApiHandler error mapping", () => {
  it("reports an unreachable database as 503, not a generic 500", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const err = new Prisma.PrismaClientInitializationError("Can't reach database server", "5.22.0");
    const res = await appThrowing(err).request("/x");
    expect(res.status).toBe(503);
    const body = (await res.json()) as { error: { code: string } };
    expect(body.error.code).toBe("SERVICE_UNAVAILABLE");
  });

  it("keeps AppError status codes", async () => {
    const res = await appThrowing(new NotFoundError("nope")).request("/x");
    expect(res.status).toBe(404);
  });

  it("hides unexpected errors behind a generic 500", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const res = await appThrowing(new Error("secret internals")).request("/x");
    expect(res.status).toBe(500);
    expect(JSON.stringify(await res.json())).not.toContain("secret internals");
  });
});
