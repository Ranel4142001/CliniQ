import { z } from "zod";

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url("NEXT_PUBLIC_SUPABASE_URL must be a valid URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY is required"),
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;

function parseEnv<T extends z.ZodTypeAny>(
  schema: T,
  source: Record<string, string | undefined>
): z.infer<T> {
  const result = schema.safeParse(source);
  if (result.success) return result.data;

  const details = result.error.issues
    .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
    .join("\n");
  throw new Error(
    `Invalid or missing environment variables:\n${details}\n\nSee frontend/.env.example`
  );
}

let cachedPublicEnv: PublicEnv | undefined;

/** Browser-safe configuration. Variables are referenced literally so Next.js can inline them. */
export function getPublicEnv(): PublicEnv {
  cachedPublicEnv ??= parseEnv(publicEnvSchema, {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });
  return cachedPublicEnv;
}
