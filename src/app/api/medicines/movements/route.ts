import { NextRequest } from "next/server";
import { withApiHandler } from "@/shared/lib/api-handler";
import { requireAuth } from "@/features/auth/utils/auth-guards";
import { medicineService } from "@/features/medicines/services/medicine.service";
import { listMovementsSchema } from "@/features/medicines/schemas/medicine.schema";
import { ROLES } from "@/shared/constants/roles";

export const dynamic = "force-dynamic";

export const GET = withApiHandler(async (req: NextRequest) => {
  await requireAuth([ROLES.ADMIN, ROLES.STAFF, ROLES.CLINICIAN]);
  const url = new URL(req.url);
  const query = listMovementsSchema.parse(Object.fromEntries(url.searchParams));

  const result = await medicineService.listMovements(query);

  return {
    data: result.items,
    meta: {
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
    },
  };
});
