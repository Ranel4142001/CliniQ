import { NextRequest } from "next/server";
import { getServerEnv } from "@/config/env";

/**
 * Same-origin proxy to the CliniQ backend. The browser only ever talks to this
 * origin, so auth cookies stay first-party and no CORS is needed.
 */
export const dynamic = "force-dynamic";

const FORWARDED_REQUEST_HEADERS = [
  "accept",
  "accept-language",
  "content-type",
  "cookie",
  "user-agent",
];
// fetch() already decoded the body and recomputes framing, so these must not be copied.
const DROPPED_RESPONSE_HEADERS = new Set([
  "connection",
  "content-encoding",
  "content-length",
  "keep-alive",
  "transfer-encoding",
  "set-cookie",
]);
const METHODS_WITHOUT_BODY = new Set(["GET", "HEAD"]);

function buildTargetUrl(req: NextRequest, segments: string[]): URL | null {
  if (segments.some((segment) => segment === "." || segment === "..")) return null;
  const path = segments.map(encodeURIComponent).join("/");
  return new URL(`/api/${path}${req.nextUrl.search}`, getServerEnv().BACKEND_URL);
}

function buildRequestHeaders(req: NextRequest): Headers {
  const headers = new Headers();
  for (const name of FORWARDED_REQUEST_HEADERS) {
    const value = req.headers.get(name);
    if (value) headers.set(name, value);
  }
  const clientIp = req.headers.get("x-forwarded-for");
  if (clientIp) headers.set("x-forwarded-for", clientIp);
  return headers;
}

function buildResponseHeaders(upstream: Response): Headers {
  const headers = new Headers();
  upstream.headers.forEach((value, name) => {
    if (!DROPPED_RESPONSE_HEADERS.has(name)) headers.set(name, value);
  });
  for (const cookie of upstream.headers.getSetCookie()) headers.append("set-cookie", cookie);
  return headers;
}

async function proxy(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const target = buildTargetUrl(req, (await params).path);
  if (!target) {
    return Response.json(
      { error: { code: "NOT_FOUND", message: "Route not found" } },
      { status: 404 }
    );
  }

  try {
    const upstream = await fetch(target, {
      method: req.method,
      headers: buildRequestHeaders(req),
      body: METHODS_WITHOUT_BODY.has(req.method) ? undefined : await req.arrayBuffer(),
      redirect: "manual",
      cache: "no-store",
    });
    return new Response(upstream.body, {
      status: upstream.status,
      headers: buildResponseHeaders(upstream),
    });
  } catch (err) {
    console.error("[API proxy] Backend unreachable:", err);
    return Response.json(
      { error: { code: "BACKEND_UNAVAILABLE", message: "The service is temporarily unavailable" } },
      { status: 502 }
    );
  }
}

export { proxy as GET, proxy as POST, proxy as PUT, proxy as PATCH, proxy as DELETE };
