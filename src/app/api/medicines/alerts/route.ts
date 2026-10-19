import { withApiHandler } from "@/shared/lib/api-handler";
import { requireAuth } from "@/features/auth/utils/auth-guards";
import { medicineService } from "@/features/medicines/services/medicine.service";
import { ROLES } from "@/shared/constants/roles";

export const dynamic = "force-dynamic";

export const GET = withApiHandler(async () => {
  await requireAuth([ROLES.ADMIN, ROLES.STAFF, ROLES.CLINICIAN]);

  const alerts = await medicineService.getAlerts();

  return { data: alerts };
});
