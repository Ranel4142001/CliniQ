import { NextRequest } from "next/server";
import { withApiHandler } from "@/shared/lib/api-handler";
import { requireAuth } from "@/features/auth/utils/auth-guards";
import { prescriptionService } from "@/features/prescriptions/services/prescription.service";
import { updatePrescriptionSchema } from "@/features/prescriptions/schemas/prescription.schema";
import { ROLES } from "@/shared/constants/roles";
import { z } from "zod";

export const dynamic = "force-dynamic";

const idSchema = z.string().uuid("Invalid prescription ID");

export const GET = withApiHandler(async (_req: NextRequest, context) => {
  const user = await requireAuth();
  const id = idSchema.parse(context?.params?.id);

  const prescription = await prescriptionService.getPrescription(
    { id: user.id, role: user.role, patientId: user.id },
    id
  );

  return { data: prescription };
});

export const PATCH = withApiHandler(async (req: NextRequest, context) => {
  const user = await requireAuth([ROLES.CLINICIAN, ROLES.ADMIN]);
  const id = idSchema.parse(context?.params?.id);
  const body = await req.json();
  const input = updatePrescriptionSchema.parse(body);

  const updated = await prescriptionService.updatePrescription(
    { id: user.id, role: user.role },
    id,
    input
  );

  return { data: updated };
});
