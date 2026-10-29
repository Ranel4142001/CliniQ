import type {
  ProfileRepositoryPort,
  ProfileWithPatient,
} from "@backend/modules/auth/application/ports/outbound/profile-repository.port";

const DEFAULT_TTL_MS = 30_000;
const MAX_ENTRIES = 1_000;

interface Entry {
  profile: ProfileWithPatient;
  expiresAt: number;
}

/**
 * Caches the per-request profile lookup (`findByAuthId`) in memory, saving one
 * database round trip on every authenticated request.
 *
 * Role or status changes made through this repository evict the entry at once.
 * Changes made outside this process (another server instance, manual SQL) apply
 * within `ttlMs`.
 */
export function withProfileCache(
  repository: ProfileRepositoryPort,
  ttlMs = DEFAULT_TTL_MS,
  now: () => number = Date.now
): ProfileRepositoryPort {
  const byAuthId = new Map<string, Entry>();

  const evictProfile = (profileId: string) => {
    for (const [authId, entry] of byAuthId) {
      if (entry.profile.id === profileId) byAuthId.delete(authId);
    }
  };

  return {
    ...repository,

    async findByAuthId(authId) {
      const hit = byAuthId.get(authId);
      if (hit && hit.expiresAt > now()) return hit.profile;

      const profile = await repository.findByAuthId(authId);
      byAuthId.delete(authId);
      if (profile) {
        if (byAuthId.size >= MAX_ENTRIES) byAuthId.delete(byAuthId.keys().next().value as string);
        byAuthId.set(authId, { profile, expiresAt: now() + ttlMs });
      }
      return profile;
    },

    async updateProfile(id, data) {
      evictProfile(id);
      const updated = await repository.updateProfile(id, data);
      evictProfile(id);
      return updated;
    },
  };
}
