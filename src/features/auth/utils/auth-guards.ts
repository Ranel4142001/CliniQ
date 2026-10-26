import { cache } from "react";
import { createClient } from "@/shared/lib/supabase/server";
import { prisma } from "@/shared/lib/prisma";
import { authRepository } from "../repositories/auth.repository";
import { authService } from "../services/auth.service";
import { UnauthorizedError, ForbiddenError } from "@/shared/lib/errors";
import { UserProfile } from "../types/auth.types";
import { Role } from "@prisma/client";
import { cookies } from "next/headers";
import { isDemoMode } from "@/shared/lib/supabase/demo-mode";

const getAuthenticatedUser = cache(async (): Promise<UserProfile> => {
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
          return demoProfile;
        } catch {
          // fall through to default demo profile
        }
      }

      try {
        const seededAdmin = await prisma.profile.findFirst({
          where: { role: "ADMIN" },
          select: { id: true, authId: true, email: true, fullName: true, role: true, isActive: true, createdAt: true, updatedAt: true },
        });
        if (seededAdmin) {
          return {
            id: seededAdmin.id,
            authId: seededAdmin.authId,
            email: seededAdmin.email,
            fullName: seededAdmin.fullName,
            role: seededAdmin.role,
            isActive: seededAdmin.isActive,
            createdAt: seededAdmin.createdAt,
            updatedAt: seededAdmin.updatedAt,
          };
        }
      } catch {
        // DB unreachable fallback
      }

      return {
        id: "5c9bb570-88a0-4460-bafb-ddbd2ed64192",
        authId: "auth-admin-01",
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

  let profile: UserProfile | null = await authRepository.findByAuthId(user.id) as UserProfile | null;
  if (!profile) {
    profile = (await authService.ensureProfile(user)) as UserProfile;
  }

  if (!profile) {
    throw new UnauthorizedError("User profile could not be established");
  }

  if (!profile.isActive) {
    throw new ForbiddenError("Your account has been deactivated. Please contact an administrator.");
  }

  return profile;
});

export async function requireAuth(allowedRoles?: Role[]): Promise<UserProfile> {
  const profile = await getAuthenticatedUser();

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(profile.role)) {
    throw new ForbiddenError("You do not have permission to perform this action");
  }

  return profile;
}
