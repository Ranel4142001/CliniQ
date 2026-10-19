import { NextRequest } from "next/server";
import { withApiHandler } from "@/shared/lib/api-handler";
import { requireAuth } from "@/features/auth/utils/auth-guards";
import { consultationService } from "@/features/consultations/services/consultation.service";
import { updateConsultationSchema } from "@/features/consultations/schemas/consultation.schema";
import { ROLES } from "@/shared/constants/roles";
import { z } from "zod";

export const dynamic = "force-dynamic";

const idSchema = z.string().uuid("Invalid consultation ID");

export const GET = withApiHandler(async (_req: NextRequest, context) => {
  const user = await requireAuth();
  const id = idSchema.parse(context?.params?.id);

  const consultation = await consultationService.getConsultation(
    { id: user.id, role: user.role },
    id
  );

  return { data: consultation };
});

export const PATCH = withApiHandler(async (req: NextRequest, context) => {
  const user = await requireAuth([ROLES.CLINICIAN, ROLES.ADMIN]);
  const id = idSchema.parse(context?.params?.id);
  const body = await req.json();
  const input = updateConsultationSchema.parse(body);

  const updated = await consultationService.updateConsultation(
    { id: user.id, role: user.role },
    id,
    input
  );

  return { data: updated };
});
