import { withApiHandler } from "@/shared/lib/api-handler";
import { requireAuth } from "@/features/auth/utils/auth-guards";
import { prescriptionService } from "@/features/prescriptions/services/prescription.service";

export const dynamic = "force-dynamic";

export const GET = withApiHandler(async () => {
  const user = await requireAuth();
  const stats = await prescriptionService.getStats({
    id: user.id,
    role: user.role,
    patientId: user.id,
  });

  return { data: stats };
}, { cacheSeconds: 30 });
