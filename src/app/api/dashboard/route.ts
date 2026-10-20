import { withApiHandler } from "@/shared/lib/api-handler";
import { requireAuth } from "@/features/auth/utils/auth-guards";
import { dashboardService } from "@/features/dashboard/services/dashboard.service";

export const dynamic = "force-dynamic";

export const GET = withApiHandler(async () => {
  const user = await requireAuth();
  const dashboard = await dashboardService.getDashboardData(user);

  return { data: dashboard };
});
