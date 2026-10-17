import { authRepository } from "../repositories/auth.repository";
import { can } from "../permissions";
import { createAdminClient } from "@/shared/lib/supabase/admin";
import {
  NotFoundError,
  ForbiddenError,
  ConflictError,
  ValidationError,
} from "@/shared/lib/errors";
import { getPaginationSkipTake, buildPaginatedResponse } from "@/shared/lib/pagination";
import { CreateUserInput, UpdateUserInput } from "../schemas/auth.schema";
import { UserProfile } from "../types/auth.types";
import { Role } from "@prisma/client";

export const authService = {
  async ensureProfile(authUser: {
    id: string;
    email?: string | null;
    user_metadata?: { full_name?: string };
  }): Promise<UserProfile> {
    const existing = await authRepository.findByAuthId(authUser.id);
    if (existing) return existing;

    const email = authUser.email || `user-${authUser.id}@cliniq.local`;
    const fullName = authUser.user_metadata?.full_name || email.split("@")[0] || "User";

    return authRepository.createProfile({
      authId: authUser.id,
      email,
      fullName,
      role: "PATIENT",
      isActive: true,
    });
  },

  async getCurrentProfile(authId: string): Promise<UserProfile> {
    const profile = await authRepository.findByAuthId(authId);
    if (!profile) {
      throw new NotFoundError("User profile not found");
    }
    if (!profile.isActive) {
      throw new ForbiddenError("Your account has been deactivated. Please contact an administrator.");
    }
    return profile;
  },

  async listUsers(
    currentProfile: { role: Role },
    params: { page?: number; pageSize?: number; search?: string; role?: Role }
  ) {
    if (!can(currentProfile.role, "manage_users")) {
      throw new ForbiddenError("You do not have permission to manage user accounts");
    }

    const { page = 1, pageSize = 10, search, role } = params;
    const { skip, take } = getPaginationSkipTake(page, pageSize);

    const [items, total] = await Promise.all([
      authRepository.listProfiles({ skip, take, search, role }),
      authRepository.countProfiles({ search, role }),
    ]);

    return buildPaginatedResponse(items, total, page, pageSize);
  },

  async createUser(
    currentProfile: { role: Role },
    input: CreateUserInput
  ): Promise<UserProfile> {
    if (!can(currentProfile.role, "manage_users")) {
      throw new ForbiddenError("You do not have permission to create user accounts");
    }

    const existing = await authRepository.findByEmail(input.email);
    if (existing) {
      throw new ConflictError("A user with this email address already exists");
    }

    const supabaseAdmin = createAdminClient();
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: input.email,
      password: input.password,
      email_confirm: true,
      user_metadata: { full_name: input.fullName },
    });

    if (error || !data.user) {
      // In development/demo mode without live Supabase, generate demo auth ID
      console.warn("Supabase Admin API unavailable, using simulated auth account:", error?.message);
    }

    const authId = data.user?.id || `simulated-${Date.now()}`;

    return authRepository.createProfile({
      authId,
      email: input.email,
      fullName: input.fullName,
      role: input.role as Role,
      isActive: true,
    });
  },

  async updateUser(
    currentProfile: { id: string; role: Role },
    targetUserId: string,
    input: UpdateUserInput
  ): Promise<UserProfile> {
    if (!can(currentProfile.role, "manage_users")) {
      throw new ForbiddenError("You do not have permission to update user accounts");
    }

    if (currentProfile.id === targetUserId && input.isActive === false) {
      throw new ValidationError("Administrators cannot deactivate their own account");
    }

    const target = await authRepository.findById(targetUserId);
    if (!target) {
      throw new NotFoundError("Target user not found");
    }

    return authRepository.updateProfile(targetUserId, {
      role: input.role,
      isActive: input.isActive,
    });
  },
};
