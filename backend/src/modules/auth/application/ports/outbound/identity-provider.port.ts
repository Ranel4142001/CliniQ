/** A user as known to the external identity provider (Supabase Auth). */
export interface AuthIdentity {
  id: string;
  email?: string | null;
  fullName?: string | null;
}

/** Outcome of a password sign-in. Failures say why, so the UI can guide the user. */
export type SignInResult =
  | { ok: true; identity: AuthIdentity }
  | { ok: false; reason: "invalid_credentials" | "email_not_confirmed" };

/** Authentication operations, independent of the provider used to perform them. */
export interface IdentityProviderPort {
  /** The identity behind the current request's session, or null when signed out. */
  getSessionIdentity(): Promise<AuthIdentity | null>;
  /** Signs in and starts a session. */
  signIn(email: string, password: string): Promise<SignInResult>;
  /** Registers a user. `hasSession` is false when email confirmation is required first. */
  signUp(input: {
    email: string;
    password: string;
    fullName: string;
  }): Promise<{ identity: AuthIdentity; hasSession: boolean } | null>;
  signOut(): Promise<void>;
  /** Creates a pre-confirmed account (admin action). Returns the new identity id, or null on failure. */
  createConfirmedUser(input: {
    email: string;
    password: string;
    fullName: string;
  }): Promise<string | null>;
  /** Checks a password without starting or changing any session. */
  verifyPassword(email: string, password: string): Promise<boolean>;
  /**
   * Starts an email change for the signed-in user. The provider emails a confirmation
   * link; the address changes only once it is followed.
   */
  requestEmailChange(
    newEmail: string
  ): Promise<{ ok: true } | { ok: false; reason: "email_taken" | "failed" }>;
  /** Sets a new password for an identity (call only after verifying the current one). */
  setPassword(identityId: string, newPassword: string): Promise<boolean>;
}
