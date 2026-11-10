import { Role } from "@prisma/client";
import { can } from "@backend/modules/auth/domain/services/permissions";
import type { ProfileRepositoryPort } from "@backend/modules/auth/application/ports/outbound/profile-repository.port";
import type {
  AuthIdentity,
  IdentityProviderPort,
} from "@backend/modules/auth/application/ports/outbound/identity-provider.port";
import {
  NotFoundError,
  ForbiddenError,
  ConflictError,
  ValidationError,
  UnauthorizedError,
  AppError,
} from "@backend/shared/domain/errors/app-error";
import {
  getPaginationSkipTake,
  buildPaginatedResponse,
} from "@backend/shared/application/pagination";
import {
  ChangeEmailInput,
  ChangePasswordInput,
  CreateUserInput,
  LoginInput,
  UpdateOwnProfileInput,
  RegisterInput,
  UpdateUserInput,
} from "@backend/modules/auth/application/dto/auth.schema";
import { UserProfile } from "@backend/modules/auth/application/dto/auth.types";

const DEACTIVATED_MESSAGE = "Your account has been deactivated. Please contact an administrator.";

function assertActive(profile: UserProfile): UserProfile {
  if (!profile.isActive) throw new ForbiddenError(DEACTIVATED_MESSAGE);
  return profile;
}

function assertCanManageUsers(role: Role) {
  if (!can(role, "manage_users")) {
    throw new ForbiddenError("You do not have permission to manage user accounts");
  }
}

const WRONG_PASSWORD_MESSAGE = "Your current password is incorrect.";

export interface AuthServiceDeps {
  authRepository: ProfileRepositoryPort;
  identityProvider: IdentityProviderPort;
}

export type AuthService = ReturnType<typeof createAuthService>;

export function createAuthService({ authRepository, identityProvider }: AuthServiceDeps) {
  return {
    /**
     * Resolves the CliniQ profile for a Supabase auth user, creating one on first login.
     * Self-provisioned profiles are always PATIENT; elevated roles are granted only by an admin.
     */
    async getOrCreateProfile(authUser: AuthIdentity): Promise<UserProfile> {
      const existing = await authRepository.findByAuthId(authUser.id);
      if (existing) return assertActive(await this.syncConfirmedEmail(existing, authUser));

      if (!authUser.email) {
        throw new UnauthorizedError("Your account has no email address on record");
      }

      // Never attach a new auth identity to an existing profile: that would let anyone
      // who registers a matching email take over a pre-provisioned (possibly privileged) account.
      if (await authRepository.findByEmail(authUser.email)) {
        throw new ConflictError("This email is already linked to another account");
      }

      return authRepository.createProfile({
        authId: authUser.id,
        email: authUser.email,
        fullName: authUser.fullName || authUser.email.split("@")[0],
        role: "PATIENT",
      });
    },

    /**
     * After a user confirms an email change, the identity provider reports the new address;
     * copy it onto the profile so the app shows (and signs in with) the same email.
     */
    async syncConfirmedEmail<T extends UserProfile>(
      profile: T,
      authUser: AuthIdentity
    ): Promise<T> {
      const confirmed = authUser.email?.toLowerCase();
      if (!confirmed || confirmed === profile.email) return profile;
      const owner = await authRepository.findByEmail(confirmed);
      if (owner && owner.id !== profile.id) return profile;
      await authRepository.updateProfile(profile.id, { email: confirmed });
      return { ...profile, email: confirmed };
    },

    /** The profile behind the current session. Throws when signed out or deactivated. */
    async getSessionProfile(): Promise<UserProfile> {
      const identity = await identityProvider.getSessionIdentity();
      if (!identity) {
        throw new UnauthorizedError("You must be logged in to access this resource");
      }
      return this.getOrCreateProfile(identity);
    },

    async login({ email, password }: LoginInput): Promise<UserProfile> {
      const result = await identityProvider.signIn(email, password);
      if (!result.ok) {
        // Supabase reports "not confirmed" only after the password checked out, so this reveals nothing to guessers.
        if (result.reason === "email_not_confirmed") {
          throw new ForbiddenError(
            "Please confirm your email address first. Check your inbox (and spam folder) for the link."
          );
        }
        throw new UnauthorizedError("Invalid email or password");
      }

      try {
        return await this.getOrCreateProfile(result.identity);
      } catch (err) {
        await identityProvider.signOut();
        throw err;
      }
    },

    async register({ email, password, fullName }: RegisterInput): Promise<UserProfile | null> {
      if (await authRepository.findByEmail(email)) {
        throw new ConflictError("An account with this email address already exists");
      }

      const result = await identityProvider.signUp({ email, password, fullName });
      if (!result) {
        throw new ConflictError("Registration failed. Please try again.");
      }

      // With email confirmation enabled there is no session yet; the profile is created on first login.
      return result.hasSession ? this.getOrCreateProfile(result.identity) : null;
    },

    async logout(): Promise<void> {
      await identityProvider.signOut();
    },

    async listUsers(
      currentProfile: { role: Role },
      params: { page?: number; pageSize?: number; search?: string; role?: Role }
    ) {
      assertCanManageUsers(currentProfile.role);

      const { page = 1, pageSize = 10, search, role } = params;
      const { skip, take } = getPaginationSkipTake(page, pageSize);

      const [items, total] = await Promise.all([
        authRepository.listProfiles({ skip, take, search, role }),
        authRepository.countProfiles({ search, role }),
      ]);

      return buildPaginatedResponse(items, total, page, pageSize);
    },

    async listActiveClinicians() {
      return authRepository.listActiveClinicians();
    },

    async createUser(currentProfile: { role: Role }, input: CreateUserInput): Promise<UserProfile> {
      assertCanManageUsers(currentProfile.role);

      if (await authRepository.findByEmail(input.email)) {
        throw new ConflictError("A user with this email address already exists");
      }

      const authId = await identityProvider.createConfirmedUser({
        email: input.email,
        password: input.password,
        fullName: input.fullName,
      });
      if (!authId) {
        throw new AppError(
          "Could not create the authentication account",
          502,
          "AUTH_PROVIDER_ERROR"
        );
      }

      return authRepository.createProfile({
        authId,
        email: input.email,
        fullName: input.fullName,
        role: input.role,
      });
    },

    async updateUser(
      currentProfile: { id: string; role: Role },
      targetUserId: string,
      input: UpdateUserInput
    ): Promise<UserProfile> {
      assertCanManageUsers(currentProfile.role);

      const isSelf = currentProfile.id === targetUserId;
      const isRoleChange = input.role !== undefined && input.role !== currentProfile.role;
      if (isSelf && (input.isActive === false || isRoleChange)) {
        throw new ValidationError(
          "Administrators cannot deactivate or change the role of their own account"
        );
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

    // ---------- Account settings: every role, own account only ----------

    async updateOwnProfile(profile: UserProfile, input: UpdateOwnProfileInput) {
      return authRepository.updateProfile(profile.id, { fullName: input.fullName });
    },

    async assertCurrentPassword(profile: UserProfile, password: string): Promise<void> {
      if (!(await identityProvider.verifyPassword(profile.email, password))) {
        throw new ValidationError(WRONG_PASSWORD_MESSAGE);
      }
    },

    /** Sends a confirmation link to the new address; the email changes once it is followed. */
    async changeEmail(profile: UserProfile, { newEmail, currentPassword }: ChangeEmailInput) {
      if (newEmail === profile.email) {
        throw new ValidationError("That is already your email address.");
      }
      await this.assertCurrentPassword(profile, currentPassword);
      if (await authRepository.findByEmail(newEmail)) {
        throw new ConflictError("This email is already used by another account.");
      }

      const result = await identityProvider.requestEmailChange(newEmail);
      if (result.ok) return { pendingEmail: newEmail };
      if (result.reason === "email_taken") {
        throw new ConflictError("This email is already used by another account.");
      }
      throw new AppError(
        "Could not start the email change. Please try again.",
        502,
        "AUTH_PROVIDER_ERROR"
      );
    },

    async changePassword(profile: UserProfile, input: ChangePasswordInput): Promise<void> {
      await this.assertCurrentPassword(profile, input.currentPassword);
      if (!(await identityProvider.setPassword(profile.authId, input.newPassword))) {
        throw new AppError(
          "Could not change the password. Please try again.",
          502,
          "AUTH_PROVIDER_ERROR"
        );
      }
    },
  };
}
