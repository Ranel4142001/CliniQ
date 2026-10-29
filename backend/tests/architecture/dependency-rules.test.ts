import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

/**
 * Enforces the hexagonal dependency rules of backend/src:
 *
 *   adapters ──▶ application ──▶ domain
 *   infrastructure ──▶ application (implements its ports) / domain
 *
 * Application code depends only on port interfaces; concrete adapters are bound
 * in each module's `<module>.module.ts` composition file.
 *
 * plus module encapsulation (other modules only through `modules/<m>/index.ts`)
 * and a browser-safe public contract for the frontend (`src/contracts`).
 */

const SRC = path.resolve(__dirname, "../../src");

interface ImportRef {
  spec: string;
  resolved: string | null;
  typeOnly: boolean;
}

function listFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return listFiles(full);
    return entry.name.endsWith(".ts") ? [full] : [];
  });
}

function resolveSpec(spec: string, fromFile: string): string | null {
  let base: string;
  if (spec.startsWith("@backend/")) base = path.join(SRC, spec.slice("@backend/".length));
  else if (spec.startsWith(".")) base = path.resolve(path.dirname(fromFile), spec);
  else return null;
  for (const candidate of [`${base}.ts`, path.join(base, "index.ts"), base]) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
  }
  return null;
}

const IMPORT_RE = /^\s*(import|export)\s+(type\s+)?(?:[^"';]*?\s+from\s+)?["']([^"']+)["']/gm;

function getImports(file: string): ImportRef[] {
  const source = fs.readFileSync(file, "utf8");
  return [...source.matchAll(IMPORT_RE)].map((m) => ({
    spec: m[3],
    resolved: resolveSpec(m[3], file),
    typeOnly: Boolean(m[2]),
  }));
}

const rel = (file: string) => path.relative(SRC, file).split(path.sep).join("/");
const layerOf = (file: string) =>
  rel(file).match(/^modules\/[^/]+\/(domain|application|adapters|infrastructure)\//)?.[1];
const moduleOf = (file: string) => rel(file).match(/^modules\/([^/]+)\//)?.[1];

const files = listFiles(SRC);

function violations(predicate: (file: string, ref: ImportRef) => boolean): string[] {
  return files.flatMap((file) =>
    getImports(file)
      .filter((ref) => predicate(file, ref))
      .map((ref) => `${rel(file)} → ${ref.spec}`)
  );
}

describe("Hexagonal dependency rules", () => {
  it("domain depends on nothing but other domain code", () => {
    const found = violations((file, ref) => {
      if (layerOf(file) !== "domain" || !ref.resolved) return false;
      const target = layerOf(ref.resolved);
      return target !== undefined && target !== "domain";
    });
    expect(found).toEqual([]);
  });

  it("domain and application never touch HTTP or the database client directly", () => {
    const forbidden = ["hono", "@hono/node-server", "@supabase/ssr"];
    const found = violations((file, ref) => {
      const layer = layerOf(file);
      if (layer !== "domain" && layer !== "application") return false;
      return (
        forbidden.includes(ref.spec) ||
        (layer === "domain" && rel(ref.resolved ?? "").startsWith("shared/infrastructure"))
      );
    });
    expect(found).toEqual([]);
  });

  it("application depends on ports, never on infrastructure (no Prisma, Supabase or repositories)", () => {
    const found = violations((file, ref) => {
      if (layerOf(file) !== "application" && !rel(file).startsWith("shared/application/"))
        return false;
      const target = rel(ref.resolved ?? "");
      return (
        layerOf(ref.resolved ?? "") === "infrastructure" ||
        target.startsWith("shared/infrastructure/") ||
        ref.spec.startsWith("@supabase/")
      );
    });
    expect(found).toEqual([]);
  });

  it("application and infrastructure never depend on inbound adapters", () => {
    const found = violations((file, ref) => {
      const layer = layerOf(file);
      if (layer !== "application" && layer !== "infrastructure") return false;
      return Boolean(
        ref.resolved &&
        layerOf(ref.resolved) === "adapters" &&
        moduleOf(ref.resolved) === moduleOf(file)
      );
    });
    expect(found).toEqual([]);
  });

  it("modules use each other only through their public index.ts", () => {
    const found = violations((file, ref) => {
      const own = moduleOf(file);
      if (!own || !ref.resolved) return false;
      const other = moduleOf(ref.resolved);
      return (
        other !== undefined && other !== own && rel(ref.resolved) !== `modules/${other}/index.ts`
      );
    });
    expect(found).toEqual([]);
  });

  it("the shared kernel does not depend on feature modules", () => {
    const found = violations(
      (file, ref) =>
        rel(file).startsWith("shared/") && Boolean(ref.resolved && moduleOf(ref.resolved))
    );
    expect(found).toEqual([]);
  });
});

describe("Frontend contract (src/contracts)", () => {
  const BROWSER_UNSAFE = /(^|\/)(infrastructure|adapters|bootstrap)\/|\/application\/services\//;

  /** Every file reachable from the contract through runtime (non type-only) imports. */
  function runtimeClosure(entry: string): Set<string> {
    const seen = new Set<string>();
    const stack = [entry];
    while (stack.length) {
      const file = stack.pop() as string;
      if (seen.has(file)) continue;
      seen.add(file);
      for (const ref of getImports(file)) {
        if (!ref.typeOnly && ref.resolved) stack.push(ref.resolved);
      }
    }
    return seen;
  }

  it("only exposes browser-safe code (no services, repositories, Prisma client, Hono or Supabase)", () => {
    const closure = [...runtimeClosure(path.join(SRC, "contracts/index.ts"))];
    const unsafeFiles = closure
      .map(rel)
      .filter((file) => BROWSER_UNSAFE.test(file) || file === "main.ts");
    const unsafePackages = closure.flatMap((file) =>
      getImports(file)
        .filter(
          (ref) =>
            !ref.typeOnly &&
            ["hono", "@hono/node-server", "@supabase/ssr", "@supabase/supabase-js"].includes(
              ref.spec
            )
        )
        .map((ref) => `${rel(file)} → ${ref.spec}`)
    );

    expect(unsafeFiles).toEqual([]);
    expect(unsafePackages).toEqual([]);
  });
});
