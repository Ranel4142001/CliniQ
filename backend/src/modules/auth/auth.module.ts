// Composition for the auth module: binds its ports to concrete adapters.
import { createAuthService } from "./application/services/auth.service";
import { authRepository } from "./infrastructure/persistence/repositories/auth.repository";
import { supabaseIdentityProvider } from "./infrastructure/supabase/supabase-identity-provider";

export const authService = createAuthService({
  authRepository,
  identityProvider: supabaseIdentityProvider,
});
