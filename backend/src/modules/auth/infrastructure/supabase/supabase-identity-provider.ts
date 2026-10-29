import type { User } from "@supabase/supabase-js";
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
};
