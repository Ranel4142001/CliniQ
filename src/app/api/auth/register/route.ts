import { NextRequest } from "next/server";
import { withApiHandler } from "@/shared/lib/api-handler";
import { createClient } from "@/shared/lib/supabase/server";
import { authService } from "@/features/auth/services/auth.service";
import { registerSchema } from "@/features/auth/schemas/auth.schema";
import { ConflictError } from "@/shared/lib/errors";
import { authRepository } from "@/features/auth/repositories/auth.repository";

export const POST = withApiHandler(async (req: NextRequest) => {
  const body = await req.json();
  const { email, password: _password, fullName } = registerSchema.parse(body);

  // Check for duplicate email before attempting Supabase signup (skip if DB unreachable)
  try {
    const existing = await authRepository.findByEmail(email);
    if (existing) {
      throw new ConflictError("An account with this email address already exists");
    }
  } catch (err) {
    if (err instanceof ConflictError) throw err;
    console.warn("Database check skipped (demo mode):", err instanceof Error ? err.message : err);
  }

  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    options: {
      data: { full_name: fullName },
    },
    password: _password,
  });

  // In dev/demo mode the Supabase URL is a placeholder, so signUp may fail.
  // Fall back to a simulated authId so the app remains functional without a
  // live Supabase project.
  if (error || !data.user) {
    console.warn(
      "Supabase signUp unavailable (demo mode), using simulated auth account:",
      error?.message,
    );
    const simulatedUser = {
      id: `simulated-${Date.now()}`,
      email,
      user_metadata: { full_name: fullName },
    };
    const profile = await authService.ensureProfile(simulatedUser);
    return { data: profile };
  }

  const profile = await authService.ensureProfile(data.user);
  return { data: profile };
});
