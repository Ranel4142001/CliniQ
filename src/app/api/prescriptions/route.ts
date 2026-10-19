import { NextRequest } from "next/server";
import { withApiHandler } from "@/shared/lib/api-handler";
import { requireAuth } from "@/features/auth/utils/auth-guards";
import { prescriptionService } from "@/features/prescriptions/services/prescription.service";
import {
  createPrescriptionSchema,
  listPrescriptionsSchema,
} from "@/features/prescriptions/schemas/prescription.schema";
import { ROLES } from "@/shared/constants/roles";

export const dynamic = "force-dynamic";

export const GET = withApiHandler(async (req: NextRequest) => {
  const user = await requireAuth();
  const url = new URL(req.url);
  const query = listPrescriptionsSchema.parse(Object.fromEntries(url.searchParams));

  const result = await prescriptionService.listPrescriptions(
    { id: user.id, role: user.role, patientId: user.id },
    query
  );

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

export const POST = withApiHandler(async (req: NextRequest) => {
  const user = await requireAuth([ROLES.CLINICIAN, ROLES.ADMIN]);
  const body = await req.json();
  const input = createPrescriptionSchema.parse(body);

  const prescription = await prescriptionService.createPrescription(
    { id: user.id, role: user.role },
    input
  );

  return { data: prescription };
});
