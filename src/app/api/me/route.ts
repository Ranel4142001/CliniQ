import { withApiHandler } from "@/shared/lib/api-handler";
import { requireAuth } from "@/features/auth/utils/auth-guards";

export const dynamic = "force-dynamic";

export const GET = withApiHandler(async () => {
  const profile = await requireAuth();
  return { data: profile };
});
