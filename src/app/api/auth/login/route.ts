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
