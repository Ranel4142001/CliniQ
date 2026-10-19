import { NextRequest } from "next/server";
import { withApiHandler } from "@/shared/lib/api-handler";
import { requireAuth } from "@/features/auth/utils/auth-guards";
import { prescriptionService } from "@/features/prescriptions/services/prescription.service";
import { ROLES } from "@/shared/constants/roles";
import { z } from "zod";

export const dynamic = "force-dynamic";

const idSchema = z.string().uuid("Invalid prescription ID");

export const POST = withApiHandler(async (_req: NextRequest, context) => {
  const user = await requireAuth([ROLES.STAFF, ROLES.ADMIN]);
  const id = idSchema.parse(context?.params?.id);

  const dispensed = await prescriptionService.dispensePrescription(
    { id: user.id, role: user.role },
    id
  );

  return { data: dispensed };
});
