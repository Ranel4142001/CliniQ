// Builds the backend for Vercel using the Build Output API (https://vercel.com/docs/build-output-api).
// Produces .vercel/output with a single Node.js function that handles all routes.
import { build } from "esbuild";
import { cpSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { createRequire } from "node:module";

const OUT = ".vercel/output";
const FUNC = join(OUT, "functions/api.func");
const require = createRequire(import.meta.url);

rmSync(OUT, { recursive: true, force: true });
mkdirSync(FUNC, { recursive: true });

await build({
  entryPoints: ["src/vercel.ts"],
  bundle: true,
  platform: "node",
  target: "node22",
  format: "cjs",
  sourcemap: "inline",
  // Prisma ships a native query engine, so it is copied next to the bundle instead of bundled.
  external: ["@prisma/client", ".prisma/client"],
  outfile: join(FUNC, "index.js"),
});

const prismaClientDir = dirname(require.resolve("@prisma/client/package.json"));
const generatedClientDir = join(prismaClientDir, "../../.prisma/client");
cpSync(prismaClientDir, join(FUNC, "node_modules/@prisma/client"), { recursive: true, dereference: true });
cpSync(generatedClientDir, join(FUNC, "node_modules/.prisma/client"), { recursive: true, dereference: true });

writeFileSync(
  join(FUNC, ".vc-config.json"),
  JSON.stringify(
    {
      runtime: "nodejs22.x",
      handler: "index.js",
      launcherType: "Nodejs",
      shouldAddHelpers: false,
      maxDuration: 30,
      regions: ["sin1"],
    },
    null,
    2
  )
);

writeFileSync(
  join(OUT, "config.json"),
  JSON.stringify({ version: 3, routes: [{ src: "/(.*)", dest: "/api" }] }, null, 2)
);

console.log("Vercel build output written to", OUT);
