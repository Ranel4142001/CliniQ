import { NextRequest } from "next/server";
import { withApiHandler } from "@/shared/lib/api-handler";
import { requireAuth } from "@/features/auth/utils/auth-guards";
import { patientService } from "@/features/patients/services/patient.service";
import { editPatientSchema } from "@/features/patients/schemas/patient.schema";

export const GET = withApiHandler(async (_req: NextRequest, context) => {
  const profile = await requireAuth();
  const id = context?.params?.id as string;
  const patient = await patientService.getPatient(profile.role, profile.id, id);
  return { data: patient };
});

export const PATCH = withApiHandler(async (req: NextRequest, context) => {
  const profile = await requireAuth();
  const id = context?.params?.id as string;
  const body = await req.json();
  const input = editPatientSchema.parse(body);

  const updated = await patientService.updatePatient(
    profile.role,
    profile.id,
    id,
    input
  );
  return { data: updated };
});
