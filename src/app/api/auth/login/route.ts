import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { withApiHandler } from "@/shared/lib/api-handler";
import { createClient } from "@/shared/lib/supabase/server";
import { authService } from "@/features/auth/services/auth.service";
import { authRepository } from "@/features/auth/repositories/auth.repository";
import { loginSchema } from "@/features/auth/schemas/auth.schema";
import { UnauthorizedError, ForbiddenError } from "@/shared/lib/errors";
import { isDemoMode } from "@/shared/lib/supabase/demo-mode";

export const POST = withApiHandler(async (req: NextRequest) => {
  const body = await req.json();
  const { email, password } = loginSchema.parse(body);

  if (isDemoMode()) {
    // Fast path: resolve account directly from database or create/match profile
    let profile = await authRepository.findByEmail(email);
    if (!profile) {
      const isAdmin = email.toLowerCase().includes("admin");
      const fullName = email.toLowerCase() === "admin@gmail.com"
        ? "System Administrator"
        : (email.split("@")[0] || "User");

      const demoUser = {
        id: `demo-${email.replace(/[^a-zA-Z0-9]/g, "-")}`,
        email,
        user_metadata: { full_name: fullName },
      };
      profile = await authService.ensureProfile(
        demoUser,
        isAdmin ? "ADMIN" : "PATIENT"
      );
    }

    if (!profile.isActive) {
      throw new ForbiddenError("Your account has been deactivated. Please contact an administrator.");
    }

    // Persist session cookie for demo mode
    cookies().set("cliniq_demo_user", JSON.stringify(profile), {
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    return { data: profile };
  }

  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const profile = await authService.ensureProfile(data.user);

  if (!profile.isActive) {
    await supabase.auth.signOut();
    throw new ForbiddenError("Your account has been deactivated. Please contact an administrator.");
  }

  return { data: profile };
});
