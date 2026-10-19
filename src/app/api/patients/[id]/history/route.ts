import { NextRequest } from "next/server";
import { withApiHandler } from "@/shared/lib/api-handler";
import { requireAuth } from "@/features/auth/utils/auth-guards";
import { patientService } from "@/features/patients/services/patient.service";

export const GET = withApiHandler(async (_req: NextRequest, context) => {
  const profile = await requireAuth();
  const id = context?.params?.id as string;
  const history = await patientService.getPatientHistory(
    profile.role,
    profile.id,
    id
  );
  return { data: history };
});
