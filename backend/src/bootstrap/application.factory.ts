import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { secureHeaders } from "hono/secure-headers";
import { requestContextMiddleware } from "@backend/shared/adapters/http/request-context";
import { toErrorResponse } from "@backend/shared/adapters/http/api-handler";
import { registerModules } from "./register-modules";

const MAX_BODY_BYTES = 1024 * 1024;

/** Builds the HTTP application. Kept free of side effects (no listening) so tests can call it. */
export function createApplication(): Hono {
  const app = new Hono();

  // JSON-only API: lock down everything a browser could do with a response.
  app.use(
    secureHeaders({
      contentSecurityPolicy: { defaultSrc: ["'none'"], frameAncestors: ["'none'"] },
      xFrameOptions: "DENY",
    })
  );
  app.use(
    bodyLimit({
      maxSize: MAX_BODY_BYTES,
      onError: (c) =>
        c.json({ error: { code: "PAYLOAD_TOO_LARGE", message: "Request body is too large" } }, 413),
    })
  );
  app.use(requestContextMiddleware);

  registerModules(app);

  app.notFound((c) => c.json({ error: { code: "NOT_FOUND", message: "Route not found" } }, 404));
  app.onError((err, c) => toErrorResponse(c, err));

  return app;
}
