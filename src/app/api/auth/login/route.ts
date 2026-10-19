import { NextRequest } from "next/server";
import { withApiHandler } from "@/shared/lib/api-handler";
import { createClient } from "@/shared/lib/supabase/server";
import { authService } from "@/features/auth/services/auth.service";
import { loginSchema } from "@/features/auth/schemas/auth.schema";
import { UnauthorizedError, ForbiddenError } from "@/shared/lib/errors";

export const POST = withApiHandler(async (req: NextRequest) => {
  const body = await req.json();
  const { email, password } = loginSchema.parse(body);

  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isDemoMode = supabaseKey === "demo-anon-key" || supabaseKey === "dummy-anon-key";

  if (error || !data.user) {
    if (isDemoMode) {
      console.warn("Supabase auth unavailable (demo mode), signing in with simulated profile");
      const demoUser = {
        id: `demo-${email.replace(/[^a-zA-Z0-9]/g, "-")}`,
        email,
        user_metadata: { full_name: email.split("@")[0] },
      };
      const profile = await authService.ensureProfile(demoUser);
      return { data: profile };
    }
    throw new UnauthorizedError("Invalid email or password");
  }

  const profile = await authService.ensureProfile(data.user);

  if (!profile.isActive) {
    await supabase.auth.signOut();
    throw new ForbiddenError("Your account has been deactivated. Please contact an administrator.");
  }

  return { data: profile };
});
