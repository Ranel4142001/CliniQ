import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isDev = process.env.NODE_ENV !== "production";
// The backend API, reached through a same-origin rewrite so cookies stay first-party and no CORS is needed.
// Read at build time: changing it requires a rebuild/redeploy.
const backendUrl = (process.env.BACKEND_URL ?? "http://localhost:4000").replace(/\/+$/, "");

// 'unsafe-inline' scripts are required by Next.js App Router hydration without nonces;
// 'wasm-unsafe-eval' is required by @react-pdf/renderer's layout engine.
// The browser only talks to this origin: /api/* is rewritten to the backend.
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "frame-src 'self' blob:",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  // Standalone output for the Docker image
  output: process.env.STANDALONE === "true" ? "standalone" : undefined,
  // Separate build folder (e.g. for a production build alongside a running `next dev`)
  distDir: process.env.NEXT_DIST_DIR || ".next",

  // Monorepo root, so standalone output traces hoisted workspace dependencies
  outputFileTracingRoot: path.join(__dirname, ".."),
  serverExternalPackages: ["@react-pdf/renderer"],

  experimental: {
    // Compile the shared API contract from ../backend/src/contracts
    externalDir: true,
  },

  // Forward /api/* to the backend at the platform's routing layer (on Vercel: no extra function hop).
  rewrites: async () => ({
    beforeFiles: [{ source: "/api/:path*", destination: `${backendUrl}/api/:path*` }],
  }),

  images: {
    formats: ["image/avif", "image/webp"],
  },

  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        { key: "Content-Security-Policy", value: contentSecurityPolicy },
        { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
      ],
    },
  ],
};

export default nextConfig;
