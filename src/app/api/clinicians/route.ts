import { withApiHandler } from "@/shared/lib/api-handler";
import { requireAuth } from "@/features/auth/utils/auth-guards";
import { authRepository } from "@/features/auth/repositories/auth.repository";

export const dynamic = "force-dynamic";

export const GET = withApiHandler(async () => {
  await requireAuth();
  const clinicians = await authRepository.listActiveClinicians();
  return { data: clinicians };
}, { cacheSeconds: 60 });
