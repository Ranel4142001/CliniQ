import { NextRequest } from "next/server";
import { withApiHandler } from "@/shared/lib/api-handler";
import { requireAuth } from "@/features/auth/utils/auth-guards";
import { medicineService } from "@/features/medicines/services/medicine.service";
import { updateMedicineSchema } from "@/features/medicines/schemas/medicine.schema";
import { ROLES } from "@/shared/constants/roles";
import { z } from "zod";

export const dynamic = "force-dynamic";

const idSchema = z.string().uuid("Invalid medicine ID");

export const GET = withApiHandler(async (_req: NextRequest, context) => {
  await requireAuth([ROLES.ADMIN, ROLES.STAFF, ROLES.CLINICIAN]);
  const id = idSchema.parse(context?.params?.id);

  const medicine = await medicineService.getMedicine(id);

  return { data: medicine };
});

export const PATCH = withApiHandler(async (req: NextRequest, context) => {
  const user = await requireAuth([ROLES.ADMIN, ROLES.STAFF]);
  const id = idSchema.parse(context?.params?.id);
  const body = await req.json();
  const input = updateMedicineSchema.parse(body);

  const updated = await medicineService.updateMedicine(user, id, input);

  return { data: updated };
});
