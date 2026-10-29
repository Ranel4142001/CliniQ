import { Hono } from "hono";
import { requireAuth } from "@backend/modules/auth";
import { dashboardService } from "@backend/modules/dashboard/dashboard.module";
import { withApiHandler } from "@backend/shared/adapters/http/api-handler";

export const dashboardController = new Hono();

dashboardController.get(
  "/api/dashboard",
  withApiHandler(async () => {
    const user = await requireAuth();
    const dashboard = await dashboardService.getDashboardData(user);

    return { data: dashboard };
  })
);
