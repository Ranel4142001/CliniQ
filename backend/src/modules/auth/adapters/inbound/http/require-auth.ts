import { Role } from "@prisma/client";
import { ForbiddenError } from "@backend/shared/domain/errors/app-error";
import { authService } from "@backend/modules/auth/auth.module";
import { UserProfile } from "@backend/modules/auth/application/dto/auth.types";
import { memoizePerRequest } from "@backend/shared/adapters/http/request-context";

/** Request-scoped: resolves the session and its CliniQ profile once per request. */
function getAuthenticatedUser(): Promise<UserProfile> {
  return memoizePerRequest("auth:profile", () => authService.getSessionProfile());
}

export async function requireAuth(allowedRoles?: Role[]): Promise<UserProfile> {
  const profile = await getAuthenticatedUser();

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(profile.role)) {
    throw new ForbiddenError("You do not have permission to perform this action");
  }

  return profile;
}
