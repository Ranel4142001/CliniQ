import { NextRequest } from "next/server";
import { withApiHandler } from "@/shared/lib/api-handler";
import { requireAuth } from "@/features/auth/utils/auth-guards";
import { prescriptionService } from "@/features/prescriptions/services/prescription.service";
import { voidPrescriptionSchema } from "@/features/prescriptions/schemas/prescription.schema";
import { ROLES } from "@/shared/constants/roles";
import { z } from "zod";

export const dynamic = "force-dynamic";

const idSchema = z.string().uuid("Invalid prescription ID");

export const POST = withApiHandler(async (req: NextRequest, context) => {
  const user = await requireAuth([ROLES.CLINICIAN, ROLES.ADMIN]);
  const id = idSchema.parse(context?.params?.id);
  const body = await req.json();
  const input = voidPrescriptionSchema.parse(body);

  const voided = await prescriptionService.voidPrescription(
    { id: user.id, role: user.role },
    id,
    input
  );

  return { data: voided };
});
