import { NextRequest } from "next/server";
import { withApiHandler } from "@/shared/lib/api-handler";
import { requireAuth } from "@/features/auth/utils/auth-guards";
import { reportsService } from "@/features/reports/services/reports.service";
import { ROLES } from "@/shared/constants/roles";
import { z } from "zod";
import type { ReportKey } from "@/features/reports/types/reports.types";

export const dynamic = "force-dynamic";

const reportKeySchema = z.enum([
  "appointments",
  "consultations",
  "inventory",
  "movements",
  "prescriptions",
]);

export const GET = withApiHandler(async (req: NextRequest, context) => {
  await requireAuth([ROLES.ADMIN, ROLES.STAFF, ROLES.CLINICIAN]);
  const rawKey = context?.params?.reportKey as string;
  const reportKey = reportKeySchema.parse(rawKey) as ReportKey;

  const url = new URL(req.url);
  const from = url.searchParams.get("from") || undefined;
  const to = url.searchParams.get("to") || undefined;
  const status = url.searchParams.get("status") || undefined;
  const search = url.searchParams.get("search") || undefined;

  const data = await reportsService.generateReport(reportKey, { from, to, status, search });

  return { data };
});
