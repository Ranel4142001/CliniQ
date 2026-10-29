import { describe, it, expect, vi } from "vitest";
import { withProfileCache } from "@backend/modules/auth/infrastructure/persistence/repositories/cached-profile.repository";
import type { ProfileRepositoryPort } from "@backend/modules/auth/application/ports/outbound/profile-repository.port";

const profile = {
  id: "prof-1",
  authId: "auth-1",
  email: "a@b.co",
  fullName: "A",
  role: "STAFF" as const,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  patient: null,
};

function setup() {
  let clock = 0;
  const repo = {
    findByAuthId: vi.fn().mockResolvedValue(profile),
    updateProfile: vi.fn().mockResolvedValue({ ...profile, isActive: false }),
  } as unknown as ProfileRepositoryPort & { findByAuthId: ReturnType<typeof vi.fn> };
  const cached = withProfileCache(repo, 30_000, () => clock);
  return { repo, cached, advance: (ms: number) => (clock += ms) };
}

describe("withProfileCache", () => {
  it("serves repeat lookups from memory within the TTL", async () => {
    const { repo, cached, advance } = setup();
    await cached.findByAuthId("auth-1");
    advance(29_000);
    await cached.findByAuthId("auth-1");
    expect(repo.findByAuthId).toHaveBeenCalledTimes(1);
  });

  it("reloads after the TTL expires", async () => {
    const { repo, cached, advance } = setup();
    await cached.findByAuthId("auth-1");
    advance(30_001);
    await cached.findByAuthId("auth-1");
    expect(repo.findByAuthId).toHaveBeenCalledTimes(2);
  });

  it("evicts immediately when an admin changes the profile (e.g. deactivation)", async () => {
    const { repo, cached } = setup();
    await cached.findByAuthId("auth-1");
    await cached.updateProfile("prof-1", { isActive: false });
    await cached.findByAuthId("auth-1");
    expect(repo.findByAuthId).toHaveBeenCalledTimes(2);
  });

  it("does not cache missing profiles", async () => {
    const { repo, cached } = setup();
    repo.findByAuthId.mockResolvedValue(null);
    await cached.findByAuthId("auth-x");
    await cached.findByAuthId("auth-x");
    expect(repo.findByAuthId).toHaveBeenCalledTimes(2);
  });
});
