import { NextRequest } from "next/server";
import { withApiHandler } from "@/shared/lib/api-handler";
import { requireAuth } from "@/features/auth/utils/auth-guards";
import { authService } from "@/features/auth/services/auth.service";
import { createUserSchema } from "@/features/auth/schemas/auth.schema";
import { paginationSchema } from "@/shared/lib/pagination";
import { ROLES } from "@/shared/constants/roles";
import { Role } from "@prisma/client";

export const GET = withApiHandler(async (req: NextRequest) => {
  const currentProfile = await requireAuth([ROLES.ADMIN]);
  const searchParams = Object.fromEntries(req.nextUrl.searchParams.entries());
  const query = paginationSchema.parse(searchParams);
  const role = searchParams.role as Role | undefined;

  const paginated = await authService.listUsers(currentProfile, {
    page: query.page,
    pageSize: query.pageSize,
    search: query.search,
    role,
  });

  return { data: paginated.items, meta: paginated };
});

export const POST = withApiHandler(async (req: NextRequest) => {
  const currentProfile = await requireAuth([ROLES.ADMIN]);
  const body = await req.json();
  const input = createUserSchema.parse(body);

  const newUser = await authService.createUser(currentProfile, input);
  return { data: newUser };
});
