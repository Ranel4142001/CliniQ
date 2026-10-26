import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { withApiHandler } from "@/shared/lib/api-handler";
import { createClient } from "@/shared/lib/supabase/server";
import { authService } from "@/features/auth/services/auth.service";
import { registerSchema } from "@/features/auth/schemas/auth.schema";
import { ConflictError } from "@/shared/lib/errors";
import { authRepository } from "@/features/auth/repositories/auth.repository";
import { isDemoMode } from "@/shared/lib/supabase/demo-mode";

export const POST = withApiHandler(async (req: NextRequest) => {
  const body = await req.json();
  const { email, password: _password, fullName } = registerSchema.parse(body);

  // Check for duplicate email before attempting signup
  try {
    const existing = await authRepository.findByEmail(email);
    if (existing) {
      throw new ConflictError("An account with this email address already exists");
    }
  } catch (err) {
    if (err instanceof ConflictError) throw err;
    console.warn("Database check skipped (demo mode):", err instanceof Error ? err.message : err);
  }

  // In demo mode: skip external Supabase call completely for instant response
  if (isDemoMode()) {
    const simulatedUser = {
      id: `simulated-${Date.now()}`,
      email,
      user_metadata: { full_name: fullName },
    };
    const profile = await authService.ensureProfile(simulatedUser);
    cookies().set("cliniq_demo_user", JSON.stringify(profile), {
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });
    return { data: profile };
  }

  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    options: {
      data: { full_name: fullName },
    },
    password: _password,
  });

  if (error || !data.user) {
    throw new ConflictError(error?.message || "Registration failed");
  }

  const profile = await authService.ensureProfile(data.user);
  return { data: profile };
});
