import { describe, it, expect, vi } from "vitest";
import { authService } from "@/features/auth/services/auth.service";
import { authRepository } from "@/features/auth/repositories/auth.repository";
import { ValidationError, ForbiddenError } from "@/shared/lib/errors";

describe("Auth Service Business Rules", () => {
  it("prevents an administrator from deactivating their own account", async () => {
    const adminUser = { id: "admin-1", role: "ADMIN" as const };

    await expect(
      authService.updateUser(adminUser, "admin-1", { isActive: false })
    ).rejects.toThrow(ValidationError);
  });

  it("blocks non-admins from managing user accounts", async () => {
    const clinicianUser = { id: "doc-1", role: "CLINICIAN" as const };

    await expect(
      authService.listUsers(clinicianUser, {})
    ).rejects.toThrow(ForbiddenError);
  });

  it("ensures new registered users are assigned PATIENT role automatically", async () => {
    vi.spyOn(authRepository, "findByAuthId").mockResolvedValue(null);
    const createSpy = vi.spyOn(authRepository, "createProfile").mockResolvedValue({
      id: "prof-1",
      authId: "auth-new",
      email: "patient@test.local",
      fullName: "Test Patient",
      role: "PATIENT",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const profile = await authService.ensureProfile({
      id: "auth-new",
      email: "patient@test.local",
    });

    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        role: "PATIENT",
      })
    );
    expect(profile.role).toBe("PATIENT");

    vi.restoreAllMocks();
  });
});
