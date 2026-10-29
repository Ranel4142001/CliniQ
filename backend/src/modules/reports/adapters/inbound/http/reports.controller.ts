import { Hono } from "hono";
import { requireAuth } from "@backend/modules/auth";
import type { ReportKey } from "@backend/modules/reports/application/dto/reports.types";
import { reportsService } from "@backend/modules/reports/reports.module";
import { withApiHandler } from "@backend/shared/adapters/http/api-handler";
import { ROLES } from "@backend/shared/domain/roles";
import { z } from "zod";

const reportKeySchema = z.enum([
  "appointments",
  "consultations",
  "inventory",
  "movements",
  "prescriptions",
]);

export const reportsController = new Hono();

reportsController.get(
  "/api/reports/:reportKey",
  withApiHandler(async (req: Request, context) => {
    await requireAuth([ROLES.ADMIN, ROLES.STAFF, ROLES.CLINICIAN]);
    const reportKey: ReportKey = reportKeySchema.parse(context?.params?.reportKey);

    const url = new URL(req.url);
    const from = url.searchParams.get("from") || undefined;
    const to = url.searchParams.get("to") || undefined;
    const status = url.searchParams.get("status") || undefined;
    const search = url.searchParams.get("search") || undefined;

    const data = await reportsService.generateReport(reportKey, { from, to, status, search });

    return { data };
  })
);
