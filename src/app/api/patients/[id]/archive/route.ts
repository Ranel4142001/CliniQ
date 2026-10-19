import { NextRequest } from "next/server";
import { withApiHandler } from "@/shared/lib/api-handler";
import { requireAuth } from "@/features/auth/utils/auth-guards";
import { patientService } from "@/features/patients/services/patient.service";
import { ROLES } from "@/shared/constants/roles";

export const PATCH = withApiHandler(async (_req: NextRequest, context) => {
  const profile = await requireAuth([ROLES.ADMIN, ROLES.STAFF]);
  const id = context?.params?.id as string;
  const archived = await patientService.archivePatient(
    profile.role,
    profile.id,
    id
  );
  return { data: archived };
});
