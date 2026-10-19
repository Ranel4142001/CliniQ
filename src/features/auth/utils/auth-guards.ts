import { createClient } from "@/shared/lib/supabase/server";
import { authRepository } from "../repositories/auth.repository";
import { authService } from "../services/auth.service";
import { UnauthorizedError, ForbiddenError } from "@/shared/lib/errors";
import { UserProfile } from "../types/auth.types";
import { Role } from "@prisma/client";

export async function requireAuth(allowedRoles?: Role[]): Promise<UserProfile> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isDemoMode = supabaseKey === "demo-anon-key" || supabaseKey === "dummy-anon-key";

  if (!user) {
    if (isDemoMode) {
      return {
        id: "demo-admin-id",
        authId: "demo-admin-auth",
        email: "admin@cliniq.local",
        fullName: "System Administrator",
        role: "ADMIN" as Role,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
    throw new UnauthorizedError("You must be logged in to access this resource");
  }

  // Use explicit UserProfile typing to reconcile the two different Prisma return shapes
  // (findByAuthId includes patient relation; ensureProfile/createProfile does not).
  let profile: UserProfile | null = await authRepository.findByAuthId(user.id) as UserProfile | null;
  if (!profile) {
    profile = (await authService.ensureProfile(user)) as UserProfile;
  }

  // ensureProfile should always return a profile, but guard defensively
  if (!profile) {
    throw new UnauthorizedError("User profile could not be established");
  }

  if (!profile.isActive) {
    throw new ForbiddenError("Your account has been deactivated. Please contact an administrator.");
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(profile.role)) {
    throw new ForbiddenError("You do not have permission to perform this action");
  }

  return profile;
}
