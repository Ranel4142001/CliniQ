/** A user as known to the external identity provider (Supabase Auth). */
export interface AuthIdentity {
  id: string;
  email?: string | null;
  fullName?: string | null;
}

/** Authentication operations, independent of the provider used to perform them. */
export interface IdentityProviderPort {
  /** The identity behind the current request's session, or null when signed out. */
  getSessionIdentity(): Promise<AuthIdentity | null>;
  /** Signs in and starts a session. Null when the credentials are wrong. */
  signIn(email: string, password: string): Promise<AuthIdentity | null>;
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
}
