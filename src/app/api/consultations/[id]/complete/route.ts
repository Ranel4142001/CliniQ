import { NextRequest } from "next/server";
import { withApiHandler } from "@/shared/lib/api-handler";
import { requireAuth } from "@/features/auth/utils/auth-guards";
import { consultationService } from "@/features/consultations/services/consultation.service";
import { completeConsultationSchema } from "@/features/consultations/schemas/consultation.schema";
import { ROLES } from "@/shared/constants/roles";
import { z } from "zod";

export const dynamic = "force-dynamic";

const idSchema = z.string().uuid("Invalid consultation ID");

export const POST = withApiHandler(async (req: NextRequest, context) => {
  const user = await requireAuth([ROLES.CLINICIAN, ROLES.ADMIN]);
  const id = idSchema.parse(context?.params?.id);
  const body = await req.json();
  const input = completeConsultationSchema.parse(body);

  const completed = await consultationService.completeConsultation(
    { id: user.id, role: user.role },
    id,
    input
  );

  return { data: completed };
});
