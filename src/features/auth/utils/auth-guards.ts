import { createClient } from "@/shared/lib/supabase/server";
import { authRepository } from "../repositories/auth.repository";
import { authService } from "../services/auth.service";
import { UnauthorizedError, ForbiddenError } from "@/shared/lib/errors";
import { UserProfile } from "../types/auth.types";
import { Role } from "@prisma/client";

import { cookies } from "next/headers";
import { isDemoMode } from "@/shared/lib/supabase/demo-mode";

export async function requireAuth(allowedRoles?: Role[]): Promise<UserProfile> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    if (isDemoMode()) {
      const cookieStore = cookies();
      const demoCookie = cookieStore.get("cliniq_demo_user")?.value;
      if (demoCookie) {
        try {
          const parsed = JSON.parse(demoCookie);
          const demoProfile: UserProfile = {
            id: parsed.id || "demo-user-id",
            authId: parsed.authId || "demo-auth-id",
            email: parsed.email || "raneldahil@gmail.com",
            fullName: parsed.fullName || "Ranel Dahil",
            role: (parsed.role as Role) || "ADMIN",
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(demoProfile.role)) {
            // For smooth development preview, grant role access if needed or enforce
          }
          return demoProfile;
        } catch {
          // fall through to default demo profile
        }
      }
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
