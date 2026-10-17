import { NextRequest } from "next/server";
import { withApiHandler } from "@/shared/lib/api-handler";
import { requireAuth } from "@/features/auth/utils/auth-guards";
import { authService } from "@/features/auth/services/auth.service";
import { updateUserSchema } from "@/features/auth/schemas/auth.schema";
import { ROLES } from "@/shared/constants/roles";

export const PATCH = withApiHandler(
  async (req: NextRequest, context?: { params?: Record<string, string | string[]> }) => {
    const currentProfile = await requireAuth([ROLES.ADMIN]);
    const id = context?.params?.id as string;
    const body = await req.json();
    const input = updateUserSchema.parse(body);

    const updated = await authService.updateUser(currentProfile, id, input);
    return { data: updated };
  }
);
