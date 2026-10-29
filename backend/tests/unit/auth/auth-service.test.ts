import { describe, it, expect, vi } from "vitest";
import { createAuthService } from "@backend/modules/auth/application/services/auth.service";
import type { ProfileRepositoryPort } from "@backend/modules/auth/application/ports/outbound/profile-repository.port";
import type { IdentityProviderPort } from "@backend/modules/auth/application/ports/outbound/identity-provider.port";
import {
  ValidationError,
  ForbiddenError,
  ConflictError,
  UnauthorizedError,
} from "@backend/shared/domain/errors/app-error";

const baseProfile = {
  id: "prof-1",
  authId: "auth-1",
  email: "patient@test.local",
  fullName: "Test Patient",
  role: "PATIENT" as const,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

function setup(
  overrides: {
    repo?: Partial<ProfileRepositoryPort>;
    identity?: Partial<IdentityProviderPort>;
  } = {}
) {
  const authRepository = {
    findByAuthId: vi.fn().mockResolvedValue(null),
    findById: vi.fn().mockResolvedValue(null),
    findByEmail: vi.fn().mockResolvedValue(null),
    createProfile: vi.fn().mockResolvedValue(baseProfile),
    updateProfile: vi.fn(),
    listProfiles: vi.fn().mockResolvedValue([]),
    countProfiles: vi.fn().mockResolvedValue(0),
    listActiveClinicians: vi.fn().mockResolvedValue([]),
    ...overrides.repo,
  } satisfies ProfileRepositoryPort;
  const identityProvider = {
    getSessionIdentity: vi.fn().mockResolvedValue(null),
    signIn: vi.fn().mockResolvedValue(null),
    signUp: vi.fn().mockResolvedValue(null),
    signOut: vi.fn().mockResolvedValue(undefined),
    createConfirmedUser: vi.fn().mockResolvedValue(null),
    ...overrides.identity,
  } satisfies IdentityProviderPort;
  return {
    service: createAuthService({ authRepository, identityProvider }),
    authRepository,
    identityProvider,
  };
}

describe("Auth Service Business Rules", () => {
  it("prevents an administrator from deactivating their own account", async () => {
    const { service } = setup();
    await expect(
      service.updateUser({ id: "admin-1", role: "ADMIN" }, "admin-1", { isActive: false })
    ).rejects.toThrow(ValidationError);
  });

  it("prevents an administrator from changing their own role", async () => {
    const { service } = setup();
    await expect(
      service.updateUser({ id: "admin-1", role: "ADMIN" }, "admin-1", { role: "STAFF" })
    ).rejects.toThrow(ValidationError);
  });

  it("blocks non-admins from managing user accounts", async () => {
    const { service } = setup();
    await expect(service.listUsers({ role: "CLINICIAN" }, {})).rejects.toThrow(ForbiddenError);
  });

  it("assigns PATIENT role to self-provisioned profiles, even if the email contains 'admin'", async () => {
    const { service, authRepository } = setup();
    await service.getOrCreateProfile({ id: "auth-new", email: "admin.attacker@test.local" });
    expect(authRepository.createProfile).toHaveBeenCalledWith(
      expect.objectContaining({ role: "PATIENT" })
    );
  });

  it("never attaches a new auth identity to an existing profile with the same email", async () => {
    const { service, authRepository } = setup({
      repo: { findByEmail: vi.fn().mockResolvedValue({ ...baseProfile, role: "CLINICIAN" }) },
    });
    await expect(
      service.getOrCreateProfile({ id: "auth-other", email: baseProfile.email })
    ).rejects.toThrow(ConflictError);
    expect(authRepository.createProfile).not.toHaveBeenCalled();
  });

  it("rejects deactivated profiles", async () => {
    const { service } = setup({
      repo: {
        findByAuthId: vi.fn().mockResolvedValue({ ...baseProfile, isActive: false, patient: null }),
      },
    });
    await expect(
      service.getOrCreateProfile({ id: baseProfile.authId, email: baseProfile.email })
    ).rejects.toThrow(ForbiddenError);
  });

  it("requires a session to resolve the current profile", async () => {
    const { service } = setup();
    await expect(service.getSessionProfile()).rejects.toThrow(UnauthorizedError);
  });

  it("signs the user out again if their profile cannot be used after login", async () => {
    const { service, identityProvider } = setup({
      identity: {
        signIn: vi.fn().mockResolvedValue({ id: baseProfile.authId, email: baseProfile.email }),
      },
      repo: {
        findByAuthId: vi.fn().mockResolvedValue({ ...baseProfile, isActive: false, patient: null }),
      },
    });
    await expect(service.login({ email: baseProfile.email, password: "x" })).rejects.toThrow(
      ForbiddenError
    );
    expect(identityProvider.signOut).toHaveBeenCalled();
  });
});
