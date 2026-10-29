// Public API of the auth module. Other modules import only from here.
export { authController } from "./adapters/inbound/http/auth.controller";
export { requireAuth } from "./adapters/inbound/http/require-auth";
export { authService } from "./auth.module";
export { can, type AuthAction } from "./domain/services/permissions";
export type { UserProfile } from "./application/dto/auth.types";
