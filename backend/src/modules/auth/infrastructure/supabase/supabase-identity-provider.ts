import { createClient as createSupabaseClient, type User } from "@supabase/supabase-js";
import { getEnv } from "@backend/shared/infrastructure/config/env";
import { createClient } from "./server-client";
import { createAdminClient } from "./admin-client";
import type {
  AuthIdentity,
  IdentityProviderPort,
} from "@backend/modules/auth/application/ports/outbound/identity-provider.port";

function toIdentity(user: User): AuthIdentity {
  const fullName = user.user_metadata?.full_name;
  return {
    id: user.id,
    email: user.email,
    fullName: typeof fullName === "string" ? fullName : null,
  };
}

/** Supabase Auth implementation of the identity provider port. Sessions live in request cookies. */
export const supabaseIdentityProvider: IdentityProviderPort = {
  async getSessionIdentity() {
    // getClaims() refreshes an expired session, then verifies the access token's signature
    // locally against the project's cached public keys (ES256): no network round trip per request.
    // Trade-off: a session revoked elsewhere stays valid until the token expires (≤1 hour);
    // deactivated accounts are still blocked immediately by the profile's isActive check.
    const { data, error } = await createClient().auth.getClaims();
    if (error || !data?.claims.sub) return null;
    const { sub, email, user_metadata: metadata } = data.claims;
    const fullName = metadata?.full_name;
    return { id: sub, email, fullName: typeof fullName === "string" ? fullName : null };
  },

  async signIn(email, password) {
    const { data, error } = await createClient().auth.signInWithPassword({ email, password });
    if (error?.code === "email_not_confirmed") return { ok: false, reason: "email_not_confirmed" };
    if (error || !data.user) return { ok: false, reason: "invalid_credentials" };
    return { ok: true, identity: toIdentity(data.user) };
  },

  async signUp({ email, password, fullName }) {
    const { data, error } = await createClient().auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error || !data.user) return null;
    return { identity: toIdentity(data.user), hasSession: Boolean(data.session) };
  },

  async signOut() {
    await createClient().auth.signOut();
  },

  async createConfirmedUser({ email, password, fullName }) {
    const { data, error } = await createAdminClient().auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });
    return error || !data.user ? null : data.user.id;
  },

  async verifyPassword(email, password) {
    // A throwaway client with no cookie storage, so the check never touches the live session.
    const { SUPABASE_URL, SUPABASE_ANON_KEY } = getEnv();
    const client = createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (data.session) await client.auth.signOut({ scope: "local" });
    return !error && Boolean(data.user);
  },

  async requestEmailChange(newEmail) {
    const { error } = await createClient().auth.updateUser({ email: newEmail });
    if (!error) return { ok: true };
    return { ok: false, reason: error.code === "email_exists" ? "email_taken" : "failed" };
  },

  async setPassword(identityId, newPassword) {
    const { error } = await createAdminClient().auth.admin.updateUserById(identityId, {
      password: newPassword,
    });
    return !error;
  },
};
