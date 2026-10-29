import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  /** Interface to bind. 0.0.0.0 so other containers (the frontend) can reach the API. */
  HOST: z.string().min(1).default("0.0.0.0"),
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid PostgreSQL URL"),
  DIRECT_URL: z.string().url("DIRECT_URL must be a valid URL").optional(),
  SUPABASE_URL: z.string().url("SUPABASE_URL must be a valid URL"),
  SUPABASE_ANON_KEY: z.string().min(1, "SUPABASE_ANON_KEY is required"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, "SUPABASE_SERVICE_ROLE_KEY is required"),
});

export type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | undefined;

/** Validated server configuration. Fails fast with a readable list of missing variables. */
export function getEnv(): Env {
  if (cachedEnv) return cachedEnv;

  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(
      `Invalid or missing environment variables:\n${details}\n\nSee backend/.env.example`
    );
  }

  cachedEnv = result.data;
  return cachedEnv;
}
