import { Hono } from "hono";
import { requireAuth } from "@backend/modules/auth/adapters/inbound/http/require-auth";
import {
  changeEmailSchema,
  changePasswordSchema,
  createUserSchema,
  loginSchema,
  registerSchema,
  updateOwnProfileSchema,
  updateUserSchema,
} from "@backend/modules/auth/application/dto/auth.schema";
import { authService } from "@backend/modules/auth/auth.module";
import { withApiHandler } from "@backend/shared/adapters/http/api-handler";
import { getBodyEmail, rateLimit } from "@backend/shared/adapters/http/rate-limit";
import { getIdParam } from "@backend/shared/adapters/http/route-params";
import { paginationSchema } from "@backend/shared/application/pagination";
import { ROLES } from "@backend/shared/domain/roles";
import { Role } from "@prisma/client";
import { z } from "zod";

const roleFilterSchema = z.nativeEnum(Role).optional();

export const authController = new Hono();

const FIFTEEN_MINUTES = 15 * 60 * 1000;
const ONE_HOUR = 60 * 60 * 1000;

// Limit password guessing per address and per targeted account.
const loginLimit = rateLimit({
  name: "login",
  max: 10,
  windowMs: FIFTEEN_MINUTES,
  extraKeys: async (c) => {
    const email = await getBodyEmail(c);
    return [email && `email:${email}`];
  },
});
const registerLimit = rateLimit({ name: "register", max: 5, windowMs: ONE_HOUR });
// Email and password changes re-check the current password, so they are guessable too.
const passwordCheckLimit = rateLimit({ name: "password-check", max: 5, windowMs: FIFTEEN_MINUTES });

authController.post(
  "/api/auth/login",
  loginLimit,
  withApiHandler(async (req: Request) => {
    const input = loginSchema.parse(await req.json());
    const profile = await authService.login(input);
    return { data: profile };
  })
);

authController.post(
  "/api/auth/logout",
  withApiHandler(async () => {
    await authService.logout();
    return { data: { success: true } };
  })
);

authController.post(
  "/api/auth/register",
  registerLimit,
  withApiHandler(async (req: Request) => {
    const input = registerSchema.parse(await req.json());
    const profile = await authService.register(input);
    return { data: profile, meta: { requiresEmailConfirmation: profile === null } };
  })
);

authController.get(
  "/api/clinicians",
  withApiHandler(
    async () => {
      await requireAuth();
      const clinicians = await authService.listActiveClinicians();
      return { data: clinicians };
    },
    { cacheSeconds: 60 }
  )
);

authController.get(
  "/api/me",
  withApiHandler(async () => {
    const profile = await requireAuth();
    return { data: profile };
  })
);

// Account settings: any signed-in role, always the caller's own account.

authController.patch(
  "/api/me",
  withApiHandler(async (req: Request) => {
    const profile = await requireAuth();
    const input = updateOwnProfileSchema.parse(await req.json());
    return { data: await authService.updateOwnProfile(profile, input) };
  })
);

authController.post(
  "/api/me/email",
  passwordCheckLimit,
  withApiHandler(async (req: Request) => {
    const profile = await requireAuth();
    const input = changeEmailSchema.parse(await req.json());
    return { data: await authService.changeEmail(profile, input) };
  })
);

authController.post(
  "/api/me/password",
  passwordCheckLimit,
  withApiHandler(async (req: Request) => {
    const profile = await requireAuth();
    const input = changePasswordSchema.parse(await req.json());
    await authService.changePassword(profile, input);
    return { data: { success: true } };
  })
);

authController.get(
  "/api/users",
  withApiHandler(async (req: Request) => {
    const currentProfile = await requireAuth([ROLES.ADMIN]);
    const searchParams = Object.fromEntries(new URL(req.url).searchParams.entries());
    const query = paginationSchema.parse(searchParams);
    const role = roleFilterSchema.parse(searchParams.role || undefined);

    const paginated = await authService.listUsers(currentProfile, {
      page: query.page,
      pageSize: query.pageSize,
      search: query.search,
      role,
    });

    return { data: paginated.items, meta: paginated };
  })
);

authController.post(
  "/api/users",
  withApiHandler(async (req: Request) => {
    const currentProfile = await requireAuth([ROLES.ADMIN]);
    const body = await req.json();
    const input = createUserSchema.parse(body);

    const newUser = await authService.createUser(currentProfile, input);
    return { data: newUser };
  })
);

authController.patch(
  "/api/users/:id",
  withApiHandler(async (req: Request, context) => {
    const currentProfile = await requireAuth([ROLES.ADMIN]);
    const id = getIdParam(context);
    const body = await req.json();
    const input = updateUserSchema.parse(body);

    const updated = await authService.updateUser(currentProfile, id, input);
    return { data: updated };
  })
);
