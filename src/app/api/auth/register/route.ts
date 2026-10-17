import { NextRequest } from "next/server";
import { withApiHandler } from "@/shared/lib/api-handler";
import { createClient } from "@/shared/lib/supabase/server";
import { authService } from "@/features/auth/services/auth.service";
import { registerSchema } from "@/features/auth/schemas/auth.schema";
import { ValidationError } from "@/shared/lib/errors";

export const POST = withApiHandler(async (req: NextRequest) => {
  const body = await req.json();
  const { email, password, fullName } = registerSchema.parse(body);

  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error || !data.user) {
    throw new ValidationError(error?.message || "Registration failed");
  }

  const profile = await authService.ensureProfile(data.user);
  return { data: profile };
});
